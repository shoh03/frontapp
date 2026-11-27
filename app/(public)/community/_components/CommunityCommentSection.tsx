"use client";

import type { ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPostComment, deletePostComment } from "@/api/community/postInteraction.api";
import type { ServerComment } from "@/types/community/community.type";
import useRequestError from "../_hooks/useRequestError";
import usePostComments, { getCommentsQueryKey } from "../_hooks/usePostComments";
import CommunityCommentForm from "./CommunityCommentForm";
import RelativeTime from "./RelativeTime";

interface CommunityCommentSectionProps {
    postId: string;
    initialCount: number;
}

interface CommentItemProps {
    name: string;
    avatar: string;
    content: string;
    meta: ReactNode;
}

function CommentItem({ name, avatar, content, meta }: CommentItemProps) {
    return (
        <li className="flex gap-3 border-b border-line py-[21px] first:pt-0 last:border-b-0 last:pb-0">
            <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-placeholder text-sm">{avatar}</span>
            <div>
                <p className="text-sm font-bold">{name}</p>
                <p className="mt-1.5 text-sm leading-[22px] whitespace-pre-line">{content}</p>
                <p className="mt-1.5 text-xs text-mute-light">{meta}</p>
            </div>
        </li>
    );
}

export default function CommunityCommentSection({ postId, initialCount }: CommunityCommentSectionProps) {
    const queryClient = useQueryClient();
    const showError = useRequestError(postId);
    const comments = usePostComments(postId);
    const queryKey = getCommentsQueryKey(postId);

    // 목록을 다시 읽고, 피드의 댓글 수도 갱신되게 합니다.
    const refresh = () =>
        Promise.all([
            queryClient.invalidateQueries({ queryKey }),
            queryClient.invalidateQueries({ queryKey: ["community", "posts"] }),
        ]);

    const create = useMutation({
        mutationFn: (content: string) => createPostComment(postId, content),
        onSuccess: refresh,
        onError: showError,
    });
    const remove = useMutation({
        mutationFn: (commentId: number) => deletePostComment(postId, commentId),
        onSuccess: refresh,
        onError: showError,
    });

    const handleSubmit = async (content: string) => {
        try {
            await create.mutateAsync(content);
            return true;
        } catch {
            return false; // 안내는 onError 에서 합니다.
        }
    };

    const handleDelete = (comment: ServerComment) => {
        if (window.confirm("댓글을 삭제할까요?")) remove.mutate(comment.id);
    };

    return (
        <section aria-labelledby="community-comments-title" className="mt-[22px]">
            <div className="flex items-baseline gap-3">
                <h2 id="community-comments-title" className="text-lg font-bold">따뜻한 응원</h2>
                <span className="text-sm font-bold text-brand-text">{comments.data?.length ?? initialCount}</span>
                <span className="text-xs text-mute-light">서로를 배려하는 댓글을 남겨주세요</span>
            </div>

            <CommunityCommentForm onSubmit={handleSubmit} />

            <ul className="mt-5">
                {comments.isPending && <li className="text-sm text-mute-light">댓글을 불러오고 있어요.</li>}
                {comments.isError && (
                    <li role="alert" className="text-sm text-mute">
                        댓글을 불러오지 못했어요.{" "}
                        <button type="button" onClick={() => comments.refetch()} className="font-bold text-brand-text hover:underline">다시 시도</button>
                    </li>
                )}
                {comments.data?.map((comment) => (
                    <CommentItem
                        key={comment.id}
                        name={comment.authorName}
                        avatar={comment.authorName.slice(0, 1)}
                        content={comment.content}
                        meta={
                            <>
                                <RelativeTime iso={comment.createdAt} />
                                {comment.isMine && (
                                    <>
                                        {" · "}
                                        <button type="button" onClick={() => handleDelete(comment)} disabled={remove.isPending} className="hover:text-ink hover:underline">삭제</button>
                                    </>
                                )}
                            </>
                        }
                    />
                ))}
            </ul>
        </section>
    );
}
