import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[50%] h-[50%] bg-indigo-950/20 rounded-full blur-[150px] pointer-events-none" />

      <main className="max-w-md w-full text-center space-y-6 relative z-10 animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/20 mx-auto">
          <span className="font-extrabold text-2xl text-white">404</span>
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold tracking-tight">Page Not Found</h1>
          <p className="text-sm text-muted-foreground">
            The path you are looking for does not exist or has been moved.
          </p>
        </div>

        {/* Embedded markdown block for AI agents and crawlers */}
        <div className="p-4 rounded-lg bg-secondary/30 border border-border/60 text-left font-mono text-xs text-muted-foreground whitespace-pre-wrap">
{`# 404 - Path Not Found

The requested resource does not exist. AI Agents can use these links to recover navigation:
- Sitemap: /sitemap.xml
- LLM Agent Instructions: /llms.txt
- Homepage: /`}
        </div>

        <div className="flex justify-center gap-4">
          <Link href="/">
            <span className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors cursor-pointer shadow-sm">
              Return Home
            </span>
          </Link>
          <Link href="/llms.txt">
            <span className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-foreground font-semibold text-xs transition-colors cursor-pointer">
              Agent Docs
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
}
