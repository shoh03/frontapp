import type { UserDTO } from "@/types/user/user.type";
import { create } from "zustand";
import { combine } from "zustand/middleware";

const useAuthStore = create(
    combine(
      {
        user: null as UserDTO | null,
        isAuthenticated: false as boolean,
        sessionVersion: 0,
      },
      (set) => ({
        setIsAuthenticated: (status: boolean) =>
          set({ isAuthenticated: status }),
        setUser: (user: UserDTO | null) => set({ user: user }),
        // 로그아웃 전에 시작된 조회가 뒤늦게 로그인 상태를 복원하지 않게 합니다.
        setSession: (user: UserDTO | null) => set((state) => ({
          user,
          isAuthenticated: user !== null,
          sessionVersion: state.sessionVersion + 1,
        })),
      }),
    ),
);

export default useAuthStore;
