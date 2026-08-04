import time
import httpx
import jwt
from jwt.algorithms import RSAAlgorithm
from jwt.exceptions import PyJWTError, ExpiredSignatureError, InvalidIssuerError
from fastapi import HTTPException, status
from src.core.config import settings

class ClerkTokenVerifier:
    _jwks_cache = None
    _jwks_last_fetched = 0
    _cache_ttl = 3600  # Cache keys for 1 hour

    @classmethod
    async def get_jwks(cls) -> dict:
        """
        Fetches the public JWKS keys from the Clerk endpoint, with caching.
        """
        now = time.time()
        if cls._jwks_cache is None or now - cls._jwks_last_fetched > cls._cache_ttl:
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.get(settings.CLERK_JWKS_URL, timeout=10.0)
                    response.raise_for_status()
                    cls._jwks_cache = response.json()
                    cls._jwks_last_fetched = now
            except Exception as e:
                # Fallback to expired cache if fetching fails
                if cls._jwks_cache is not None:
                    return cls._jwks_cache
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Failed to retrieve identity signature keys from authentication provider."
                ) from e
        return cls._jwks_cache

    @classmethod
    async def verify_token(cls, token: str) -> dict:
        """
        Decodes the Clerk JWT, verifies its signature against the JWKS public keys,
        and validates required claims (expiration, issuer, etc.).
        """
        try:
            unverified_header = jwt.get_unverified_header(token)
            kid = unverified_header.get("kid")
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token format."
            ) from e

        jwks = await cls.get_jwks()
        keys = jwks.get("keys", [])
        
        # Find matching JWK key ID
        rsa_key = None
        for key in keys:
            if key.get("kid") == kid:
                rsa_key = key
                break

        if not rsa_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Signature key not found or expired."
            )

        try:
            # Construct public key in PEM format from JWK key parts
            public_key = RSAAlgorithm.from_jwk(rsa_key)
            
            # Decode and verify token properties
            payload = jwt.decode(
                token,
                public_key,
                algorithms=["RS256"],
                issuer=settings.CLERK_ISSUER_URL,
                options={
                    "verify_signature": True,
                    "verify_exp": True,
                    "verify_nbf": True,
                    "verify_iss": True,
                    "require": ["exp", "nbf", "iss", "sub"]
                }
            )
            return payload
            
        except ExpiredSignatureError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session has expired. Please sign in again."
            ) from e
        except InvalidIssuerError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token issuer is invalid."
            ) from e
        except PyJWTError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Identity verification failed."
            ) from e
