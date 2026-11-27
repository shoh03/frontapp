import type { FeedPost, FeedPostListParams, FeedPostListResponse, PopularProduct } from "@/types/community/communityFeed.type";

const MINUTE = 60_000;

const titlesByCategory: Record<FeedPost["category"], string[]> = {
    pregnancy: [
        "오늘 정밀 초음파 보고 왔어요! 건강하게 잘 크고 있대요 😊",
        "임신 28주 허리 통증 어떻게 버티고 계세요?",
        "입덧이 끝나고 나니 이번엔 식욕 폭발이에요",
        "태동이 처음 느껴졌던 날 기억하세요?",
    ],
    parenting: [
        "우리 애기 승현이가 드디어 태어났어요 축하해주세용",
        "이유식 거부하는 아기 어떻게 먹이셨어요?",
        "밤잠 통잠 성공했어요! 비결 공유해요",
        "돌 전 아기 낮잠 횟수 이 정도면 괜찮을까요?",
    ],
    neighborhood: [
        "동네 산부인과 야간 진료 가능한 곳 아시는 분?",
        "우리 동네 산모교실 같이 가실 분 계신가요",
        "집 근처 소아과 대기 적은 곳 추천해 주세요",
    ],
    health: [
        "임신성 당뇨 검사 전에 준비할 것들 알려주세요",
        "산후 회복 병원 선택 기준이 궁금해요",
        "예방접종 일정 놓치지 않는 방법 있을까요?",
    ],
    living: [
        "수면교육 입문서 추천해 주세요",
        "신생아 겉싸개 오가닉 vs 일반 후기",
        "모유저장팩 써보신 분들 후기 부탁드려요",
    ],
};

// 목 데이터 전용: "건강·병원"(health) 카테고리는 글을 두지 않습니다. 카테고리 빈 상태를 화면에서 확인하기 위한 것입니다.
const categoryOrder: FeedPost["category"][] = ["pregnancy", "parenting", "neighborhood", "living"];
const authorNames = ["초코라떼맘", "승현맘", "포근한토리", "동그람이", "살구잼", "따뜻한햇살", "아기별맘", "구름빵"];

const THUMBNAILS = ["/image/community/community.png", "/image/community/communityview.png", "/image/community/communitypost.png"];

const createdAtBase = Date.now();

const posts: FeedPost[] = Array.from({ length: 48 }, (_, index) => {
    const category = categoryOrder[index % categoryOrder.length];
    const titles = titlesByCategory[category];

    return {
        id: 1024 - index,
        category,
        authorTag: category === "parenting" || index % 3 === 1 ? "육아맘" : "예비맘",
        title: titles[Math.floor(index / categoryOrder.length) % titles.length],
        authorName: authorNames[index % authorNames.length],
        thumbnailUrl: index % 4 === 3 ? null : THUMBNAILS[index % THUMBNAILS.length],
        likeCount: 42 + ((index * 53) % 1100),
        commentCount: 13 + ((index * 7) % 40),
        viewCount: 900 - ((index * 37) % 700),
        createdAt: new Date(createdAtBase - (35 + index * 257) * MINUTE).toISOString(),
    };
});

// 목 데이터 전용: 검색어가 이 값이면 목록 요청이 실패합니다. 에러 상태를 화면에서 확인할 때 씁니다.
export const MOCK_ERROR_KEYWORD = "오류테스트";

export const findMockPostById = (id: number): FeedPost | null => posts.find((post) => post.id === id) ?? null;

// 백엔드가 준비되기 전까지 페이징·정렬·검색을 클라이언트에서 흉내 냅니다.
export const queryMockPosts = ({ category, sort, q, page, size }: FeedPostListParams, extraPosts: FeedPost[] = []): FeedPostListResponse => {
    if (q === MOCK_ERROR_KEYWORD) throw new Error("mock posts error");

    const keyword = q.trim().toLocaleLowerCase();
    const filtered = [...extraPosts, ...posts]
        .filter((post) => (category === "all" || post.category === category) && post.title.toLocaleLowerCase().includes(keyword))
        .sort((a, b) => (sort === "latest" ? Date.parse(b.createdAt) - Date.parse(a.createdAt) : b.likeCount * 10 + b.viewCount - (a.likeCount * 10 + a.viewCount)));

    const totalPages = Math.max(1, Math.ceil(filtered.length / size));
    const currentPage = Math.min(Math.max(1, page), totalPages);

    return {
        items: filtered.slice((currentPage - 1) * size, currentPage * size),
        page: currentPage,
        pageSize: size,
        totalCount: filtered.length,
        totalPages,
    };
};

export const mockPopularProducts: PopularProduct[] = [
    { id: 1, rank: 1, name: "수유쿠션 바디필로우 세트", discountRate: 32, price: 39000, thumbnailUrl: null },
    { id: 2, rank: 2, name: "신생아 겉싸개 오가닉 2종", discountRate: 25, price: 24900, thumbnailUrl: null },
    { id: 3, rank: 3, name: "임산부 전용 토퍼 매트", discountRate: 18, price: 89000, thumbnailUrl: null },
    { id: 4, rank: 4, name: "모유저장팩 100매입", discountRate: 40, price: 12900, thumbnailUrl: null },
    { id: 5, rank: 5, name: "비접촉식 아기 체온계", discountRate: 15, price: 32000, thumbnailUrl: null },
];
