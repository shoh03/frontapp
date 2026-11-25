"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { createCommunityPost } from "@/api/community/community.api";
import type { CommunityCategory, CommunityPrefix } from "@/types/community/community.type";

interface CommunityWriteFormProps {
    formId: string;
}

const boards: CommunityCategory[] = ["임신 이야기", "육아 이야기", "우리 동네", "건강·병원", "살림·추천"];
const prefixes: CommunityPrefix[] = ["질문", "후기", "정보 공유", "일상"];

const MAX_PHOTOS = 10;
const MAX_VIDEO_SECONDS = 60;
const MIN_POLL_OPTIONS = 2;
const MAX_POLL_OPTIONS = 5;

const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

interface PhotoItem {
    file: File;
    preview: string;
}

interface VideoItem {
    file: File;
    url: string;
    duration: number;
}

// 동영상 길이(초)를 메타데이터로 읽습니다.
const readVideoDuration = (url: string): Promise<number> =>
    new Promise((resolve, reject) => {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = () => resolve(video.duration);
        video.onerror = () => reject(new Error("video load failed"));
        video.src = url;
    });

export default function CommunityWriteForm({ formId }: CommunityWriteFormProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const photoInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const [isPublic, setIsPublic] = useState(true);
    const [category, setCategory] = useState<CommunityCategory>("임신 이야기");
    const [prefix, setPrefix] = useState<CommunityPrefix>("질문");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [photos, setPhotos] = useState<PhotoItem[]>([]);
    const [video, setVideo] = useState<VideoItem | null>(null);
    const [placeOpen, setPlaceOpen] = useState(false);
    const [placeName, setPlaceName] = useState("");
    const [placeAddress, setPlaceAddress] = useState("");
    const [pollOpen, setPollOpen] = useState(false);
    const [pollQuestion, setPollQuestion] = useState("");
    const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const canSubmit = title.trim().length > 0 && content.trim().length > 0 && !isSubmitting;

    const handlePhotos = (event: ChangeEvent<HTMLInputElement>) => {
        const picked = Array.from(event.target.files ?? []);
        event.target.value = "";

        const valid = picked.filter((file) => file.type.startsWith("image/") && file.size <= MAX_PHOTO_BYTES);
        if (valid.length < picked.length) window.alert("10MB 이하의 이미지 파일만 첨부할 수 있어요.");

        const added = valid.slice(0, MAX_PHOTOS - photos.length).map((file) => ({ file, preview: URL.createObjectURL(file) }));
        if (valid.length > added.length) window.alert(`사진은 최대 ${MAX_PHOTOS}장까지 첨부할 수 있어요.`);
        setPhotos((prev) => [...prev, ...added]);
    };

    const removePhoto = (index: number) => {
        URL.revokeObjectURL(photos[index].preview);
        setPhotos((prev) => prev.filter((_, i) => i !== index));
    };

    const handleVideo = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        if (!file.type.startsWith("video/") || file.size > MAX_VIDEO_BYTES) {
            window.alert("100MB 이하의 동영상 파일만 첨부할 수 있어요.");
            return;
        }

        const url = URL.createObjectURL(file);
        try {
            const duration = await readVideoDuration(url);
            if (duration > MAX_VIDEO_SECONDS) {
                URL.revokeObjectURL(url);
                window.alert("동영상은 최대 1분까지 첨부할 수 있어요.");
                return;
            }
            if (video) URL.revokeObjectURL(video.url);
            setVideo({ file, url, duration: Math.round(duration) });
        } catch {
            URL.revokeObjectURL(url);
            window.alert("동영상을 불러오지 못했습니다.");
        }
    };

    const removeVideo = () => {
        if (video) URL.revokeObjectURL(video.url);
        setVideo(null);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!canSubmit) return;

        const filledOptions = pollOptions.map((option) => option.trim()).filter(Boolean);
        if (pollOpen && (!pollQuestion.trim() || filledOptions.length < MIN_POLL_OPTIONS)) {
            window.alert("투표는 질문과 항목을 2개 이상 입력해 주세요. 투표를 쓰지 않으려면 투표 입력란을 닫아 주세요.");
            return;
        }
        if (placeOpen && !placeName.trim()) {
            window.alert("장소 이름을 입력해 주세요. 장소를 쓰지 않으려면 장소 입력란을 닫아 주세요.");
            return;
        }

        setIsSubmitting(true);
        try {
            await createCommunityPost(
                {
                    isPublic,
                    category,
                    prefix,
                    title: title.trim(),
                    content: content.trim(),
                    photos: photos.map((photo) => photo.file),
                    video: video ? { file: video.file, duration: video.duration } : null,
                    place: placeOpen ? { name: placeName.trim(), address: placeAddress.trim() } : null,
                    poll: pollOpen ? { question: pollQuestion.trim(), options: filledOptions } : null,
                },
            );
            // 피드 목록 캐시에 새 글이 보이도록 다시 불러오게 합니다.
            await queryClient.invalidateQueries({ queryKey: ["community", "posts"] });
            router.push("/community");
        } catch (error) {
            setIsSubmitting(false);
            window.alert(error instanceof Error && error.message === "로그인이 필요합니다."
                ? "로그인이 필요합니다. 다시 로그인한 뒤 등록해 주세요."
                : "게시글 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        }
    };

    const toolbarClass = (active: boolean) =>
        `flex w-16 flex-col items-center gap-1 rounded-lg py-2 text-xs hover:bg-[#F4F7F5] ${active ? "bg-[#F4F7F5] font-bold text-primary" : "text-[#61766D]"}`;
    const inputClass =
        "h-12 w-full rounded-xl border border-[#E1E9E4] px-4 text-base outline-none placeholder:text-[#98A89F] focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20";

    return (
        <form id={formId} onSubmit={handleSubmit} className="rounded-3xl bg-white p-10 shadow-[0_6px_24px_rgb(0_0_0/0.04)]">
            <div className="flex items-start justify-between gap-6">
                <div>
                    <h2 className="text-lg font-bold">공개 설정</h2>
                    <p className="mt-2 text-sm text-[#8A9A90]">커뮤니티 멤버에게만 보여요. 검색에는 노출되지 않습니다.</p>
                </div>
                <button
                    type="button"
                    role="switch"
                    aria-checked={isPublic}
                    aria-label="커뮤니티 멤버에게 공개"
                    onClick={() => setIsPublic((prev) => !prev)}
                    className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${isPublic ? "bg-primary" : "bg-[#D5DDD8]"}`}
                >
                    <span className={`absolute top-1 size-6 rounded-full bg-white shadow transition-all ${isPublic ? "left-7" : "left-1"}`} />
                </button>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-6">
                <div>
                    <label htmlFor="community-board" className="text-sm font-bold">게시판</label>
                    <select
                        id="community-board"
                        value={category}
                        onChange={(event) => setCategory(event.target.value as CommunityCategory)}
                        className="mt-3 h-14 w-full rounded-xl border border-[#E1E9E4] bg-white px-5 text-base outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                    >
                        {boards.map((board) => <option key={board} value={board}>{board}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="community-prefix" className="text-sm font-bold">말머리</label>
                    <select
                        id="community-prefix"
                        value={prefix}
                        onChange={(event) => setPrefix(event.target.value as CommunityPrefix)}
                        className="mt-3 h-14 w-full rounded-xl border border-[#E1E9E4] bg-white px-5 text-base text-[#253B3A] outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                    >
                        {prefixes.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                </div>
            </div>

            <div className="mt-8">
                <label htmlFor="community-title" className="text-sm font-bold">제목</label>
                <input
                    id="community-title"
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="어떤 이야기를 나누고 싶으세요?"
                    className="mt-3 h-14 w-full rounded-xl border border-[#E1E9E4] px-5 text-base outline-none placeholder:text-[#98A89F] focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                />
            </div>

            <div className="mt-8">
                <span className="text-sm font-bold">내용</span>
                <div role="toolbar" aria-label="본문 도구" className="mt-3 flex flex-wrap gap-2 rounded-t-xl border border-b-0 border-[#E1E9E4] px-4 pt-4 pb-3">
                    <button type="button" onClick={() => photoInputRef.current?.click()} className={toolbarClass(photos.length > 0)}>
                        <span aria-hidden="true" className="text-base">📷</span>
                        사진
                    </button>
                    <button type="button" onClick={() => videoInputRef.current?.click()} className={toolbarClass(!!video)}>
                        <span aria-hidden="true" className="text-base">🎥</span>
                        동영상
                    </button>
                    <button type="button" onClick={() => setPlaceOpen((prev) => !prev)} aria-pressed={placeOpen} className={toolbarClass(placeOpen)}>
                        <span aria-hidden="true" className="text-base">📍</span>
                        장소
                    </button>
                    <button type="button" onClick={() => setPollOpen((prev) => !prev)} aria-pressed={pollOpen} className={toolbarClass(pollOpen)}>
                        <span aria-hidden="true" className="text-base">📊</span>
                        투표
                    </button>
                    <input ref={photoInputRef} type="file" accept="image/*" multiple hidden onChange={handlePhotos} />
                    <input ref={videoInputRef} type="file" accept="video/*" hidden onChange={handleVideo} />
                </div>

                {(photos.length > 0 || video || placeOpen || pollOpen) && (
                    <div className="space-y-5 border border-b-0 border-[#E1E9E4] p-5">
                        {photos.length > 0 && (
                            <ul className="flex flex-wrap gap-3">
                                {photos.map((photo, index) => (
                                    <li key={photo.preview} className="relative">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={photo.preview} alt={`첨부 사진 ${index + 1}`} className="size-24 rounded-lg object-cover" />
                                        <button
                                            type="button"
                                            aria-label={`사진 ${index + 1} 삭제`}
                                            onClick={() => removePhoto(index)}
                                            className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-[#253B3A] text-xs text-white"
                                        >
                                            ✕
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {video && (
                            <div className="flex items-start gap-3">
                                <video src={video.url} controls className="h-40 rounded-lg bg-black" />
                                <div className="text-sm text-[#61766D]">
                                    <p>동영상 {video.duration}초</p>
                                    <button type="button" onClick={removeVideo} className="mt-2 font-bold text-primary hover:underline">삭제</button>
                                </div>
                            </div>
                        )}

                        {placeOpen && (
                            <div>
                                <p className="text-sm font-bold">📍 장소</p>
                                <div className="mt-3 grid grid-cols-2 gap-3">
                                    <input value={placeName} onChange={(event) => setPlaceName(event.target.value)} placeholder="장소 이름 (예: OO산부인과)" aria-label="장소 이름" className={inputClass} />
                                    <input value={placeAddress} onChange={(event) => setPlaceAddress(event.target.value)} placeholder="주소 (선택)" aria-label="장소 주소" className={inputClass} />
                                </div>
                            </div>
                        )}

                        {pollOpen && (
                            <div>
                                <p className="text-sm font-bold">📊 투표</p>
                                <input value={pollQuestion} onChange={(event) => setPollQuestion(event.target.value)} placeholder="투표 질문을 입력해 주세요" aria-label="투표 질문" className={`${inputClass} mt-3`} />
                                <ul className="mt-3 space-y-2">
                                    {pollOptions.map((option, index) => (
                                        <li key={index} className="flex gap-2">
                                            <input
                                                value={option}
                                                onChange={(event) => setPollOptions((prev) => prev.map((item, i) => (i === index ? event.target.value : item)))}
                                                placeholder={`항목 ${index + 1}`}
                                                aria-label={`투표 항목 ${index + 1}`}
                                                className={inputClass}
                                            />
                                            {pollOptions.length > MIN_POLL_OPTIONS && (
                                                <button type="button" aria-label={`항목 ${index + 1} 삭제`} onClick={() => setPollOptions((prev) => prev.filter((_, i) => i !== index))} className="shrink-0 px-3 text-[#8A9A90] hover:text-primary">✕</button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                                {pollOptions.length < MAX_POLL_OPTIONS && (
                                    <button type="button" onClick={() => setPollOptions((prev) => [...prev, ""])} className="mt-3 text-sm font-bold text-primary hover:underline">+ 항목 추가</button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <label htmlFor="community-content" className="sr-only">내용</label>
                <textarea
                    id="community-content"
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    placeholder="경험이나 궁금한 점을 자유롭게 적어주세요."
                    className="min-h-[560px] w-full resize-y rounded-b-xl border border-[#E1E9E4] p-6 text-lg leading-8 outline-none placeholder:text-[#98A89F] focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                />
            </div>
        </form>
    );
}
