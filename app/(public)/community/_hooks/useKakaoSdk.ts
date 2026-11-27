"use client";

import { useCallback, useEffect, useState } from "react";

const LOAD_TIMEOUT_MS = 15_000;

export type KakaoSdkStatus = "loading" | "ready" | "failed";

// next/script 의 onReady·onError 에 연결합니다. status 가 ready 면 window.kakao.maps 를 바로 쓸 수 있습니다.
export default function useKakaoSdk(enabled: boolean) {
    const [status, setStatus] = useState<KakaoSdkStatus>("loading");

    useEffect(() => {
        if (!enabled || status !== "loading") return;
        const timer = window.setTimeout(() => setStatus("failed"), LOAD_TIMEOUT_MS);
        return () => window.clearTimeout(timer);
    }, [enabled, status]);

    const handleReady = useCallback(() => {
        if (!window.kakao?.maps) {
            setStatus("failed");
            return;
        }
        window.kakao.maps.load(() => setStatus("ready"));
    }, []);

    const handleError = useCallback(() => setStatus("failed"), []);

    return { status, handleReady, handleError };
}
