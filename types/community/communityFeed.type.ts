export type FeedCategoryId = "all" | "pregnancy" | "parenting" | "neighborhood" | "health" | "living";

export type FeedAuthorTag = "예비맘" | "육아맘";

export type FeedSort = "popular" | "latest";

// 커뮤니티 피드(목록) 화면 전용 형식입니다. 필드는 docs/screens/community.md 9번 데이터 계약과 같습니다.
export interface FeedPost {
    id: number;
    category: Exclude<FeedCategoryId, "all">;
    authorTag: FeedAuthorTag;
    prefix?: string; // 말머리
    title: string;
    authorName: string;
    thumbnailUrl: string | null;
    likeCount: number;
    commentCount: number;
    viewCount: number;
    createdAt: string;
}

export interface FeedPostListParams {
    category: FeedCategoryId;
    sort: FeedSort;
    q: string;
    page: number;
    size: number;
}

export interface FeedPostListResponse {
    items: FeedPost[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

export interface PopularProduct {
    id: number;
    rank: number;
    name: string;
    discountRate: number;
    price: number;
    thumbnailUrl: string | null;
}
