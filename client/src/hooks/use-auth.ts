import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertUser } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { cleanupStuckOverlays } from "@/lib/overlay-cleanup";

export function useAuth() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const userQuery = useQuery({
    queryKey: [api.auth.me.path],
    queryFn: async () => {
      const res = await fetch(api.auth.me.path, { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch user");
      return api.auth.me.responses[200].parse(await res.json());
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: Pick<InsertUser, "username" | "password"> & { role?: string }) => {
      const res = await fetch(api.auth.login.path, {
        method: api.auth.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 401) {
          throw new Error(errorData.message || "Invalid credentials");
        }
        throw new Error(errorData.message || "Login failed");
      }
      return api.auth.login.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.auth.me.path] });
      toast({ title: "Welcome back!", description: "You have successfully logged in." });
      // Cleanup any stuck overlays after login
      setTimeout(() => {
        cleanupStuckOverlays();
        document.body.classList.remove("modal-open", "overflow-hidden");
        document.body.style.pointerEvents = "auto";
        document.body.style.overflow = "";
        // Force close any open Select/Popover portals
        const selectPortals = document.querySelectorAll('[data-radix-portal], [data-radix-select-content]');
        selectPortals.forEach((el) => {
          const htmlEl = el as HTMLElement;
          if (htmlEl.getAttribute('data-state') !== 'open') {
            htmlEl.remove();
          }
        });
      }, 100);
    },
    onError: (error) => {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      const res = await fetch(api.auth.register.path, {
        method: api.auth.register.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Registration failed");
      }
      return api.auth.register.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.auth.me.path] });
      toast({ title: "Account created", description: "Welcome to PlantCare!" });
      // Cleanup any stuck overlays after registration
      setTimeout(() => {
        cleanupStuckOverlays();
        document.body.classList.remove("modal-open", "overflow-hidden");
        document.body.style.pointerEvents = "auto";
        document.body.style.overflow = "";
        // Force close any open Select/Popover portals
        const selectPortals = document.querySelectorAll('[data-radix-portal], [data-radix-select-content]');
        selectPortals.forEach((el) => {
          const htmlEl = el as HTMLElement;
          if (htmlEl.getAttribute('data-state') !== 'open') {
            htmlEl.remove();
          }
        });
      }, 100);
    },
    onError: (error) => {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch(api.auth.logout.path, {
        method: api.auth.logout.method,
        credentials: "include",
      });
    },
    onSuccess: () => {
      queryClient.setQueryData([api.auth.me.path], null);
      toast({ title: "Logged out", description: "See you soon!" });
    },
  });

  return {
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    login: loginMutation,
    register: registerMutation,
    logout: logoutMutation,
  };
}
