import type { FeedCategoryId } from "@/types/community/communityFeed.type";

export interface FeedCategory {
    id: FeedCategoryId;
    label: string;
    color: string;
}

export const FEED_CATEGORIES: FeedCategory[] = [
    { id: "all", label: "전체 피드", color: "bg-cat-all" },
    { id: "pregnancy", label: "임신 이야기", color: "bg-cat-pregnancy" },
    { id: "parenting", label: "육아 이야기", color: "bg-cat-parenting" },
    { id: "neighborhood", label: "우리 동네", color: "bg-cat-neighborhood" },
    { id: "health", label: "건강·병원", color: "bg-cat-health" },
    { id: "living", label: "살림·추천", color: "bg-cat-living" },
];

export const FEED_PAGE_SIZE = 10;
export const SEARCH_DEBOUNCE_MS = 300;
// 오늘의 인기상품을 다시 읽는 간격
export const POPULAR_REFETCH_MS = 5 * 60_000;

export const WRITE_POST_PATH = "/community/new";
export const LOGIN_PATH = "/login";

export const getFeedPagePath = (page: number) => `/community?page=${page}`;

// 목록에서 고른 카테고리를 글쓰기 화면의 게시판 기본값으로 넘깁니다. "전체 피드"는 넘기지 않습니다.
export const getWritePostPath = (category: FeedCategoryId) =>
    category === "all" ? WRITE_POST_PATH : `${WRITE_POST_PATH}?category=${category}`;

// 포커스 링을 지우지 않고 --brand-text 2px 링을 사용합니다.
export const FOCUS_RING = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-text";
