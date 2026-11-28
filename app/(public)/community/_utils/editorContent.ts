import { parsePostContent, toMediaMarker, type PostMediaKind, type PostPhotoAlign, type PostPhotoSize } from "@/lib/community/postContent";
import type { CommunityPostEditData } from "@/types/community/community.type";

// 본문에 놓인 첨부 하나입니다. key 는 저장된 첨부와 새로 고른 파일을 구분하는 값입니다.
export interface EditorMedia {
    kind: PostMediaKind;
    key: string;
    // 사진에서만 씁니다.
    size?: PostPhotoSize;
    align?: PostPhotoAlign;
}

// 글 → 첨부 → 글 순서가 반복됩니다. texts 는 항상 media 보다 한 개 많습니다.
export interface EditorContent {
    texts: string[];
    media: EditorMedia[];
}

// 글 입력란에서 마지막으로 커서가 있던 자리입니다.
export interface EditorCursor {
    index: number;
    position: number;
}

export const toSavedKey = (kind: PostMediaKind, id: number): string => `saved-${kind}-${id}`;

const joinLines = (first: string, second: string): string => (first && second ? `${first}\n${second}` : first || second);

// 수정할 글을 편집 상태로 바꿉니다. 위치를 지정하지 않았던 첨부는 상세 화면처럼 맨 위에 둡니다.
export const toEditorContent = (post?: CommunityPostEditData): EditorContent => {
    if (!post) return { texts: [""], media: [] };

    const keys: Record<PostMediaKind, string[]> = {
        photo: post.photos.map((photo) => toSavedKey("photo", photo.id)),
        video: post.videos.map((video) => toSavedKey("video", video.id)),
    };
    const texts = [""];
    const media: EditorMedia[] = [];
    for (const block of parsePostContent(post.content, { photo: keys.photo.length, video: keys.video.length })) {
        if (block.type === "text") {
            texts[texts.length - 1] = block.text;
        } else {
            media.push({ kind: block.kind, key: keys[block.kind][block.index], size: block.size, align: block.align });
            texts.push("");
        }
    }

    const placed = new Set(media.map((item) => item.key));
    const unplaced = (["photo", "video"] as const).flatMap((kind) =>
        keys[kind].filter((key) => !placed.has(key)).map((key) => ({ kind, key })),
    );
    return {
        texts: [...unplaced.map(() => ""), ...texts],
        media: [...unplaced, ...media],
    };
};

// 커서 자리에서 글을 나눠 첨부를 끼워 넣습니다.
export const insertMedia = (content: EditorContent, cursor: EditorCursor, added: EditorMedia[]): EditorContent => {
    if (added.length === 0) return content;

    const index = Math.min(cursor.index, content.texts.length - 1);
    const text = content.texts[index];
    const position = Math.min(cursor.position, text.length);
    const before = text.slice(0, position).replace(/\n$/, "");
    const after = text.slice(position).replace(/^\n/, "");

    return {
        texts: [...content.texts.slice(0, index), before, ...added.slice(1).map(() => ""), after, ...content.texts.slice(index + 1)],
        media: [...content.media.slice(0, index), ...added, ...content.media.slice(index)],
    };
};

// 첨부를 빼고 앞뒤 글을 합칩니다.
export const removeMedia = (content: EditorContent, key: string): EditorContent => {
    const index = content.media.findIndex((item) => item.key === key);
    if (index < 0) return content;

    const merged = joinLines(content.texts[index], content.texts[index + 1]);
    return {
        texts: [...content.texts.slice(0, index), merged, ...content.texts.slice(index + 2)],
        media: content.media.filter((_, i) => i !== index),
    };
};

// 첨부를 한 줄 위(-1)나 아래(1)로 옮깁니다. 사이에 글이 없으면 이웃 첨부와 자리를 바꿉니다.
export const moveMedia = (content: EditorContent, index: number, direction: -1 | 1): EditorContent => {
    const texts = [...content.texts];
    const media = [...content.media];
    const from = direction === -1 ? index : index + 1;
    const to = direction === -1 ? index + 1 : index;

    if (texts[from]) {
        const lines = texts[from].split("\n");
        const line = (direction === -1 ? lines.pop() : lines.shift()) ?? "";
        texts[from] = lines.join("\n");
        texts[to] = direction === -1 ? joinLines(line, texts[to]) : joinLines(texts[to], line);
    } else {
        const neighbor = index + direction;
        if (neighbor < 0 || neighbor >= media.length) return content;
        [media[index], media[neighbor]] = [media[neighbor], media[index]];
    }
    return { texts, media };
};

// 사진의 크기나 정렬을 바꿉니다. 값이 undefined 이면 기본값(원본 크기, 가운데 정렬)입니다.
export const styleMedia = (content: EditorContent, key: string, style: Pick<EditorMedia, "size" | "align">): EditorContent => ({
    ...content,
    media: content.media.map((item) => (item.key === key ? { ...item, ...style } : item)),
});

// 서버에 저장할 본문을 만듭니다. order 는 저장된 뒤의 첨부 순서대로 늘어놓은 key 입니다.
export const serializeContent = (content: EditorContent, order: Record<PostMediaKind, string[]>): string =>
    content.texts
        .flatMap((text, i) => {
            const item = content.media[i];
            return [text, item ? toMediaMarker(item.kind, order[item.kind].indexOf(item.key), item.size, item.align) : ""];
        })
        .filter(Boolean)
        .join("\n")
        .trim();
