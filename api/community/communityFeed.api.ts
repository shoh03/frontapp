import { mockPopularProducts, queryMockPosts } from "@/app/(public)/community/_mock/posts";
import { getLikedIds, getLocalPosts } from "@/lib/communityLocalStore";
import type { FeedPostListParams, FeedPostListResponse, PopularProduct } from "@/types/community/communityFeed.type";

const MOCK_LATENCY_MS = 400;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// 백엔드 API(GET /api/posts)가 준비되면 이 함수 본문을 fetch 로 바꿉니다. 시그니처와 타입은 그대로 둡니다.
export const getFeedPosts = async (params: FeedPostListParams): Promise<FeedPostListResponse> => {
    // 서버에 저장된 글을 먼저 읽습니다. 서버에 닿지 못할 때만 아래 목업으로 대신합니다.
    try {
        const query = new URLSearchParams({
            category: params.category,
            sort: params.sort,
            q: params.q,
            page: String(params.page),
            size: String(params.size),
        });
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/communities/posts?${query}`, { credentials: "include" });
        if (response.ok) {
            const body: { data: FeedPostListResponse | null } = await response.json();
            if (body.data) return body.data;
        }
    } catch {
        // 네트워크 오류는 목업으로 대신합니다.
    }

    await wait(MOCK_LATENCY_MS);

    // 이 브라우저에서 새로 쓴 글을 함께 보여 주고, 내가 누른 좋아요를 공감 수에 더합니다.
    const response = queryMockPosts(params, getLocalPosts());
    const likedIds = new Set(getLikedIds());
    return {
        ...response,
        items: response.items.map((post) => (likedIds.has(String(post.id)) ? { ...post, likeCount: post.likeCount + 1 } : post)),
    };
};

export const getPopularProducts = async (): Promise<PopularProduct[]> => {
    await wait(MOCK_LATENCY_MS);
    return mockPopularProducts;
};
