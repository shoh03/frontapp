"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { toPostDetail } from "@/api/community/community.api";
import { getLocalPosts, subscribeLocalStore } from "@/lib/communityLocalStore";
import PostDetailView from "./PostDetailView";

interface CommunityLocalPostViewProps {
    postId: string;
}

// 이 브라우저에서 새로 쓴 글의 상세입니다. 서버는 이 글을 알지 못하므로 저장소에서 읽어 그립니다.
export default function CommunityLocalPostView({ postId }: CommunityLocalPostViewProps) {
    const posts = useSyncExternalStore(subscribeLocalStore, getLocalPosts, () => null);

    // 서버 렌더와 하이드레이션 동안에는 저장소를 읽을 수 없어 비워 둡니다.
    if (!posts) return <div aria-busy="true" className="min-h-[600px]" />;

    const post = posts.find((item) => String(item.id) === postId);
    if (!post) {
        return (
            <div className="py-32 text-center font-pretendard text-ink">
                <p className="text-lg font-bold">글을 찾을 수 없어요</p>
                <Link href="/community" className="mt-4 inline-block text-sm font-bold text-brand-text hover:underline">커뮤니티로 돌아가기 →</Link>
            </div>
        );
    }

    const detail = toPostDetail(post, post.content.split("\n"));
    return (
        <PostDetailView
            post={{
                ...detail,
                tags: post.prefix ? [...detail.tags, `#${post.prefix}`] : detail.tags,
                attachments: post.attachments,
            }}
        />
    );
}
