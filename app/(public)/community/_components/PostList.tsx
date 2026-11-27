import type { ReactNode } from "react";
import Link from "next/link";
import type { FeedPost } from "@/types/community/communityFeed.type";
import { FOCUS_RING } from "../_constants/feed";
import PostCard from "./PostCard";

interface PostListProps {
    posts: FeedPost[];
    loading: boolean;
    error: boolean;
    searchQuery: string;
    writeHref: string;
    onRetry: () => void;
    onClearSearch: () => void;
}

const SKELETON_COUNT = 5;

const stateButtonClass = `mt-5 inline-flex h-10 items-center rounded-full bg-primary px-6 text-sm font-bold text-white hover:bg-brand-hover ${FOCUS_RING}`;

function PostCardSkeleton() {
    return (
        <li aria-hidden="true" className="flex h-[111px] items-center gap-4 rounded-feed-lg border border-line bg-white py-2 pr-3.5 pl-[23px]">
            <div className="flex-1">
                <div className="h-5 w-40 rounded-full bg-placeholder" />
                <div className="mt-3 h-4 w-3/4 rounded-feed-sm bg-placeholder" />
                <div className="mt-3 h-3 w-1/3 rounded-feed-sm bg-placeholder" />
            </div>
            <div className="h-[94px] w-[98px] shrink-0 rounded-feed-md bg-placeholder" />
        </li>
    );
}

function StateBox({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div className="flex flex-col items-center rounded-feed-lg border border-line bg-white px-6 py-16 text-center">
            <p className="text-base font-bold text-ink">{title}</p>
            {children}
        </div>
    );
}

export default function PostList({ posts, loading, error, searchQuery, writeHref, onRetry, onClearSearch }: PostListProps) {
    if (error) {
        return (
            <div role="alert">
                <StateBox title="불러오지 못했어요">
                    <button type="button" onClick={onRetry} className={stateButtonClass}>다시 시도</button>
                </StateBox>
            </div>
        );
    }

    if (!loading && posts.length === 0) {
        return searchQuery ? (
            <StateBox title={`'${searchQuery}' 검색 결과가 없어요`}>
                <button type="button" onClick={onClearSearch} className={stateButtonClass}>검색 지우기</button>
            </StateBox>
        ) : (
            <StateBox title="아직 글이 없어요">
                <Link href={writeHref} className={stateButtonClass}>이야기 나누기</Link>
            </StateBox>
        );
    }

    return (
        <ul aria-busy={loading} className="flex flex-col gap-[25px]">
            {loading
                ? Array.from({ length: SKELETON_COUNT }, (_, index) => <PostCardSkeleton key={index} />)
                : posts.map((post) => (
                    <li key={post.id}>
                        <PostCard post={post} />
                    </li>
                ))}
        </ul>
    );
}
