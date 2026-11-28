"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { createCommunityPost, updateCommunityPost } from "@/api/community/community.api";
import type {
    CommunityCategory,
    CommunityPostEditData,
    CommunityPostPayload,
    CommunityPostPlace,
    CommunityPrefix,
} from "@/types/community/community.type";
import {
    BOARD_PREFIXES,
    BOARDS,
    MAX_PHOTO_BYTES,
    MAX_PHOTOS,
    MAX_POLL_OPTIONS,
    MAX_POLL_QUESTION_LENGTH,
    MAX_TITLE_LENGTH,
    MAX_VIDEO_BYTES,
    MAX_VIDEO_SECONDS,
    MAX_VIDEOS,
    MIN_POLL_OPTIONS,
} from "../_constants/write";
import { insertMedia, removeMedia, serializeContent, toEditorContent, toSavedKey, type EditorCursor, type EditorMedia } from "../_utils/editorContent";
import PostContentEditor from "./PostContentEditor";
import PlaceSearch from "./PlaceSearch";

interface CommunityWriteFormProps {
    formId: string;
    // 있으면 이 게시글을 수정하는 폼이 됩니다.
    initialPost?: CommunityPostEditData;
    // 새 글의 게시판 기본값입니다.
    defaultCategory?: CommunityCategory;
}

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

// 예전 글의 말머리가 게시판에 없으면 첫 번째 말머리를 고릅니다.
const toPrefix = (category: CommunityCategory, prefix?: string): CommunityPrefix =>
    BOARD_PREFIXES[category].find((item) => item === prefix) ?? BOARD_PREFIXES[category][0];

export default function CommunityWriteForm({ formId, initialPost, defaultCategory }: CommunityWriteFormProps) {
    const startCategory = initialPost?.category ?? defaultCategory ?? BOARDS[0];
    const router = useRouter();
    const queryClient = useQueryClient();
    const photoInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const [isPublic, setIsPublic] = useState(true);
    const [category, setCategory] = useState<CommunityCategory>(startCategory);
    const [prefix, setPrefix] = useState<CommunityPrefix>(() => toPrefix(startCategory, initialPost?.prefix));
    const [title, setTitle] = useState(initialPost?.title ?? "");
    // 본문과, 본문 사이에 놓인 첨부의 위치입니다.
    const [content, setContent] = useState(() => toEditorContent(initialPost));
    // 첨부를 끼워 넣을 자리입니다. 본문을 누른 적이 없으면 글 끝입니다.
    const cursorRef = useRef<EditorCursor>({ index: Number.MAX_SAFE_INTEGER, position: Number.MAX_SAFE_INTEGER });
    // 수정할 때 남아 있는 기존 첨부입니다. 아래 photos·videos 는 새로 고른 파일입니다.
    const [savedPhotos, setSavedPhotos] = useState(initialPost?.photos ?? []);
    const [savedVideos, setSavedVideos] = useState(initialPost?.videos ?? []);
    const [photos, setPhotos] = useState<PhotoItem[]>([]);
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [placeOpen, setPlaceOpen] = useState(!!initialPost?.place);
    const [place, setPlace] = useState<CommunityPostPlace | null>(initialPost?.place ?? null);
    const [pollOpen, setPollOpen] = useState(!!initialPost?.poll);
    const [pollQuestion, setPollQuestion] = useState(initialPost?.poll?.question ?? "");
    const [pollOptions, setPollOptions] = useState<string[]>(initialPost?.poll?.options ?? ["", ""]);
    const [pollMultiple, setPollMultiple] = useState(initialPost?.poll?.allowMultiple ?? false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isReadingVideos, setIsReadingVideos] = useState(false);
    const isPollLocked = !!initialPost?.poll?.locked;

    // 이 페이지는 상태가 보존되므로, 새로 들어올 때(bfcacheId 변경)마다 게시판만 기본값으로 다시 맞춥니다.
    // 작성 중인 내용은 그대로 두고, 뒤로·앞으로 가기에서는 직접 고른 게시판도 유지합니다.
    const entry = `${router.bfcacheId}:${defaultCategory ?? ""}`;
    const [appliedEntry, setAppliedEntry] = useState(entry);
    if (appliedEntry !== entry) {
        setAppliedEntry(entry);
        if (defaultCategory) {
            setCategory(defaultCategory);
            setPrefix(toPrefix(defaultCategory, prefix));
        }
    }
    const canSubmit = title.trim().length > 0 && content.texts.join("").trim().length > 0 && !isSubmitting;

    // 새로 고른 첨부를 커서 자리에 넣고, 다음 첨부가 그 뒤에 이어지도록 커서를 옮깁니다.
    const placeMedia = (added: EditorMedia[]) => {
        if (added.length === 0) return;
        const cursor = cursorRef.current;
        setContent((prev) => {
            const next = insertMedia(prev, cursor, added);
            const last = next.media.findIndex((item) => item.key === added[added.length - 1].key);
            cursorRef.current = { index: last + 1, position: 0 };
            return next;
        });
    };

    const handlePhotos =(event: ChangeEvent<HTMLInputElement>) => {
        const picked = Array.from(event.target.files ?? []);
        event.target.value = "";

        const valid = picked.filter((file) => file.type.startsWith("image/") && file.size <= MAX_PHOTO_BYTES);
        if (valid.length < picked.length) window.alert("10MB 이하의 이미지 파일만 첨부할 수 있어요.");

        const added = valid.slice(0, MAX_PHOTOS - savedPhotos.length - photos.length).map((file) => ({ file, preview: URL.createObjectURL(file) }));
        if (valid.length > added.length) window.alert(`사진은 최대 ${MAX_PHOTOS}장까지 첨부할 수 있어요.`);
        setPhotos((prev) => [...prev, ...added]);
        placeMedia(added.map((photo) => ({ kind: "photo", key: photo.preview })));
    };

    const handleVideos = async (event: ChangeEvent<HTMLInputElement>) => {
        const picked = Array.from(event.target.files ?? []);
        event.target.value = "";

        // 길이를 읽는 동안에는 다시 고르지 못하게 합니다.
        setIsReadingVideos(true);
        const added: VideoItem[] = [];
        const errors = new Set<string>();
        for (const file of picked) {
            if (!file.type.startsWith("video/") || file.size > MAX_VIDEO_BYTES) {
                errors.add("100MB 이하의 동영상 파일만 첨부할 수 있어요.");
                continue;
            }
            const url = URL.createObjectURL(file);
            try {
                const duration = await readVideoDuration(url);
                if (duration > MAX_VIDEO_SECONDS) {
                    URL.revokeObjectURL(url);
                    errors.add("동영상은 한 개당 최대 1분까지 첨부할 수 있어요.");
                    continue;
                }
                added.push({ file, url, duration: Math.round(duration) });
            } catch {
                URL.revokeObjectURL(url);
                errors.add("불러오지 못한 동영상이 있어요.");
            }
        }

        const accepted = added.slice(0, MAX_VIDEOS - savedVideos.length - videos.length);
        if (added.length > accepted.length) errors.add(`동영상은 최대 ${MAX_VIDEOS}개까지 첨부할 수 있어요.`);
        added.slice(accepted.length).forEach((item) => URL.revokeObjectURL(item.url));
        setVideos((prev) => [...prev, ...accepted]);
        placeMedia(accepted.map((video) => ({ kind: "video", key: video.url })));
        setIsReadingVideos(false);
        if (errors.size > 0) window.alert([...errors].join("\n"));
    };

    // 본문에서 첨부를 빼면 파일 목록에서도 지웁니다.
    const handleRemoveMedia = (key: string) => {
        cursorRef.current = { index: Number.MAX_SAFE_INTEGER, position: Number.MAX_SAFE_INTEGER };
        if (photos.some((photo) => photo.preview === key) || videos.some((video) => video.url === key)) URL.revokeObjectURL(key);
        setContent((prev) => removeMedia(prev, key));
        setPhotos((prev) => prev.filter((photo) => photo.preview !== key));
        setVideos((prev) => prev.filter((video) => video.url !== key));
        setSavedPhotos((prev) => prev.filter((photo) => toSavedKey("photo", photo.id) !== key));
        setSavedVideos((prev) => prev.filter((video) => toSavedKey("video", video.id) !== key));
    };

    // 장소·투표를 삭제하면 입력란을 닫고 값도 비웁니다.
    const removePlace = () => {
        setPlaceOpen(false);
        setPlace(null);
    };

    const removePoll = () => {
        setPollOpen(false);
        setPollQuestion("");
        setPollOptions(["", ""]);
        setPollMultiple(false);
    };

    const handleCategoryChange = (next: CommunityCategory) => {
        setCategory(next);
        // 새 게시판에 없는 말머리는 첫 번째 말머리로 바꿉니다.
        if (!BOARD_PREFIXES[next].includes(prefix)) setPrefix(BOARD_PREFIXES[next][0]);
    };

    // 이 페이지는 이동해도 상태가 남을 수 있어, 등록에 성공하면 처음 상태로 되돌립니다.
    const resetForm = () => {
        photos.forEach((photo) => URL.revokeObjectURL(photo.preview));
        videos.forEach((video) => URL.revokeObjectURL(video.url));
        setIsPublic(true);
        setCategory(startCategory);
        setPrefix(toPrefix(startCategory));
        setTitle("");
        setContent(toEditorContent());
        cursorRef.current = { index: Number.MAX_SAFE_INTEGER, position: Number.MAX_SAFE_INTEGER };
        setPhotos([]);
        setVideos([]);
        removePlace();
        removePoll();
        setIsSubmitting(false);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!canSubmit) return;

        const filledOptions = pollOptions.map((option) => option.trim()).filter(Boolean);
        if (pollOpen && (!pollQuestion.trim() || filledOptions.length < MIN_POLL_OPTIONS)) {
            window.alert("투표는 제목과 항목을 2개 이상 입력해 주세요. 투표를 쓰지 않으려면 투표를 삭제해 주세요.");
            return;
        }
        if (placeOpen && !place) {
            window.alert("검색 결과에서 장소를 선택해 주세요. 장소를 쓰지 않으려면 장소를 삭제해 주세요.");
            return;
        }

        const payload: CommunityPostPayload = {
            isPublic,
            category,
            prefix,
            title: title.trim(),
            // 서버는 남긴 첨부 뒤에 새 첨부를 붙여 저장하므로, 같은 순서로 번호를 매깁니다.
            content: serializeContent(content, {
                photo: [...savedPhotos.map((photo) => toSavedKey("photo", photo.id)), ...photos.map((photo) => photo.preview)],
                video: [...savedVideos.map((video) => toSavedKey("video", video.id)), ...videos.map((video) => video.url)],
            }),
            photos: photos.map((photo) => photo.file),
            videos: videos.map(({ file, duration }) => ({ file, duration })),
            place: placeOpen ? place : null,
            poll: pollOpen ? { question: pollQuestion.trim(), options: filledOptions, allowMultiple: pollMultiple } : null,
        };
        const action = initialPost ? "수정" : "등록";

        setIsSubmitting(true);
        try {
            if (initialPost) {
                await updateCommunityPost(initialPost.id, payload, {
                    photoIds: savedPhotos.map((photo) => photo.id),
                    videoIds: savedVideos.map((video) => video.id),
                });
            } else {
                await createCommunityPost(payload);
            }
            // 피드 목록 캐시에 바뀐 내용이 보이도록 다시 불러오게 합니다.
            await queryClient.invalidateQueries({ queryKey: ["community", "posts"] });
            if (initialPost) {
                // 뒤로 가기로 수정 화면에 돌아가지 않도록 바꿔치기하고, 상세 화면은 새로 읽게 합니다.
                router.replace(`/community/${initialPost.id}`);
                router.refresh();
            } else {
                resetForm();
                router.push("/community");
            }
        } catch (error) {
            setIsSubmitting(false);
            const message = error instanceof Error ? error.message : "";
            if (message === "로그인이 필요합니다.") window.alert(`로그인이 필요합니다. 다시 로그인한 뒤 ${action}해 주세요.`);
            else if (message.startsWith("참여한 사람이")) window.alert(message);
            else window.alert(`게시글 ${action}에 실패했습니다. 잠시 후 다시 시도해 주세요.`);
        }
    };

    const toolbarClass = (active: boolean) =>
        `flex w-16 flex-col items-center gap-1 rounded-lg py-2 text-xs hover:bg-[#F4F7F5] ${active ? "bg-[#F4F7F5] font-bold text-primary" : "text-[#61766D]"}`;
    const inputClass =
        "h-12 w-full rounded-xl border border-[#E1E9E4] px-4 text-base outline-none placeholder:text-[#98A89F] focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20";

    const previews = new Map<string, string>([
        ...savedPhotos.map((photo): [string, string] => [toSavedKey("photo", photo.id), photo.url]),
        ...savedVideos.map((video): [string, string] => [toSavedKey("video", video.id), video.url]),
        ...photos.map((photo): [string, string] => [photo.preview, photo.preview]),
        ...videos.map((video): [string, string] => [video.url, video.url]),
    ]);

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
                    <label htmlFor={`${formId}-board`} className="text-sm font-bold">게시판</label>
                    <select
                        id={`${formId}-board`}
                        value={category}
                        onChange={(event) => handleCategoryChange(event.target.value as CommunityCategory)}
                        className="mt-3 h-14 w-full rounded-xl border border-[#E1E9E4] bg-white px-5 text-base outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                    >
                        {BOARDS.map((board) => <option key={board} value={board}>{board}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor={`${formId}-prefix`} className="text-sm font-bold">말머리</label>
                    <select
                        id={`${formId}-prefix`}
                        value={prefix}
                        onChange={(event) => setPrefix(event.target.value as CommunityPrefix)}
                        className="mt-3 h-14 w-full rounded-xl border border-[#E1E9E4] bg-white px-5 text-base text-[#253B3A] outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                    >
                        {BOARD_PREFIXES[category].map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                </div>
            </div>

            <div className="mt-8">
                <label htmlFor={`${formId}-title`} className="text-sm font-bold">제목</label>
                <input
                    id={`${formId}-title`}
                    type="text"
                    value={title}
                    maxLength={MAX_TITLE_LENGTH}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="어떤 이야기를 나누고 싶으세요?"
                    className="mt-3 h-14 w-full rounded-xl border border-[#E1E9E4] px-5 text-base outline-none placeholder:text-[#98A89F] focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                />
            </div>

            <div className="mt-8">
                <span className="text-sm font-bold">내용</span>
                <div role="toolbar" aria-label="본문 도구" className="mt-3 flex flex-wrap gap-2 rounded-t-xl border border-b-0 border-[#E1E9E4] px-4 pt-4 pb-3">
                    <button type="button" onClick={() => photoInputRef.current?.click()} className={toolbarClass(savedPhotos.length + photos.length > 0)}>
                        <span aria-hidden="true" className="text-base">📷</span>
                        사진
                    </button>
                    <button type="button" onClick={() => videoInputRef.current?.click()} disabled={isReadingVideos} className={toolbarClass(savedVideos.length + videos.length > 0)}>
                        <span aria-hidden="true" className="text-base">🎥</span>
                        동영상
                    </button>
                    <button type="button" onClick={() => setPlaceOpen((prev) => !prev)} aria-pressed={placeOpen} className={toolbarClass(placeOpen)}>
                        <span aria-hidden="true" className="text-base">📍</span>
                        장소
                    </button>
                    <button type="button" onClick={() => setPollOpen((prev) => !prev)} disabled={isPollLocked} aria-pressed={pollOpen} className={toolbarClass(pollOpen)}>
                        <span aria-hidden="true" className="text-base">📊</span>
                        투표
                    </button>
                    <input ref={photoInputRef} type="file" accept="image/*" multiple hidden onChange={handlePhotos} />
                    <input ref={videoInputRef} type="file" accept="video/*" multiple hidden onChange={handleVideos} />
                </div>

                {(placeOpen || pollOpen) && (
                    <div className="space-y-5 border border-b-0 border-[#E1E9E4] p-5">
                        {placeOpen && <PlaceSearch value={place} onChange={setPlace} onRemove={removePlace} />}

                        {pollOpen && (
                            <fieldset disabled={isPollLocked}>
                                <div className="flex items-center justify-between gap-4">
                                    <p className="text-sm font-bold">📊 투표</p>
                                    {!isPollLocked && (
                                        <button type="button" aria-label="투표 삭제" onClick={removePoll} className="shrink-0 text-sm font-bold text-primary hover:underline">삭제</button>
                                    )}
                                </div>
                                {isPollLocked && <p className="mt-2 text-sm text-[#8A9A90]">참여한 사람이 있는 투표는 수정하거나 삭제할 수 없어요.</p>}
                                <input value={pollQuestion} onChange={(event) => setPollQuestion(event.target.value)} placeholder="투표 제목을 입력해 주세요" aria-label="투표 제목" maxLength={MAX_POLL_QUESTION_LENGTH} className={`${inputClass} mt-3`} />
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
                                            {!isPollLocked && pollOptions.length > MIN_POLL_OPTIONS && (
                                                <button type="button" aria-label={`항목 ${index + 1} 삭제`} onClick={() => setPollOptions((prev) => prev.filter((_, i) => i !== index))} className="shrink-0 px-3 text-[#8A9A90] hover:text-primary">✕</button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                                {!isPollLocked && pollOptions.length < MAX_POLL_OPTIONS && (
                                    <button type="button" onClick={() => setPollOptions((prev) => [...prev, ""])} className="mt-3 text-sm font-bold text-primary hover:underline">+ 항목 추가</button>
                                )}
                                <label className="mt-4 flex w-fit items-center gap-2 text-sm text-[#61766D]">
                                    <input type="checkbox" checked={pollMultiple} onChange={(event) => setPollMultiple(event.target.checked)} className="size-4 accent-primary" />
                                    복수 선택 허용
                                </label>
                            </fieldset>
                        )}
                    </div>
                )}

                <label htmlFor={`${formId}-content`} className="sr-only">내용</label>
                <PostContentEditor
                    id={`${formId}-content`}
                    content={content}
                    previews={previews}
                    cursorRef={cursorRef}
                    onChange={setContent}
                    onRemove={handleRemoveMedia}
                />
                <p className="mt-2 text-sm text-mute">사진·동영상은 본문에서 커서가 있는 자리에 들어가요.</p>
            </div>
        </form>
    );
}
