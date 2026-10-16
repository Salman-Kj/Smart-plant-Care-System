import { useNotifications } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  enabled: boolean;
  className?: string;
};

export function NotificationBell({ enabled, className }: Props) {
  const { notifications, unreadCount, markRead } = useNotifications(enabled);

  if (!enabled) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative rounded-full shrink-0 ${className ?? ""}`}
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 !z-[9999]" align="end" forceMount>
        <div className="p-2 font-semibold text-sm border-b">Notifications</div>
        <ScrollArea className="h-[280px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground text-center">
              No notifications yet.
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => markRead(n.id)}
                  onKeyDown={(e) => e.key === "Enter" && markRead(n.id)}
                  className={`rounded-lg p-3 text-left text-sm cursor-pointer hover:bg-muted/80 ${
                    !n.read ? "bg-primary/5 border-l-2 border-primary" : ""
                  }`}
                >
                  <p className="font-medium">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
