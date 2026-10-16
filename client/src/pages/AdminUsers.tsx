import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<{ id: number; name: string } | null>(null);
  const [actionType, setActionType] = useState<"block" | "unblock" | "role" | null>(null);
  const [newRole, setNewRole] = useState<string>("");
  const { toast } = useToast();

  const { data: users = [], refetch, isLoading, error } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch users: ${res.status}`);
      }
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  // Fix: Move all hooks before early returns
  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: number; status: string }) => {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update user status");
      return await res.json();
    },
    onSuccess: () => {
      refetch();
      toast({ title: "Success", description: "User status updated successfully" });
      setSelectedUser(null);
      setActionType(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error("Failed to update user role");
      return await res.json();
    },
    onSuccess: () => {
      refetch();
      toast({ title: "Success", description: "User role updated successfully" });
      setSelectedUser(null);
      setActionType(null);
      setNewRole("");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Early returns after all hooks
  if (isLoading) {
    return (
      <AdminLayout title="Users">
        <div className="flex justify-center items-center py-20">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Users">
        <div className="flex flex-col justify-center items-center py-20 space-y-4">
          <div className="text-destructive font-semibold">Error loading users</div>
          <div className="text-muted-foreground text-sm">{error instanceof Error ? error.message : "Please try again."}</div>
          <div className="text-xs text-muted-foreground">Make sure you are logged in as an admin user.</div>
        </div>
      </AdminLayout>
    );
  }

  const filteredUsers = users.filter(
    (user: any) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBlock = (user: any) => {
    setSelectedUser({ id: user.id, name: user.name });
    setActionType(user.status === "blocked" ? "unblock" : "block");
  };

  const handleRoleChange = (user: any) => {
    setSelectedUser({ id: user.id, name: user.name });
    setNewRole(user.role);
    setActionType("role");
  };

  const confirmAction = () => {
    if (!selectedUser) return;
    
    if (actionType === "block") {
      updateStatusMutation.mutate({ userId: selectedUser.id, status: "blocked" });
    } else if (actionType === "unblock") {
      updateStatusMutation.mutate({ userId: selectedUser.id, status: "active" });
    } else if (actionType === "role" && newRole) {
      updateRoleMutation.mutate({ userId: selectedUser.id, role: newRole });
    }
  };

  return (
    <AdminLayout title="Users">
      <p className="text-muted-foreground mb-6">Manage user accounts and permissions</p>
      <div className="bg-secondary/30 rounded-2xl border border-border/60 p-4 mb-6 flex items-center gap-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          className="border-0 bg-transparent focus-visible:ring-0"
          placeholder="Search users"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Card className="border border-border/60">
        <CardContent className="p-0">
          <div className="grid grid-cols-6 gap-4 p-4 border-b text-sm font-medium text-muted-foreground">
            <div>User</div>
            <div>Email</div>
            <div>Phone</div>
            <div>Role</div>
            <div>Status</div>
            <div className="text-right">Actions</div>
          </div>
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No users found</div>
          ) : (
            filteredUsers.map((user: any) => (
              <div key={user.id} className="grid grid-cols-6 gap-4 p-4 border-b last:border-b-0 text-sm">
                <div className="font-medium">{user.name}</div>
                <div className="text-primary">{user.email || "N/A"}</div>
                <div className="text-muted-foreground">{user.phone || "N/A"}</div>
                <div>
                  <span className="px-3 py-1 rounded-full bg-secondary/40">{user.role}</span>
                </div>
                <div>
                  <span
                    className={`px-3 py-1 rounded-full ${
                      user.status === "blocked" ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"
                    }`}
                  >
                    {user.status || "active"}
                  </span>
                </div>
                <div className="text-right flex gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleBlock(user)}
                    className={user.status === "blocked" ? "text-primary" : "text-destructive"}
                  >
                    {user.status === "blocked" ? "Unblock" : "Block"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRoleChange(user)}
                  >
                    Change Role
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!selectedUser && (actionType === "block" || actionType === "unblock" || actionType === "role")}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "block" ? "Block User" : actionType === "unblock" ? "Unblock User" : "Change User Role"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "role" ? (
                <div className="space-y-4 mt-4">
                  <Select value={newRole} onValueChange={setNewRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="gardener">Gardener</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <p>Change role for {selectedUser?.name}?</p>
                </div>
              ) : (
                `Are you sure you want to ${actionType === "block" ? "block" : "unblock"} ${selectedUser?.name}?`
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setSelectedUser(null); setActionType(null); setNewRole(""); }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmAction} 
              disabled={updateStatusMutation.isPending || updateRoleMutation.isPending || (actionType === "role" && !newRole)}
            >
              {(updateStatusMutation.isPending || updateRoleMutation.isPending) ? "Updating..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
