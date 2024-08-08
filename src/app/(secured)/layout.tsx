"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserAuth } from "@/context/AuthContext"; // Adjust the import path based on your project structure
import Navbar from "@/components/navbar";

export default function SecuredLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading }: any = UserAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [loading, user, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null; // This will not be rendered as the user is redirected to the root URL.
  }

  return <>{children}</>;
}
