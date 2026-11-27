import Image from "next/image";
import Link from "next/link";
import { Eye, Heart, MessageCircle } from "lucide-react";
import { formatCount, formatRelativeTime } from "@/lib/format";
import type { FeedPost } from "@/types/community/communityFeed.type";
import { FOCUS_RING } from "../_constants/feed";

interface PostCardProps {
    post: FeedPost;
}

export default function PostCard({ post }: PostCardProps) {
    return (
        <Link
            href={`/community/${post.id}`}
            className={`flex h-[111px] items-center gap-4 rounded-feed-lg border border-line bg-white py-2 pr-3.5 pl-[23px] transition-colors hover:bg-surface-alt ${FOCUS_RING}`}
        >
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-base">
                    {post.prefix && (
                        <>
                            <span className="text-mute">{post.prefix}</span>
                            <span aria-hidden="true" className="text-mute-light">·</span>
                        </>
                    )}
                    <span className="text-mute-light">{formatRelativeTime(post.createdAt)}</span>
                </div>
                <h3 className="mt-3 truncate text-base font-semibold text-ink">{post.title}</h3>
                <div className="mt-3 flex items-center gap-3 text-xs text-mute">
                    <span className="flex items-center gap-2">
                        <span aria-hidden="true" className="flex size-4 items-center justify-center rounded-full bg-brand-subtle text-[8px] font-bold text-brand-text">
                            {post.authorName.slice(0, 1)}
                        </span>
                        {post.authorName}
                    </span>
                    <span aria-hidden="true" className="text-mute-light">|</span>
                    <span className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <Eye aria-hidden="true" className="size-3.5" />
                            <span aria-hidden="true">{formatCount(post.viewCount)}</span>
                            <span className="sr-only">조회수 {formatCount(post.viewCount)}회</span>
                        </span>
                        <span className="flex items-center gap-1">
                            <Heart aria-hidden="true" className="size-3.5" />
                            <span aria-hidden="true">{formatCount(post.likeCount)}</span>
                            <span className="sr-only">좋아요 {formatCount(post.likeCount)}개</span>
                        </span>
                        <span className="flex items-center gap-1">
                            <MessageCircle aria-hidden="true" className="size-3.5" />
                            <span aria-hidden="true">{formatCount(post.commentCount)}</span>
                            <span className="sr-only">댓글 {formatCount(post.commentCount)}개</span>
                        </span>
                    </span>
                </div>
            </div>
            {post.thumbnailUrl && (
                <div className="relative h-[94px] w-[98px] shrink-0 overflow-hidden rounded-feed-md bg-placeholder">
                    <Image src={post.thumbnailUrl} alt="" fill sizes="200px" className="object-cover" />
                </div>
            )}
        </Link>
    );
}
