import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      endpoints: {
        sse: "https://ai-initiative-value-intelligence-we.vercel.app/api/mcp/sse",
        tools: "https://ai-initiative-value-intelligence-we.vercel.app/api/mcp/tools"
      },
      manifest: {
        name: "Value Intelligence MCP Server Discovery Manifest",
        version: "1.0.0",
        description: "Discovery and capability descriptor manifest for the Value Intelligence Model Context Protocol (MCP) server endpoints.",
        info: "This endpoint provides discovery configurations for AI agents to locate tool execution and SSE connection targets. It does not implement full protocol transport itself.",
        capabilities: {
          tools: {
            listChanged: false
          }
        }
      }
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Cache-Control": "public, max-age=3600"
      }
    }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
