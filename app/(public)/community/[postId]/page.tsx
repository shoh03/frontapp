import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getCommunityPost } from "@/api/community/community.api";
import PostDetailView from "../_components/PostDetailView";

export const metadata: Metadata = {
    title: "커뮤니티 | NESTEP",
};

export default function Page({ params }: { params: Promise<{ postId: string }> }) {
    return (
        <Suspense fallback={<p className="py-20 text-center">게시글을 불러오는 중...</p>}>
            <PostContent params={params} />
        </Suspense>
    );
}

// 요청 때마다 읽는 데이터라서 Suspense 안에서 기다립니다.
async function PostContent({ params }: { params: Promise<{ postId: string }> }) {
    const { postId } = await params;
    const post = await getCommunityPost(postId);
    if (!post) notFound();

    return <PostDetailView post={post} />;
}
