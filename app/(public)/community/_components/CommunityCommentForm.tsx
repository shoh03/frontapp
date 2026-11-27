"use client";

import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";

const MAX_COMMENT_LENGTH = 1000;

interface CommunityCommentFormProps {
    // false 를 돌려주면 저장에 실패한 것이므로 입력한 글을 남깁니다.
    onSubmit: (content: string) => Promise<boolean>;
}

export default function CommunityCommentForm({ onSubmit }: CommunityCommentFormProps) {
    const [draft, setDraft] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const trimmed = draft.trim();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!trimmed || isSubmitting) return;
        setIsSubmitting(true);
        if (await onSubmit(trimmed)) setDraft("");
        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit} className="mt-3 flex h-[60px] items-center gap-3 rounded-feed-lg border border-line pr-2.5 pl-3.5">
            <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-placeholder text-sm">🌱</span>
            <label htmlFor="community-comment" className="sr-only">응원의 댓글 작성</label>
            <input
                id="community-comment"
                type="text"
                value={draft}
                maxLength={MAX_COMMENT_LENGTH}
                readOnly={isSubmitting}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="응원의 댓글을 남겨보세요"
                className="h-10 min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-mute-light focus-visible:outline-2 focus-visible:outline-brand-text"
            />
            <button
                type="submit"
                disabled={!trimmed || isSubmitting}
                aria-label="댓글 등록"
                className="flex size-10 shrink-0 items-center justify-center rounded-feed-md bg-primary text-white hover:bg-brand-hover disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-text"
            >
                <Send aria-hidden="true" className="size-4" />
            </button>
        </form>
    );
}
