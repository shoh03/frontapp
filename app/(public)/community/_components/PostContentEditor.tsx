"use client";

import { Fragment, type RefObject, type SyntheticEvent } from "react";
import { ArrowDown, ArrowUp, X } from "lucide-react";
import { FOCUS_RING } from "../_constants/feed";
import { PHOTO_ALIGN_CLASSES, PHOTO_ALIGN_OPTIONS, PHOTO_SIZE_OPTIONS, PHOTO_WIDTH_CLASSES } from "../_constants/write";
import { moveMedia, styleMedia, type EditorContent, type EditorCursor } from "../_utils/editorContent";

interface PostContentEditorProps {
    id: string;
    content: EditorContent;
    // 첨부 key 별 미리보기 주소입니다.
    previews: Map<string, string>;
    cursorRef: RefObject<EditorCursor>;
    onChange: (next: EditorContent) => void;
    onRemove: (key: string) => void;
}

// 글과 글에 끼워 넣은 사진·동영상을 순서대로 보여 주는 본문 입력란입니다.
export default function PostContentEditor({ id, content, previews, cursorRef, onChange, onRemove }: PostContentEditorProps) {
    const lastIndex = content.texts.length - 1;
    const buttonClass = `flex size-8 items-center justify-center rounded-full border border-line bg-surface text-ink hover:bg-surface-alt disabled:opacity-40 ${FOCUS_RING}`;

    const optionClass = (active: boolean) =>
        `rounded-full border px-3 py-1 text-xs ${active ? "border-primary font-bold text-primary" : "border-line text-mute hover:bg-surface-alt"} ${FOCUS_RING}`;

    const rememberCursor = (index: number, event: SyntheticEvent<HTMLTextAreaElement>) => {
        cursorRef.current = { index, position: event.currentTarget.selectionStart };
    };

    const handleMove = (index: number, direction: -1 | 1) => {
        // 자리가 바뀌면 기억한 커서 위치가 맞지 않으므로 글 끝으로 되돌립니다.
        cursorRef.current = { index: Number.MAX_SAFE_INTEGER, position: Number.MAX_SAFE_INTEGER };
        onChange(moveMedia(content, index, direction));
    };

    return (
        <div className="flex min-h-[560px] w-full flex-col gap-4 rounded-b-xl border border-[#E1E9E4] p-6 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
            {content.texts.map((text, index) => {
                const item = content.media[index];
                const preview = item ? previews.get(item.key) : undefined;
                const label = item?.kind === "video" ? "동영상" : "사진";
                const number = item ? content.media.slice(0, index + 1).filter((other) => other.kind === item.kind).length : 0;

                return (
                    // 글 입력란의 key 는 바로 앞 첨부를 따라갑니다.
                    <Fragment key={index === 0 ? "start" : content.media[index - 1].key}>
                        {/* 숨긴 글자가 높이를 만들어 입력란이 글 길이만큼 늘어납니다. 마지막 입력란은 남은 높이를 채웁니다. */}
                        <div className={`grid text-lg leading-8 ${index === lastIndex ? "grow" : ""}`}>
                            <div aria-hidden="true" className="invisible [grid-area:1/1] break-words whitespace-pre-wrap">{`${text} `}</div>
                            <textarea
                                id={index === 0 ? id : undefined}
                                aria-label={index === 0 ? undefined : `내용 ${index + 1}번째 부분`}
                                value={text}
                                rows={1}
                                onChange={(event) => {
                                    rememberCursor(index, event);
                                    onChange({ ...content, texts: content.texts.map((value, i) => (i === index ? event.target.value : value)) });
                                }}
                                onSelect={(event) => rememberCursor(index, event)}
                                placeholder={content.media.length === 0 ? "경험이나 궁금한 점을 자유롭게 적어주세요." : "이어서 적어주세요."}
                                className="size-full resize-none overflow-hidden break-words bg-transparent outline-none [grid-area:1/1] placeholder:text-[#98A89F]"
                            />
                        </div>

                        {item && preview && (
                            <figure className={`relative max-w-full ${PHOTO_ALIGN_CLASSES[item.align ?? "center"]} ${item.size ? PHOTO_WIDTH_CLASSES[item.size] : "w-fit"}`}>
                                {item.kind === "photo" ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={preview} alt={`첨부 사진 ${number}`} className={`rounded-feed-lg ${item.size ? "w-full" : "max-w-full"}`} />
                                ) : (
                                    <video src={preview} controls className="max-w-full rounded-feed-lg bg-black" />
                                )}
                                <div className="absolute top-3 right-3 flex gap-2">
                                    <button type="button" aria-label={`${label} ${number} 위로 옮기기`} title="위로 옮기기" disabled={index === 0 && !text} onClick={() => handleMove(index, -1)} className={buttonClass}>
                                        <ArrowUp aria-hidden="true" className="size-4" />
                                    </button>
                                    <button type="button" aria-label={`${label} ${number} 아래로 옮기기`} title="아래로 옮기기" disabled={index === content.media.length - 1 && !content.texts[index + 1]} onClick={() => handleMove(index, 1)} className={buttonClass}>
                                        <ArrowDown aria-hidden="true" className="size-4" />
                                    </button>
                                    <button type="button" aria-label={`${label} ${number} 삭제`} title="삭제" onClick={() => onRemove(item.key)} className={buttonClass}>
                                        <X aria-hidden="true" className="size-4" />
                                    </button>
                                </div>
                            </figure>
                        )}

                        {item?.kind === "photo" && preview && (
                            <div className="-mt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                                <div role="group" aria-label={`사진 ${number} 크기`} className="flex items-center gap-2">
                                    <span className="text-sm text-mute">크기</span>
                                    {PHOTO_SIZE_OPTIONS.map((option) => (
                                        <button
                                            key={option.label}
                                            type="button"
                                            aria-pressed={item.size === option.size}
                                            onClick={() => onChange(styleMedia(content, item.key, { size: option.size }))}
                                            className={optionClass(item.size === option.size)}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                                <div role="group" aria-label={`사진 ${number} 정렬`} className="flex items-center gap-2">
                                    <span className="text-sm text-mute">정렬</span>
                                    {PHOTO_ALIGN_OPTIONS.map((option) => (
                                        <button
                                            key={option.label}
                                            type="button"
                                            aria-pressed={item.align === option.align}
                                            onClick={() => onChange(styleMedia(content, item.key, { align: option.align }))}
                                            className={optionClass(item.align === option.align)}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Fragment>
                );
            })}
        </div>
    );
}
