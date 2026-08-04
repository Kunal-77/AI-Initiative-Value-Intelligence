/**
 * Collaboration Service Layer
 * Threaded discussion, mentions, and emoji reaction APIs.
 */

import { CollaborationComment, MentionUser } from "../../types/collaboration";

export const MOCK_COLLAB_COMMENTS: CollaborationComment[] = [
  {
    id: "collab_1",
    entityId: "init_cs_auto",
    entityName: "Customer Support Automation",
    authorName: "Sarah Jenkins",
    authorRole: "Chief Financial Officer",
    authorInitials: "SJ",
    content: "The Q2 deflection audit looks solid. Recommending approval of the $850k allocation upon final SOC2 sign-off.",
    timestamp: "2026-08-04T11:15:00Z",
    reactions: [
      { emoji: "👍", count: 3, users: ["Alex Rivera", "David Miller", "Marcus Vance"] },
      { emoji: "🚀", count: 2, users: ["Marcus Vance", "Alex Rivera"] },
    ],
    replies: [
      {
        id: "rep_1",
        authorName: "David Miller",
        authorInitials: "DM",
        content: "InfoSec team confirmed SOC2 report will be attached by EOD tomorrow.",
        timestamp: "2026-08-04T11:30:00Z",
      },
    ],
    isResolved: false,
    mentions: ["Alex Rivera"],
  },
  {
    id: "collab_2",
    entityId: "init_cs_auto",
    entityName: "Customer Support Automation",
    authorName: "Alex Rivera",
    authorRole: "VP of Engineering",
    authorInitials: "AR",
    content: "Dataproc serverless batch integration tests passed with zero SLA degradation on off-peak inference.",
    timestamp: "2026-08-04T12:00:00Z",
    reactions: [
      { emoji: "⚡", count: 4, users: ["Sarah Jenkins", "David Miller"] },
    ],
    replies: [],
    isResolved: true,
    mentions: [],
  },
];

export const MOCK_MENTION_USERS: MentionUser[] = [
  { id: "usr_cfo", name: "Sarah Jenkins", email: "sarah.jenkins@acme.com" },
  { id: "usr_vp_eng", name: "Alex Rivera", email: "alex.rivera@acme.com" },
  { id: "usr_cto", name: "Marcus Vance", email: "marcus.vance@acme.com" },
  { id: "usr_pm", name: "David Miller", email: "david.miller@acme.com" },
];

export async function getCollaborationThreads(entityId: string): Promise<CollaborationComment[]> {
  return MOCK_COLLAB_COMMENTS.filter((c) => c.entityId === entityId || !entityId);
}

export async function addCollaborationComment(
  entityId: string,
  content: string,
  mentions: string[] = []
): Promise<CollaborationComment> {
  const newComment: CollaborationComment = {
    id: `collab_${Date.now()}`,
    entityId,
    entityName: "Active Initiative",
    authorName: "Executive Session User",
    authorRole: "Executive Leader",
    authorInitials: "EX",
    content,
    timestamp: new Date().toISOString(),
    reactions: [],
    replies: [],
    isResolved: false,
    mentions,
  };
  MOCK_COLLAB_COMMENTS.unshift(newComment);
  return newComment;
}

export async function toggleReaction(commentId: string, emoji: string): Promise<void> {
  const cmt = MOCK_COLLAB_COMMENTS.find((c) => c.id === commentId);
  if (!cmt) return;

  const existing = cmt.reactions.find((r) => r.emoji === emoji);
  if (existing) {
    existing.count += 1;
  } else {
    cmt.reactions.push({ emoji, count: 1, users: ["Executive User"] });
  }
}
