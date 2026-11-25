"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { fetchServerPost, voteCommunityPost } from "@/api/community/community.api";
import type { CommunityAttachments } from "@/types/community/community.type";

interface PostAttachmentsProps {
    attachments: CommunityAttachments;
    postId: string;
}

// 글 상세에 보이는 첨부(사진·동영상·장소·투표)입니다.
// 서버에 저장된 글(poll.votes 가 있음)은 투표를 서버에 기록하고, 예전 브라우저 저장 글은 이 브라우저에서만 집계합니다.
export default function PostAttachments({ attachments, postId }: PostAttachmentsProps) {
    const { photos, video, place, poll } = attachments;
    const isServerPoll = !!poll?.votes;
    const voteKey = `community-vote-${postId}`;

    const [votes, setVotes] = useState<number[]>(() => {
        if (poll?.votes) return poll.votes;
        const empty = poll ? poll.options.map(() => 0) : [];
        if (typeof window === "undefined") return empty;
        try {
            const saved = JSON.parse(window.localStorage.getItem(voteKey) ?? "null") as number[] | null;
            return saved && saved.length === empty.length ? saved : empty;
        } catch {
            return empty;
        }
    });
    const [voted, setVoted] = useState<number | null>(() => {
        if (isServerPoll) return poll?.myVote ?? null;
        if (typeof window === "undefined") return null;
        const saved = window.localStorage.getItem(`${voteKey}-mine`);
        return saved === null ? null : Number(saved);
    });
    const [isVoting, setIsVoting] = useState(false);

    // 서버 렌더에서는 로그인 쿠키를 알 수 없으므로, 브라우저에서 내 투표와 최신 집계를 다시 읽습니다.
    useEffect(() => {
        if (!isServerPoll) return;
        let cancelled = false;
        fetchServerPost(postId, true).then((fresh) => {
            const freshPoll = fresh?.attachments?.poll;
            if (cancelled || !freshPoll?.votes) return;
            setVotes(freshPoll.votes);
            setVoted(freshPoll.myVote ?? null);
        });
        return () => {
            cancelled = true;
        };
    }, [isServerPoll, postId]);

    const vote = async (index: number) => {
        if (voted !== null || isVoting) return;

        if (!isServerPoll) {
            const next = votes.map((count, i) => (i === index ? count + 1 : count));
            setVotes(next);
            setVoted(index);
            window.localStorage.setItem(voteKey, JSON.stringify(next));
            window.localStorage.setItem(`${voteKey}-mine`, String(index));
            return;
        }

        setIsVoting(true);
        try {
            const updated = await voteCommunityPost(postId, index);
            const updatedPoll = updated.attachments?.poll;
            if (updatedPoll?.votes) {
                setVotes(updatedPoll.votes);
                setVoted(updatedPoll.myVote ?? index);
            }
        } catch (error) {
            window.alert(error instanceof Error ? error.message : "투표에 실패했습니다.");
        } finally {
            setIsVoting(false);
        }
    };
    const total = votes.reduce((sum, count) => sum + count, 0);

    if (!photos.length && !video && !place && !poll) return null;

    return (
        <div className="mt-[22px] space-y-4">
            {photos.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                    {photos.map((src, index) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={index} src={src} alt={`첨부 사진 ${index + 1}`} className="w-full rounded-feed-lg object-cover" />
                    ))}
                </div>
            )}
            {video && <video src={video.url} controls className="w-full rounded-feed-lg bg-black" />}
            {place && (
                <div className="flex items-center gap-3 rounded-feed-lg bg-placeholder p-4 text-sm">
                    <MapPin aria-hidden="true" className="size-5 shrink-0 text-primary" />
                    <div>
                        <p className="font-bold">{place.name}</p>
                        {place.address && <p className="mt-0.5 text-mute">{place.address}</p>}
                    </div>
                </div>
            )}
            {poll && (
                <div className="rounded-feed-lg border border-line p-5">
                    <p className="text-base font-bold">📊 {poll.question}</p>
                    <ul className="mt-4 space-y-2">
                        {poll.options.map((option, index) => {
                            const percent = total ? Math.round((votes[index] / total) * 100) : 0;
                            return (
                                <li key={index}>
                                    <button
                                        type="button"
                                        onClick={() => vote(index)}
                                        disabled={voted !== null || isVoting}
                                        className={`relative h-11 w-full overflow-hidden rounded-lg border px-4 text-left text-sm ${voted === index ? "border-primary font-bold" : "border-line"}`}
                                    >
                                        {voted !== null && <span aria-hidden="true" className="absolute inset-y-0 left-0 bg-primary/15" style={{ width: `${percent}%` }} />}
                                        <span className="relative flex justify-between"><span>{option}</span>{voted !== null && <span>{percent}% ({votes[index]})</span>}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}
