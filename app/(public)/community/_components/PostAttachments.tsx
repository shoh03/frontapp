"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { fetchServerPost, voteCommunityPost } from "@/api/community/community.api";
import type { CommunityAttachments } from "@/types/community/community.type";
import { FOCUS_RING } from "../_constants/feed";
import PostPlaceMap from "./PostPlaceMap";

interface PostAttachmentsProps {
    attachments: CommunityAttachments;
    postId: string;
}

// 글 상세에 보이는 첨부(사진·동영상·장소·투표)입니다.
export default function PostAttachments({ attachments, postId }: PostAttachmentsProps) {
    const { photos, place, poll } = attachments;
    const { videos } = attachments;
    const hasPoll = !!poll;
    const allowMultiple = !!poll?.allowMultiple;

    const [votes, setVotes] = useState<number[]>(poll?.votes ?? []);
    // 내가 투표한 항목입니다. 비어 있으면 아직 투표하지 않은 상태입니다.
    const [voted, setVoted] = useState<number[]>(poll?.myVotes ?? []);
    const [voterCount, setVoterCount] = useState(poll?.voterCount ?? 0);
    // 복수 선택 투표에서 제출하기 전에 고른 항목입니다.
    const [selected, setSelected] = useState<number[]>([]);
    const [isVoting, setIsVoting] = useState(false);
    const hasVoted = voted.length > 0;

    // 서버 렌더에서는 로그인 쿠키를 알 수 없으므로, 브라우저에서 내 투표와 최신 집계를 다시 읽습니다.
    useEffect(() => {
        if (!hasPoll) return;
        let cancelled = false;
        fetchServerPost(postId, true).then((fresh) => {
            const freshPoll = fresh?.attachments?.poll;
            if (cancelled || !freshPoll) return;
            setVotes(freshPoll.votes);
            setVoted(freshPoll.myVotes);
            setVoterCount(freshPoll.voterCount);
        });
        return () => {
            cancelled = true;
        };
    }, [hasPoll, postId]);

    const submitVote = async (indexes: number[]) => {
        if (hasVoted || isVoting || indexes.length === 0) return;

        setIsVoting(true);
        try {
            const updated = await voteCommunityPost(postId, indexes);
            const updatedPoll = updated.attachments?.poll;
            if (updatedPoll) {
                setVotes(updatedPoll.votes);
                setVoted(updatedPoll.myVotes);
                setVoterCount(updatedPoll.voterCount);
            }
        } catch (error) {
            window.alert(error instanceof Error ? error.message : "투표에 실패했습니다.");
        } finally {
            setIsVoting(false);
        }
    };

    const handleOptionClick = (index: number) => {
        if (!allowMultiple) {
            submitVote([index]);
            return;
        }
        setSelected((prev) => (prev.includes(index) ? prev.filter((item) => item !== index) : [...prev, index]));
    };

    // 복수 선택은 참여 인원 대비, 단일 선택은 전체 득표 대비 비율입니다.
    const total = allowMultiple ? voterCount : votes.reduce((sum, count) => sum + count, 0);

    if (!photos.length && !videos.length && !place && !poll) return null;

    return (
        <div className="mt-[22px] space-y-4">
            {/* 사진이 한 장이면 본문 폭을 다 씁니다. 원본보다 크게 늘리면 흐려지므로 확대하지 않습니다. */}
            {photos.length > 0 && (
                <div className={`grid items-start gap-3 ${photos.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                    {photos.map((src, index) => (
                        <a key={index} href={src} target="_blank" rel="noopener noreferrer" title="원본 크기로 보기" className={`mx-auto block max-w-full ${FOCUS_RING}`}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt={`첨부 사진 ${index + 1}`} className="max-w-full rounded-feed-lg" />
                        </a>
                    ))}
                </div>
            )}
            {videos.map((video) => (
                <video key={video.url} src={video.url} controls className="w-full rounded-feed-lg bg-black" />
            ))}
            {place && (
                <div className="space-y-3">
                    {place.latitude != null && place.longitude != null && (
                        <PostPlaceMap name={place.name} latitude={place.latitude} longitude={place.longitude} />
                    )}
                    <div className="flex items-center gap-3 rounded-feed-lg bg-placeholder p-4 text-sm">
                        <MapPin aria-hidden="true" className="size-5 shrink-0 text-primary" />
                        <div>
                            <p className="font-bold">{place.name}</p>
                            {place.address && <p className="mt-0.5 text-mute">{place.address}</p>}
                        </div>
                    </div>
                </div>
            )}
            {poll && (
                <div className="rounded-feed-lg border border-line p-5">
                    <p className="text-base font-bold">📊 {poll.question}</p>
                    {allowMultiple && <p className="mt-1 text-xs text-mute">복수 선택 가능 · {voterCount}명 참여</p>}
                    <ul className="mt-4 space-y-2">
                        {poll.options.map((option, index) => {
                            const percent = total ? Math.round((votes[index] / total) * 100) : 0;
                            return (
                                <li key={index}>
                                    <button
                                        type="button"
                                        onClick={() => handleOptionClick(index)}
                                        disabled={hasVoted || isVoting}
                                        aria-pressed={voted.includes(index) || selected.includes(index)}
                                        className={`relative h-11 w-full overflow-hidden rounded-lg border px-4 text-left text-sm ${voted.includes(index) || selected.includes(index) ? "border-primary font-bold" : "border-line"}`}
                                    >
                                        {hasVoted && <span aria-hidden="true" className="absolute inset-y-0 left-0 bg-primary/15" style={{ width: `${percent}%` }} />}
                                        <span className="relative flex justify-between"><span>{option}</span>{hasVoted && <span>{percent}% ({votes[index]})</span>}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                    {allowMultiple && !hasVoted && (
                        <button
                            type="button"
                            onClick={() => submitVote([...selected].sort((a, b) => a - b))}
                            disabled={selected.length === 0 || isVoting}
                            className="mt-4 h-11 w-full rounded-lg bg-primary text-sm font-bold text-white hover:bg-brand-hover disabled:opacity-40"
                        >
                            투표하기
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
