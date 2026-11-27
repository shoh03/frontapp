"use client";

import { useQuery } from "@tanstack/react-query";
import { getPostComments } from "@/api/community/postInteraction.api";

export const getCommentsQueryKey = (postId: string) => ["community", "comments", postId] as const;

// 댓글 목록과 댓글 수가 같은 캐시를 씁니다.
export default function usePostComments(postId: string) {
    return useQuery({
        queryKey: getCommentsQueryKey(postId),
        queryFn: () => getPostComments(postId),
        // 로그인 상태에 따라 삭제 버튼이 달라지므로 화면에 들어올 때마다 다시 읽습니다.
        staleTime: 0,
        retry: false,
    });
}
