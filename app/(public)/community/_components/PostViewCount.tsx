"use client";

import { useEffect, useState } from "react";
import { addPostView } from "@/api/community/postInteraction.api";

interface PostViewCountProps {
    postId: string;
    initialCount: number;
    isServerPost: boolean;
}

// 상세 화면을 열면 조회를 기록하고, 서버가 돌려준 최신 조회수를 보여 줍니다.
export default function PostViewCount({ postId, initialCount, isServerPost }: PostViewCountProps) {
    const [count, setCount] = useState(initialCount);

    useEffect(() => {
        if (!isServerPost) return;
        let cancelled = false;
        addPostView(postId)
            .then((result) => {
                if (!cancelled) setCount(result.viewCount);
            })
            // 조회수 반영에 실패해도 화면은 그대로 보여 줍니다.
            .catch(() => undefined);
        return () => {
            cancelled = true;
        };
    }, [isServerPost, postId]);

    return <>{count}</>;
}
