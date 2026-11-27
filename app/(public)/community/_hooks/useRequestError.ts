"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { LOGIN_REQUIRED_MESSAGE } from "@/api/community/postInteraction.api";
import { LOGIN_PATH } from "../_constants/feed";

// 요청 실패를 알립니다. 로그인이 필요하면 로그인 후 이 글로 돌아오도록 이동합니다.
export default function useRequestError(postId: string) {
    const router = useRouter();

    return useCallback(
        (error: Error) => {
            window.alert(error.message);
            if (error.message === LOGIN_REQUIRED_MESSAGE) router.push(`${LOGIN_PATH}?redirect=/community/${postId}`);
        },
        [postId, router],
    );
}
