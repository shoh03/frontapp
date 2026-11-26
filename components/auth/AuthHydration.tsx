"use client";

import useAuthStore from "@/stores/useAuthStore";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getCurrentUserApi } from "@/api/auth/auth.api";

export default function AuthHydration() {
  const pathname = usePathname();

  useEffect(() => {
    const controller = new AbortController();
    const version = useAuthStore.getState().sessionVersion;
    const checkAuthApi = async () => {
      try {
        const user = await getCurrentUserApi(controller.signal);
        const state = useAuthStore.getState();
        if (!controller.signal.aborted && state.sessionVersion === version) {
          state.setSession(user);
        }
      } catch {
        // 취소된 요청이나 일시적 통신 장애를 로그아웃으로 오인하지 않습니다.
        // 인증 실패(401/403)는 getCurrentUserApi가 null로 반환합니다.
      }
    };

    void checkAuthApi();
    return () => controller.abort();
  }, [pathname]);

  return null;
}
