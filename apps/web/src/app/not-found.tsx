import Link from "next/link";
import { ArrowLeft, Home, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0B0D11] text-[#F4F1EA] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#7DA7D9]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[50%] h-[50%] bg-[#C9A86A]/5 rounded-full blur-[150px] pointer-events-none" />

      <main className="max-w-md w-full text-center space-y-6 relative z-10 animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#7DA7D9] to-[#4F759B] flex items-center justify-center shadow-lg shadow-[#7DA7D9]/20 mx-auto">
          <span className="font-extrabold text-2xl text-[#0B0D11]">404</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-[#F4F1EA]">Route Not Found</h1>
          <p className="text-xs text-[#8F98A8]">
            The requested intelligence resource does not exist or has been relocated within the workspace enclave.
          </p>
        </div>

        {/* Embedded markdown block for AI agents and crawlers */}
        <div className="p-4 rounded-xl bg-[#11151C] border border-[#202630] text-left font-mono text-[11px] text-[#8F98A8] whitespace-pre-wrap">
{`# 404 - Resource Unresolved

Navigation recovery endpoints:
- Homepage: /
- Workspace Selector: /workspace-select
- Personal Workspace: /personal
- Business Workspace: /business/initiatives`}
        </div>

        <div className="flex justify-center gap-3">
          <Link href="/">
            <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#7DA7D9] hover:bg-[#A5C3E8] text-[#0B0D11] font-bold text-xs transition-colors cursor-pointer shadow-sm">
              <Home className="w-3.5 h-3.5" />
              Return Home
            </span>
          </Link>
          <Link href="/workspace-select">
            <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#171C24] hover:bg-[#202630] border border-[#202630] hover:border-[#7DA7D9]/30 text-[#F4F1EA] font-semibold text-xs transition-colors cursor-pointer">
              <Compass className="w-3.5 h-3.5 text-[#7DA7D9]" />
              Workspaces
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
}
