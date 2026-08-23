"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import Loading from "./Loading";

export default function AdminRoute({
  children
}) {
  const {
    user,
    loading
  } = useAuth();

  const router = useRouter();

  useEffect(() => {
    if (
      !loading &&
      (!user || user.role !== "admin")
    ) {
      router.replace("/");
    }
  }, [
    loading,
    user,
    router
  ]);

  if (
    loading ||
    !user ||
    user.role !== "admin"
  ) {
    return <Loading />;
  }

  return children;
}