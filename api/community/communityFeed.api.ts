import type { FeedPostListParams, FeedPostListResponse, PopularProduct } from "@/types/community/communityFeed.type";

// 서버 응답에서 data 를 꺼냅니다. 실패하면 예외를 던져 화면의 에러 상태로 넘깁니다.
const requestData = async <T>(path: string, init?: RequestInit): Promise<T> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`, init);
    if (!response.ok) throw new Error(`request failed: ${response.status}`);
    const body: { data: T | null } = await response.json();
    if (!body.data) throw new Error("empty response");
    return body.data;
};

export const getFeedPosts = async (params: FeedPostListParams): Promise<FeedPostListResponse> => {
    const query = new URLSearchParams({
        category: params.category,
        sort: params.sort,
        q: params.q,
        page: String(params.page),
        size: String(params.size),
    });
    return requestData<FeedPostListResponse>(`/communities/posts?${query}`, { credentials: "include" });
};

// 매일 09:00(KST) 기준 인기상품입니다.
export const getPopularProducts = async (): Promise<PopularProduct[]> =>
    requestData<PopularProduct[]>("/babyshop/popular-products");
