"use client";

import usePostComments from "../_hooks/usePostComments";

interface PostCommentCountProps {
    postId: string;
    initialCount: number;
    isServerPost: boolean;
}

export default function PostCommentCount({ postId, initialCount, isServerPost }: PostCommentCountProps) {
    const comments = usePostComments(postId, isServerPost);

    return <>{comments.data?.length ?? initialCount}</>;
}
