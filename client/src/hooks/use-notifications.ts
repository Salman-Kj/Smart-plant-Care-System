import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type Notification = {
  id: number;
  userId: number;
  type: string;
  relatedId: number | null;
  message: string;
  read: boolean;
  createdAt: string;
};

const NOTIFICATIONS_KEY = ["/api/notifications"];
const UNREAD_COUNT_KEY = ["/api/notifications/unread-count"];

async function fetchNotifications(): Promise<Notification[]> {
  const res = await fetch("/api/notifications", { credentials: "include" });
  if (res.status === 401) return [];
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}

async function fetchUnreadCount(): Promise<{ count: number }> {
  const res = await fetch("/api/notifications/unread-count", { credentials: "include" });
  if (res.status === 401) return { count: 0 };
  if (!res.ok) return { count: 0 };
  return res.json();
}

async function markNotificationRead(id: number): Promise<Notification> {
  const res = await fetch(`/api/notifications/${id}/read`, {
    method: "PUT",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to mark as read");
  return res.json();
}

export function useNotifications(enabled: boolean) {
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: fetchNotifications,
    enabled,
  });

  const unreadQuery = useQuery({
    queryKey: UNREAD_COUNT_KEY,
    queryFn: fetchUnreadCount,
    enabled,
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
    },
  });

  const notifications = notificationsQuery.data ?? [];
  const unreadCount = unreadQuery.data?.count ?? 0;

  return {
    notifications,
    unreadCount,
    isLoading: notificationsQuery.isLoading,
    markRead: markReadMutation.mutate,
    refetch: notificationsQuery.refetch,
  };
}
