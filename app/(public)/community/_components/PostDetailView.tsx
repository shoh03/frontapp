import Link from "next/link";
import { Eye, MessageCircle } from "lucide-react";
import type { CommunityPostDetail } from "@/types/community/community.type";
import CommunityCommentSection from "./CommunityCommentSection";
import CommunityLikeButton from "./CommunityLikeButton";
import PostAttachments from "./PostAttachments";
import PostCommentCount from "./PostCommentCount";
import PostOwnerActions from "./PostOwnerActions";
import PostViewCount from "./PostViewCount";
import RelativeTime from "./RelativeTime";

interface PostDetailViewProps {
    post: CommunityPostDetail;
}

// 게시글 상세 화면입니다. 서버(목 데이터 글)와 클라이언트(이 브라우저에서 쓴 글)가 같이 사용합니다.
export default function PostDetailView({ post }: PostDetailViewProps) {
    const isServerPost = !!post.isServerPost;

    return (
        // 페이지 배경은 화면 폭 전체에 깔리도록 가상 요소로 그립니다.
        <div className="relative isolate pb-[76px] font-pretendard text-ink before:absolute before:inset-y-0 before:left-1/2 before:-z-10 before:w-screen before:-translate-x-1/2 before:bg-surface-alt">
            <nav aria-label="현재 위치" className="flex gap-1 pt-11 text-sm text-mute">
                <Link href="/" className="hover:text-ink">홈</Link>
                <span aria-hidden="true">/</span>
                <Link href="/community" aria-current="page" className="hover:text-ink">커뮤니티</Link>
            </nav>

            <div className="mt-8 grid grid-cols-[984px_312px] items-start gap-6">
                <article aria-labelledby="community-post-title" className="rounded-feed-lg bg-surface p-9">
                    <div className="flex items-center gap-2 text-base">
                        {post.prefix && (
                            <>
                                <span className="text-mute">{post.prefix}</span>
                                <span aria-hidden="true" className="text-mute-light">·</span>
                            </>
                        )}
                        <span className="text-mute-light"><RelativeTime iso={post.publishedAt} fallback={post.postedAgo} /></span>
                    </div>
                    <h1 id="community-post-title" className="mt-3 max-w-[480px] text-[32px] leading-[1.4] font-extrabold">{post.title}</h1>

                    <div className="mt-[22px] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-full bg-placeholder text-base">{post.author.avatar}</span>
                            <div>
                                <p className="text-base font-bold">{post.author.name}</p>
                                <p className="mt-0.5 text-xs text-mute-light">우리의 소중한 순간 나눠요</p>
                            </div>
                        </div>
                        {isServerPost && <PostOwnerActions key={post.id} postId={post.id} />}
                    </div>

                    {post.attachments ? (
                        // 글을 수정해 투표 항목이 바뀌면 투표 상태를 새로 만듭니다.
                        <PostAttachments key={`${post.id}-${post.attachments.poll?.options.join("|")}`} attachments={post.attachments} postId={post.id} />
                    ) : (
                        <div aria-hidden="true" className="mt-[22px] h-[300px] rounded-feed-lg bg-placeholder" />
                    )}

                    <div className="mt-[22px] space-y-[15px] text-base leading-[30px]">
                        {post.contents.map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </div>

                    <ul className="mt-[19px] flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                            <li key={tag} className="rounded-full bg-placeholder px-3 py-[7px] text-xs text-mute">{tag}</li>
                        ))}
                    </ul>

                    <div className="mt-5 flex h-14 items-center gap-6 border-y border-line text-sm text-mute">
                        <CommunityLikeButton key={post.id} postId={post.id} baseLikes={post.likes} isServerPost={isServerPost} />
                        <span className="flex items-center gap-1.5">
                            <MessageCircle aria-hidden="true" className="size-3.5" />
                            댓글 <PostCommentCount postId={post.id} initialCount={post.comments} isServerPost={isServerPost} />
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Eye aria-hidden="true" className="size-3.5" />
                            조회 <PostViewCount key={post.id} postId={post.id} initialCount={post.views} isServerPost={isServerPost} />
                        </span>
                    </div>

                    <CommunityCommentSection key={post.id} postId={post.id} initialComments={post.commentList} initialCount={post.comments} isServerPost={isServerPost} />
                </article>

                <aside aria-label="추천 정보">
                    <section className="rounded-feed-lg bg-surface p-[18px]">
                        <p aria-hidden="true" className="text-[10px] leading-none">💚</p>
                        <h2 className="mt-3 text-sm font-bold">함께여서 든든한 순간</h2>
                        <p className="mt-2 text-xs leading-5 text-mute">작은 응원도 나누면<br />누군가에게 큰 힘이 돼요.</p>
                        <Link href="/community" className="mt-3 inline-block text-xs font-bold text-brand-text hover:underline">다른 이야기 둘러보기 →</Link>
                    </section>
                </aside>
            </div>
        </div>
    );
}
