import os
import uuid
import pathlib
from abc import ABC, abstractmethod
from typing import Optional

class StorageService(ABC):
    @abstractmethod
    def upload_file(self, object_key: str, file_bytes: bytes) -> None:
        """
        Uploads file bytes to the storage provider under the specified object key.
        """
        pass

    @abstractmethod
    def download_file(self, object_key: str) -> bytes:
        """
        Downloads and returns the file bytes for the specified object key.
        """
        pass

    @abstractmethod
    def delete_file(self, object_key: str) -> None:
        """
        Deletes the file at the specified object key.
        """
        pass

class LocalStorageProvider(StorageService):
    def __init__(self, base_directory: Optional[str] = None):
        if base_directory is None:
            # Default to storage directory inside the project root
            base_directory = os.path.abspath(
                os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "storage")
            )
        self.base_dir = pathlib.Path(base_directory)
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def _resolve_path(self, object_key: str) -> pathlib.Path:
        # Enforce key containment under base_dir to prevent directory traversal
        safe_path = (self.base_dir / object_key).resolve()
        if not safe_path.is_relative_to(self.base_dir.resolve()):
            raise ValueError("Directory traversal attempt detected.")
        return safe_path

    def upload_file(self, object_key: str, file_bytes: bytes) -> None:
        target_path = self._resolve_path(object_key)
        target_path.parent.mkdir(parents=True, exist_ok=True)
        target_path.write_bytes(file_bytes)

    def download_file(self, object_key: str) -> bytes:
        target_path = self._resolve_path(object_key)
        if not target_path.exists() or not target_path.is_file():
            raise FileNotFoundError(f"Object {object_key} not found in local storage.")
        return target_path.read_bytes()

    def delete_file(self, object_key: str) -> None:
        target_path = self._resolve_path(object_key)
        if target_path.exists() and target_path.is_file():
            target_path.unlink()

class S3CompatibleStorageProvider(StorageService):
    def __init__(self, bucket_name: str, endpoint_url: Optional[str] = None, aws_access_key_id: Optional[str] = None, aws_secret_access_key: Optional[str] = None):
        import boto3
        self.bucket = bucket_name
        self.client = boto3.client(
            "s3",
            endpoint_url=endpoint_url,
            aws_access_key_id=aws_access_key_id,
            aws_secret_access_key=aws_secret_access_key
        )

    def upload_file(self, object_key: str, file_bytes: bytes) -> None:
        self.client.put_object(
            Bucket=self.bucket,
            Key=object_key,
            Body=file_bytes
        )

    def download_file(self, object_key: str) -> bytes:
        response = self.client.get_object(
            Bucket=self.bucket,
            Key=object_key
        )
        return response["Body"].read()

    def delete_file(self, object_key: str) -> None:
        self.client.delete_object(
            Bucket=self.bucket,
            Key=object_key
        )

# Factory function to resolve configured storage service
def get_storage_service() -> StorageService:
    # Use LocalStorageProvider by default or during testing/development
    # Deployments can override via settings/env variables
    return LocalStorageProvider()
