"use client";

import usePostComments from "../_hooks/usePostComments";

interface PostCommentCountProps {
    postId: string;
    initialCount: number;
}

export default function PostCommentCount({ postId, initialCount }: PostCommentCountProps) {
    const comments = usePostComments(postId);

    return <>{comments.data?.length ?? initialCount}</>;
}
