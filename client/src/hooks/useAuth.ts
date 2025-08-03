import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { loginSchema, type LoginData, type Staff } from "@shared/schema";

interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  designation: string;
  department: string;
  isAdmin: boolean;
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const result = loginSchema.parse(data);
      const res = await apiRequest("POST", "/api/auth/login", result);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/logout");
      return res.json();
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.clear();
    },
  });

  return {
    user: user as AuthUser | null,
    isLoading: isLoadingUser,
    isLoggedIn: !!user,
    isAdmin: (user as any)?.isAdmin || false,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error?.message,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}