import type { PostPhotoAlign, PostPhotoSize } from "@/lib/community/postContent";
import type { CommunityCategory, CommunityPrefix } from "@/types/community/community.type";

export const BOARDS: CommunityCategory[] = ["임신 이야기", "육아 이야기", "우리 동네", "건강·병원", "살림·추천"];

// 게시판별 말머리입니다. 백엔드 post_schema.py 의 POST_PREFIXES_BY_CATEGORY 와 같아야 합니다.
export const BOARD_PREFIXES: Record<CommunityCategory, CommunityPrefix[]> = {
    "임신 이야기": ["질문", "후기", "정보 공유", "일상"],
    "육아 이야기": ["질문", "후기", "정보 공유", "일상"],
    "우리 동네": ["질문", "정보 공유", "모임", "일상"],
    "건강·병원": ["질문", "후기", "정보 공유"],
    "살림·추천": ["질문", "추천", "후기", "정보 공유"],
};

export const MAX_TITLE_LENGTH = 200;
export const MAX_PHOTOS = 10;
export const MAX_VIDEOS = 3;
export const MAX_VIDEO_SECONDS = 60;
export const MIN_POLL_OPTIONS = 2;
export const MAX_POLL_OPTIONS = 5;
export const MAX_POLL_QUESTION_LENGTH = 300;

// 사진 크기 선택지입니다. size 가 없으면 원본 크기입니다.
export const PHOTO_SIZE_OPTIONS: { size?: PostPhotoSize; label: string }[] = [
    { label: "원본" },
    { size: 25, label: "25%" },
    { size: 50, label: "50%" },
    { size: 75, label: "75%" },
    { size: 100, label: "100%" },
];

export const PHOTO_WIDTH_CLASSES: Record<PostPhotoSize, string> = {
    25: "w-1/4",
    50: "w-1/2",
    75: "w-3/4",
    100: "w-full",
};

// 사진 정렬 선택지입니다. align 이 없으면 가운데 정렬입니다.
export const PHOTO_ALIGN_OPTIONS: { align?: PostPhotoAlign; label: string }[] = [
    { align: "left", label: "왼쪽" },
    { label: "가운데" },
    { align: "right", label: "오른쪽" },
];

export const PHOTO_ALIGN_CLASSES: Record<PostPhotoAlign | "center", string> = {
    left: "mr-auto",
    center: "mx-auto",
    right: "ml-auto",
};

export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
