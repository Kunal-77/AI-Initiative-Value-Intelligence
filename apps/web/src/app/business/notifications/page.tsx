"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  AppHeader,
  NotificationCenterDrawer,
  NotificationPreferencesCard,
  AutomationRulesCard,
  CollaborationThreadView,
  UnifiedLifecycleBar,
  CrossModuleNav,
  SkeletonMetricsRow,
} from "@/components/ui";
import {
  getNotifications,
  getNotificationPreferences,
  markNotificationAsRead,
  toggleNotificationPin,
} from "@/services/notifications/notificationService";
import {
  getCollaborationThreads,
  addCollaborationComment,
  toggleReaction,
} from "@/services/collaboration/collaborationService";
import { NotificationItem, NotificationPreference } from "@/types/notification";
import { CollaborationComment } from "@/types/collaboration";

export default function BusinessNotificationsPage() {
  const { orgId } = useAuth();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [comments, setComments] = useState<CollaborationComment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [nRes, pRes, cRes] = await Promise.all([
        getNotifications(),
        getNotificationPreferences(),
        getCollaborationThreads("init_cs_auto"),
      ]);
      setNotifications(nRes);
      setPreferences(pRes);
      setComments(cRes);
    } catch (err) {
      console.error("Notifications fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orgId) {
      loadData();
    }
  }, [orgId]);

  const handleMarkRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleTogglePin = async (id: string) => {
    await toggleNotificationPin(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
  };

  const handleAddComment = async (content: string) => {
    const newComment = await addCollaborationComment("init_cs_auto", content);
    setComments((prev) => [newComment, ...prev]);
  };

  const handleToggleReaction = async (commentId: string, emoji: string) => {
    await toggleReaction(commentId, emoji);
    setComments((prev) => [...prev]);
  };

  if (!orgId || loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
        <AppHeader badge="Notifications & Automation" />
        <main className="flex-1 max-w-[1536px] w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
          <SkeletonMetricsRow />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors">
      <AppHeader badge="Notifications & Automation" />

      <main className="flex-1 max-w-[1536px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Phase 7: Unified Lifecycle Navigation Bar */}
        <UnifiedLifecycleBar activeStep="initiative" />

        {/* Phase 7: Contextual Cross-Module Navigation */}
        <CrossModuleNav />

        {/* Main Grid: Notifications & Collaboration (Left 8) | Automation & Preferences (Right 4) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-6">
            {/* Enterprise Notification Center */}
            <NotificationCenterDrawer
              notifications={notifications}
              onMarkRead={handleMarkRead}
              onTogglePin={handleTogglePin}
            />

            {/* Collaboration Center & Threaded Discussions */}
            <CollaborationThreadView
              comments={comments}
              onAddComment={handleAddComment}
              onToggleReaction={handleToggleReaction}
            />
          </div>

          <div className="lg:col-span-4 space-y-6">
            {/* Event-Driven Automation Center Rules */}
            <AutomationRulesCard />

            {/* Enterprise Channel Delivery Preferences */}
            <NotificationPreferencesCard preferences={preferences} />
          </div>
        </div>
      </main>
    </div>
  );
}
