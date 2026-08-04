/**
 * Strongly Typed Interfaces for Collaboration Center & Threaded Discussions
 */

export interface ReactionItem {
  emoji: string;
  count: number;
  users: string[];
}

export interface ThreadReply {
  id: string;
  authorName: string;
  authorInitials: string;
  content: string;
  timestamp: string;
}

export interface CollaborationComment {
  id: string;
  entityId: string;
  entityName: string;
  authorName: string;
  authorRole: string;
  authorInitials: string;
  content: string;
  timestamp: string;
  reactions: ReactionItem[];
  replies: ThreadReply[];
  isResolved: boolean;
  mentions: string[];
}

export interface MentionUser {
  id: string;
  name: string;
  email: string;
}
