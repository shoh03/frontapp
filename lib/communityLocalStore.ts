import type { CommunityAttachments } from "@/types/community/community.type";
import type { FeedPost } from "@/types/community/communityFeed.type";

// 백엔드 커뮤니티 API가 준비되기 전까지, 새로 쓴 글과 좋아요 상태를 이 브라우저의 localStorage 에 보관합니다.
// API가 생기면 이 파일을 쓰는 곳(community.api.ts, communityFeed.api.ts)을 서버 요청으로 바꾸고 이 파일은 지웁니다.
export interface LocalPost extends FeedPost {
    content: string;
    prefix?: string;
    attachments?: CommunityAttachments;
}

const POSTS_KEY = "community-local-posts";
const LIKED_KEY = "community-liked-ids";
const CHANGE_EVENT = "community-local-change";

const EMPTY_POSTS: LocalPost[] = [];
const EMPTY_IDS: string[] = [];

// Date.now() 로 만든 13자리 숫자 id 는 목 데이터의 id 와 겹치지 않습니다.
export const isLocalPostId = (postId: string): boolean => /^\d{13}$/.test(postId);

const parseArray = <T>(raw: string | null, fallback: T[]): T[] => {
    if (!raw) return fallback;
    try {
        const parsed: unknown = JSON.parse(raw);
        return Array.isArray(parsed) ? (parsed as T[]) : fallback;
    } catch {
        return fallback;
    }
};

// useSyncExternalStore 가 매번 같은 참조를 받도록, 저장된 문자열이 바뀔 때만 다시 파싱합니다.
let postsRaw: string | null | undefined;
let postsCache = EMPTY_POSTS;
let likedRaw: string | null | undefined;
let likedCache = EMPTY_IDS;

export const getLocalPosts = (): LocalPost[] => {
    if (typeof window === "undefined") return EMPTY_POSTS;
    const raw = window.localStorage.getItem(POSTS_KEY);
    if (raw !== postsRaw) {
        postsRaw = raw;
        postsCache = parseArray(raw, EMPTY_POSTS);
    }
    return postsCache;
};

export const getLikedIds = (): string[] => {
    if (typeof window === "undefined") return EMPTY_IDS;
    const raw = window.localStorage.getItem(LIKED_KEY);
    if (raw !== likedRaw) {
        likedRaw = raw;
        likedCache = parseArray(raw, EMPTY_IDS);
    }
    return likedCache;
};

export const isPostLiked = (postId: string): boolean => getLikedIds().includes(postId);

const write = (key: string, value: unknown) => {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(CHANGE_EVENT));
};

export const addLocalPost = (post: LocalPost) => write(POSTS_KEY, [post, ...getLocalPosts()]);

export const togglePostLiked = (postId: string) => {
    const ids = getLikedIds();
    write(LIKED_KEY, ids.includes(postId) ? ids.filter((id) => id !== postId) : [...ids, postId]);
};

export const subscribeLocalStore = (onChange: () => void) => {
    window.addEventListener(CHANGE_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
        window.removeEventListener(CHANGE_EVENT, onChange);
        window.removeEventListener("storage", onChange);
    };
};
