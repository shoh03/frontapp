"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { logoutApi } from "@/api/auth/auth.api";
import LoginButton from "@/components/common/LoginButton";
import useAuthStore from "@/stores/useAuthStore";

export default function UserAccountMenu() {
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [error, setError] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuId = useId();

    // 메뉴 바깥 클릭과 Escape 키로 닫습니다. 닫혀 있으면 이벤트를 등록하지 않습니다.
    useEffect(() => {
        if (!isOpen || !isAuthenticated) return;

        function handlePointerDown(event: PointerEvent) {
            if (!containerRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setIsOpen(false);
                triggerRef.current?.focus();
            }
        }

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, isAuthenticated]);

    async function handleLogout() {
        if (isLoggingOut) return;
        setError("");
        setIsLoggingOut(true);

        try {
            // 표시 이름과 관계없이 마이페이지와 같은 쿠키 기반 로그아웃 API를 호출합니다.
            const result = await logoutApi();
            if (!result.success) {
                throw new Error(result.message || "로그아웃하지 못했습니다. 다시 시도해 주세요.");
            }

            // 서버에서 쿠키를 정리한 뒤 화면의 로그인 정보와 회원 데이터 캐시도 비웁니다.
            await queryClient.cancelQueries();
            useAuthStore.getState().setSession(null);
            queryClient.clear();
            setIsOpen(false);
            router.replace("/");
            router.refresh();
        } catch {
            setError("로그아웃하지 못했습니다. 잠시 후 다시 시도해 주세요.");
        } finally {
            setIsLoggingOut(false);
        }
    }

    if (!isAuthenticated) {
        return <LoginButton className="justify-self-end" />;
    }

    // 로그인했지만 이름이 아직 없을 때만 임시 이름을 표시합니다.
    const userName = user?.user_name?.trim() || user?.user_nickname?.trim() || "ooo";

    return (
        <div
            ref={containerRef}
            className="relative w-44 justify-self-end font-pretendard"
            onBlur={(event) => {
                // 로그아웃 버튼을 잠시 비활성화하면 포커스 대상이 null이 될 수 있습니다.
                // 실제로 다른 요소로 이동했을 때만 닫아 실패 메시지가 가려지지 않게 합니다.
                if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) {
                    setIsOpen(false);
                }
            }}>
            <div className={isOpen ? "absolute inset-x-0 top-0 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-lg" : ""}>
                <button
                    ref={triggerRef}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={menuId}
                    aria-label={`${userName}님 사용자 메뉴`}
                    onClick={() => {
                        setError("");
                        setIsOpen((open) => !open);
                    }}
                    className="flex min-h-11 w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-slate-800 outline-offset-2 transition-colors hover:bg-brand-subtle focus-visible:outline-2 focus-visible:outline-primary">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-subtle text-primary">
                        <UserRound className="size-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-left" title={`${userName}님`}>{userName}님</span>
                    <ChevronDown className={`size-4 shrink-0 transition-transform motion-reduce:transition-none ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                </button>
                {isOpen && (
                    <div id={menuId} className="space-y-1 border-t border-slate-100 p-2">
                        <Link
                            href="/my"
                            onClick={() => setIsOpen(false)}
                            className="flex min-h-10 items-center gap-2 rounded-lg bg-brand-subtle px-3 text-sm font-medium text-slate-800 hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-primary">
                            <UserRound className="size-4 shrink-0" aria-hidden="true" />
                            마이페이지
                        </Link>
                        <button
                            type="button"
                            disabled={isLoggingOut}
                            onClick={handleLogout}
                            className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-50">
                            <LogOut className="size-4 shrink-0" aria-hidden="true" />
                            {isLoggingOut ? "로그아웃 중…" : "로그아웃"}
                        </button>
                        {error && <p role="alert" className="px-2 pb-1 text-xs leading-5 text-red-600">{error}</p>}
                    </div>
                )}
            </div>
            {/* 펼친 메뉴가 헤더 높이를 바꾸지 않도록 버튼 높이만 확보합니다. */}
            {isOpen && <div className="h-11" aria-hidden="true" />}
        </div>
    );
}
