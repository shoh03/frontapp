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

export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
