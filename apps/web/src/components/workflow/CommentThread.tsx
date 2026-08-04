"use client";

import React, { useState } from "react";
import { MessageSquare, Sparkles, User, Send } from "lucide-react";
import { WorkflowComment } from "../../types/workflow";
import { Input, Button } from "../ui";

export interface CommentThreadProps {
  comments: WorkflowComment[];
  onAddComment?: (text: string) => void;
}

export function CommentThread({ comments, onAddComment }: CommentThreadProps) {
  const [newComment, setNewComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !onAddComment) return;
    onAddComment(newComment);
    setNewComment("");
  };

  return (
    <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-bold text-foreground">Governance Discussion & Review Thread</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
          {comments.length} Comments
        </span>
      </div>

      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
        {comments.map((cmt) => {
          const isAi = cmt.role === "AI Engine";
          return (
            <div
              key={cmt.id}
              className={`p-3 rounded-lg border text-xs space-y-1 ${
                isAi ? "bg-accent/10 border-accent/30" : "bg-secondary/30 border-border"
              }`}
            >
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-bold text-foreground flex items-center gap-1">
                  {isAi && <Sparkles className="w-3 h-3 text-accent" />}
                  {cmt.author} <span className="font-normal text-muted-foreground">({cmt.role})</span>
                </span>
                <span className="font-mono text-muted-foreground">
                  {new Date(cmt.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed text-[11px]">{cmt.content}</p>
            </div>
          );
        })}
      </div>

      {onAddComment && (
        <form onSubmit={handleSubmit} className="flex gap-2 pt-2 border-t border-border/60">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add executive comment or mention (@Finance)..."
            className="text-xs h-8"
          />
          <Button type="submit" variant="primary" className="text-xs h-8 px-3">
            <Send className="w-3 h-3" />
          </Button>
        </form>
      )}
    </div>
  );
}
