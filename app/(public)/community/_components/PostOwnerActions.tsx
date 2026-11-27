"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchServerPost } from "@/api/community/community.api";
import { deleteCommunityPost } from "@/api/community/postInteraction.api";
import { FOCUS_RING } from "../_constants/feed";
import useRequestError from "../_hooks/useRequestError";

interface PostOwnerActionsProps {
    postId: string;
}

// 내가 쓴 글에만 보이는 수정·삭제 버튼입니다. 권한은 서버가 요청마다 다시 확인합니다.
export default function PostOwnerActions({ postId }: PostOwnerActionsProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const showError = useRequestError(postId);

    // 서버 렌더에서는 로그인 쿠키를 알 수 없어 브라우저에서 확인합니다.
    // 계정이 바뀐 뒤 이전 결과가 보이지 않도록 캐시를 남기지 않습니다.
    const isMine = useQuery({
        queryKey: ["community", "mine", postId],
        queryFn: async () => (await fetchServerPost(postId, true))?.isMine ?? false,
        staleTime: 0,
        gcTime: 0,
    });

    const remove = useMutation({
        mutationFn: () => deleteCommunityPost(postId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["community", "posts"] });
            router.replace("/community");
            // 뒤로 가기로 돌아와도 삭제한 글이 남아 보이지 않게 합니다.
            router.refresh();
        },
        onError: showError,
    });

    if (!isMine.data) return null;

    const handleDelete = () => {
        if (window.confirm("게시글을 삭제할까요? 삭제하면 되돌릴 수 없어요.")) remove.mutate();
    };

    return (
        <div className="flex items-center gap-3 text-sm text-mute">
            <Link href={`/community/${postId}/edit`} className={`rounded-feed-sm hover:text-ink hover:underline ${FOCUS_RING}`}>수정</Link>
            <button
                type="button"
                onClick={handleDelete}
                disabled={remove.isPending || remove.isSuccess}
                className={`rounded-feed-sm text-warning hover:underline disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS_RING}`}
            >
                삭제
            </button>
        </div>
    );
}
