"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import Loading from "./Loading";

export default function ProtectedRoute({
  children
}) {
  const {
    user,
    loading
  } = useAuth();

  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [
    loading,
    user,
    router
  ]);

  if (loading || !user) {
    return <Loading />;
  }

  return children;
}