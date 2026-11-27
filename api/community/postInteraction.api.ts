import type { PostLikeState, ServerComment } from "@/types/community/community.type";
import type { ApiResponseDTO } from "@/types/common/common.type";

// 게시글 상세의 상호작용(조회수·좋아요·댓글·삭제) 요청입니다.
export const LOGIN_REQUIRED_MESSAGE = "로그인이 필요합니다.";
const REQUEST_FAILED_MESSAGE = "요청에 실패했습니다. 잠시 후 다시 시도해 주세요.";

const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/communities/posts/${path}`, {
        credentials: "include",
        cache: "no-store",
        ...init,
        // 네트워크 오류의 영문 메시지("Failed to fetch")가 화면에 나가지 않게 합니다.
    }).catch(() => null);
    if (response?.status === 401) throw new Error(LOGIN_REQUIRED_MESSAGE);
    if (!response?.ok) throw new Error(REQUEST_FAILED_MESSAGE);
    const body: ApiResponseDTO<T> | null = await response.json().catch(() => null);
    if (!body) throw new Error(REQUEST_FAILED_MESSAGE);
    return body.data as T;
};

// 본인이 쓴 글만 삭제됩니다.
export const deleteCommunityPost = (postId: string) => request<null>(postId, { method: "DELETE" });

// 같은 회원·브라우저는 서버가 24시간에 1번만 셉니다. 현재 조회수를 돌려줍니다.
export const addPostView = (postId: string) => request<{ viewCount: number }>(`${postId}/view`, { method: "POST" });

export const getPostLike = (postId: string) => request<PostLikeState>(`${postId}/like`);

export const setPostLike = (postId: string, liked: boolean) =>
    request<PostLikeState>(`${postId}/like`, { method: liked ? "PUT" : "DELETE" });

export const getPostComments = (postId: string) => request<ServerComment[]>(`${postId}/comments`);

export const createPostComment = (postId: string, content: string) =>
    request<ServerComment>(`${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
    });

export const deletePostComment = (postId: string, commentId: number) =>
    request<null>(`${postId}/comments/${commentId}`, { method: "DELETE" });
