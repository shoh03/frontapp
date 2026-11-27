"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getPostForEdit } from "@/api/community/community.api";
import CommunityWriteForm from "./CommunityWriteForm";

interface CommunityEditFormProps {
    formId: string;
    postId: string;
}

// 기존 게시글을 읽어 글쓰기 폼에 채웁니다.
export default function CommunityEditForm({ formId, postId }: CommunityEditFormProps) {
    // 화면에 들어올 때마다 새로 읽습니다. 작성 중에는 다시 읽지 않아야 입력한 내용이 유지됩니다.
    const post = useQuery({
        queryKey: ["community", "edit", postId],
        queryFn: () => getPostForEdit(postId),
        staleTime: 0,
        gcTime: 0,
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });

    if (post.isFetching || post.isPending) return <p className="py-20 text-center">게시글을 불러오는 중...</p>;

    if (post.isError) {
        return (
            <div role="alert" className="py-20 text-center">
                <p>{post.error.message}</p>
                <Link href={`/community/${postId}`} className="mt-4 inline-block text-sm font-bold text-primary hover:underline">게시글로 돌아가기 →</Link>
            </div>
        );
    }

    // 새로 읽은 값으로 폼을 처음부터 만듭니다.
    return <CommunityWriteForm key={post.dataUpdatedAt} formId={formId} initialPost={post.data} />;
}
