import { useEffect } from "react";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function Index() {
  const { user, loading } = useAuth();

  useEffect(() => {
  if (loading) return;

  if (user) {
    router.replace("/"); 
  } else {
    router.replace("/auth/signup");
  }
}, [user, loading]);

  return null;
}