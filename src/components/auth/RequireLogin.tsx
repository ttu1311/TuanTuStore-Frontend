"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingState from "@/components/ui/LoadingState";
import { useStore } from "@/context/StoreContext";

// Shows its content only to a logged-in user. Visitors are sent to /dang-nhap.
// While localStorage is being read, only a loading message is shown, so the protected content never flashes.
// NOTE: this is a front-end demo. It improves the user experience but is NOT real security.
export default function RequireLogin({ children }: { children: React.ReactNode }) {
  const { isReady, currentUser } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (isReady && !currentUser) router.replace("/dang-nhap");
  }, [isReady, currentUser, router]);

  if (!isReady || !currentUser) return <LoadingState />;
  return <>{children}</>;
}
