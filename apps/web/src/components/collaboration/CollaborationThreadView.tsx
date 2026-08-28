"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Sparkles, Send, CheckCircle2, CornerDownRight, Smile, Loader2 } from "lucide-react";
import { CollaborationComment } from "../../types/collaboration";
import { Input, Button, Badge } from "../ui";
import { useInView } from "@/hooks/useInView";

export interface CollaborationThreadViewProps {
  comments: CollaborationComment[];
  onAddComment: (content: string, mentions?: string[]) => Promise<void>;
  onToggleReaction: (commentId: string, emoji: string) => Promise<void>;
}

export function CollaborationThreadView({
  comments,
  onAddComment,
  onToggleReaction,
}: CollaborationThreadViewProps) {
  const [newContent, setNewContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(10);

  useEffect(() => {
    setDisplayLimit(10);
  }, [comments.length]);

  const visibleComments = comments.slice(0, displayLimit);

  const [sentinelRef, inView] = useInView({
    rootMargin: "100px",
    triggerOnce: false,
  });

  useEffect(() => {
    if (inView && visibleComments.length < comments.length) {
      setDisplayLimit((prev) => Math.min(prev + 10, comments.length));
    }
  }, [inView, comments.length, visibleComments.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    setSubmitting(true);
    try {
      await onAddComment(newContent);
      setNewContent("");
    } catch (err: any) {
      alert(err.message || "Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-bold text-foreground">Collaboration Center & Threaded Discussions</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
          {comments.length} Open Threads
        </span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {visibleComments.map((cmt) => (
          <div key={cmt.id} className="p-4 rounded-lg bg-secondary/30 border border-border space-y-2 text-xs">
            <div className="flex justify-between items-center text-[10px]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-accent/15 text-accent border border-accent/30 font-bold flex items-center justify-center text-[10px]">
                  {cmt.authorInitials}
                </div>
                <div>
                  <span className="font-bold text-foreground">{cmt.authorName}</span>
                  <span className="text-muted-foreground font-normal ml-1">({cmt.authorRole})</span>
                </div>
              </div>
              <span className="font-mono text-muted-foreground">
                {new Date(cmt.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>

            <p className="text-muted-foreground leading-relaxed text-[11px] pl-8">{cmt.content}</p>

            {/* Reactions Bar */}
            <div className="flex items-center gap-2 pl-8 pt-1 text-[10px]">
              {cmt.reactions.map((r, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onToggleReaction(cmt.id, r.emoji)}
                  className="px-2 py-0.5 rounded bg-card hover:bg-secondary border border-border font-bold flex items-center gap-1 transition-colors"
                >
                  <span>{r.emoji}</span>
                  <span className="text-muted-foreground font-mono">{r.count}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => onToggleReaction(cmt.id, "👍")}
                className="text-muted-foreground hover:text-foreground p-0.5 rounded"
                title="Add Reaction"
              >
                <Smile className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Nested Thread Replies */}
            {cmt.replies.map((rep) => (
              <div key={rep.id} className="ml-8 mt-2 p-2.5 rounded bg-card border border-border space-y-1 text-[11px]">
                <div className="flex justify-between items-center text-[9px]">
                  <span className="font-bold text-foreground flex items-center gap-1">
                    <CornerDownRight className="w-3 h-3 text-muted-foreground" /> {rep.authorName}
                  </span>
                  <span className="font-mono text-muted-foreground">{rep.timestamp}</span>
                </div>
                <p className="text-muted-foreground pl-4">{rep.content}</p>
              </div>
            ))}
          </div>
        ))}

        {visibleComments.length < comments.length && (
          <div ref={sentinelRef} className="py-2.5 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground font-mono">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
            <span>Loading more threads...</span>
          </div>
        )}
      </div>

      {/* Post New Comment Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 pt-2 border-t border-border/60">
        <Input
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Post executive comment or mention (@Sarah Jenkins)..."
          className="text-xs h-9"
        />
        <Button type="submit" loading={submitting} variant="primary" className="text-xs h-9 px-4">
          <Send className="w-3.5 h-3.5 mr-1" /> Post
        </Button>
      </form>
    </div>
  );
}
