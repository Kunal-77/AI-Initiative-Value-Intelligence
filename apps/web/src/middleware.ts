import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define public routes that do not require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/about",
  "/contact",
  "/privacy",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/forgot-password(.*)",
  "/sso-callback(.*)",
  "/api/v1/health",
  "/.well-known/mcp(.*)",
  "/llms.txt",
  "/sitemap.xml"
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  // Content negotiation on the root "/" path
  if (request.nextUrl.pathname === "/") {
    const acceptHeader = request.headers.get("accept") || "";
    if (acceptHeader.includes("text/markdown")) {
      const response = NextResponse.rewrite(new URL("/llms.txt", request.url));
      response.headers.set("Content-Type", "text/markdown; charset=utf-8");
      response.headers.set("Vary", "Accept, Accept-Encoding");
      return response;
    } else {
      const response = NextResponse.next();
      response.headers.set("Vary", "Accept, Accept-Encoding");
      return response;
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:css|js|gif|svg|png|jpg|jpeg|webp|woff2?)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
