"use client";

import { useSyncExternalStore } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { getPostLike, setPostLike } from "@/api/community/postInteraction.api";
import { isPostLiked, subscribeLocalStore, togglePostLiked } from "@/lib/communityLocalStore";
import type { PostLikeState } from "@/types/community/community.type";
import { FOCUS_RING } from "../_constants/feed";
import useRequestError from "../_hooks/useRequestError";

interface CommunityLikeButtonProps {
    postId: string;
    baseLikes: number;
    isServerPost: boolean;
}

interface LikeViewProps {
    liked: boolean;
    count: number;
    disabled?: boolean;
    onClick: () => void;
}

function LikeView({ liked, count, disabled, onClick }: LikeViewProps) {
    return (
        <button
            type="button"
            aria-pressed={liked}
            aria-label={liked ? "공감 취소" : "공감하기"}
            disabled={disabled}
            onClick={onClick}
            className={`flex items-center gap-1.5 rounded-feed-sm ${FOCUS_RING} ${liked ? "text-sale" : "hover:text-ink"}`}
        >
            <Heart aria-hidden="true" className={`size-3.5 ${liked ? "fill-sale" : ""}`} />
            공감 {count}
        </button>
    );
}

// 누르자마자 화면에 반영하고(낙관적 업데이트), 서버 응답으로 맞춥니다. 실패하면 되돌립니다.
function ServerLikeButton({ postId, baseLikes }: Omit<CommunityLikeButtonProps, "isServerPost">) {
    const queryClient = useQueryClient();
    const showError = useRequestError(postId);
    const queryKey = ["community", "like", postId] as const;

    const like = useQuery({ queryKey, queryFn: () => getPostLike(postId), staleTime: 0, retry: false });
    const state: PostLikeState = like.data ?? { liked: false, likeCount: baseLikes };

    const mutation = useMutation({
        mutationFn: (liked: boolean) => setPostLike(postId, liked),
        onMutate: async (liked) => {
            // 진행 중인 조회가 낙관적 값을 덮어쓰지 않게 멈춥니다.
            await queryClient.cancelQueries({ queryKey });
            const previous = queryClient.getQueryData<PostLikeState>(queryKey);
            queryClient.setQueryData<PostLikeState>(queryKey, { liked, likeCount: state.likeCount + (liked ? 1 : -1) });
            return { previous };
        },
        onError: (error, _liked, context) => {
            queryClient.setQueryData(queryKey, context?.previous ?? { liked: false, likeCount: baseLikes });
            showError(error);
        },
        onSuccess: (saved) => {
            queryClient.setQueryData(queryKey, saved);
            // 목록의 좋아요 수와 인기순을 다시 읽게 합니다.
            queryClient.invalidateQueries({ queryKey: ["community", "posts"] });
        },
    });

    // 내 좋아요 여부를 읽기 전과 저장 중에는 연속 요청을 막습니다.
    return (
        <LikeView
            liked={state.liked}
            count={state.likeCount}
            disabled={like.isPending || mutation.isPending}
            onClick={() => mutation.mutate(!state.liked)}
        />
    );
}

// 서버에 없는 글(목업·예전 브라우저 저장 글)의 좋아요는 이 브라우저에만 남깁니다.
function LocalLikeButton({ postId, baseLikes }: Omit<CommunityLikeButtonProps, "isServerPost">) {
    const liked = useSyncExternalStore(subscribeLocalStore, () => isPostLiked(postId), () => false);

    return <LikeView liked={liked} count={baseLikes + (liked ? 1 : 0)} onClick={() => togglePostLiked(postId)} />;
}

export default function CommunityLikeButton({ isServerPost, ...props }: CommunityLikeButtonProps) {
    return isServerPost ? <ServerLikeButton {...props} /> : <LocalLikeButton {...props} />;
}
