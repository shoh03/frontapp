// 게시글 본문 안의 사진·동영상 위치를 다룹니다.
// 서버에는 본문 문자열 한 개만 저장하므로, 첨부가 들어갈 자리를 [[photo:1]] 같은 한 줄로 남깁니다.
// 번호는 서버가 돌려주는 사진(또는 동영상) 목록의 순번이며 1부터 셉니다.
// 크기를 고른 사진은 [[photo:1:50]] 처럼 본문 폭에 대한 비율(%)을 덧붙이고,
// 왼쪽·오른쪽 정렬은 [[photo:1:50:left]] 처럼 뒤에 덧붙입니다.

export type PostMediaKind = "photo" | "video";

export const PHOTO_SIZES = [25, 50, 75, 100] as const;

// 값이 없으면 원본 크기입니다(본문보다 크면 본문 폭에 맞춥니다).
export type PostPhotoSize = (typeof PHOTO_SIZES)[number];

// 값이 없으면 가운데 정렬입니다.
export type PostPhotoAlign = "left" | "right";

export type PostContentBlock =
    | { type: "text"; text: string }
    | { type: "media"; kind: PostMediaKind; index: number; size?: PostPhotoSize; align?: PostPhotoAlign };

const MARKER = /^\[\[(photo|video):(\d+)(?::(\d+))?(?::(left|right))?\]\]$/;

export const toMediaMarker = (kind: PostMediaKind, index: number, size?: PostPhotoSize, align?: PostPhotoAlign): string =>
    `[[${[kind, index + 1, size, align].filter(Boolean).join(":")}]]`;

// 본문을 글과 첨부 자리로 나눕니다. index 는 0부터 셉니다.
// 없는 첨부를 가리키거나 같은 첨부를 두 번 가리키는 줄은 글 그대로 둡니다.
export const parsePostContent = (content: string, counts: Record<PostMediaKind, number>): PostContentBlock[] => {
    const blocks: PostContentBlock[] = [];
    const used = new Set<string>();
    let lines: string[] = [];
    const flushText = () => {
        if (lines.length > 0) blocks.push({ type: "text", text: lines.join("\n") });
        lines = [];
    };

    for (const line of content.replace(/\r\n/g, "\n").split("\n")) {
        const match = MARKER.exec(line.trim());
        if (match) {
            const kind = match[1] as PostMediaKind;
            const index = Number(match[2]) - 1;
            const id = `${kind}:${index}`;
            if (index >= 0 && index < counts[kind] && !used.has(id)) {
                used.add(id);
                flushText();
                // 정해 둔 크기가 아니면 원본 크기로 보여 줍니다.
                const size = kind === "photo" ? PHOTO_SIZES.find((item) => item === Number(match[3])) : undefined;
                const align = kind === "photo" ? (match[4] as PostPhotoAlign | undefined) : undefined;
                blocks.push({ type: "media", kind, index, size, align });
                continue;
            }
        }
        lines.push(line);
    }
    flushText();
    return blocks;
};
