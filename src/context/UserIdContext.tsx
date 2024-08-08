"use client";

import { createContext, useContext, ReactNode } from "react";
import { useUserId } from "@/hooks/useUserId";

const UserIdContext = createContext<string | null>(null);

export function UserIdProvider({ children }: { children: ReactNode }) {
  const userId = useUserId();

  return (
    <UserIdContext.Provider value={userId}>{children}</UserIdContext.Provider>
  );
}

export function useUserIdContext() {
  return useContext(UserIdContext);
}
