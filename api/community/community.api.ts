import type {
    CommunityCategory,
    CommunityPostDetail,
    CommunityPostEditData,
    CommunityPostPayload,
    ServerPostDetail,
    ServerPostEdit,
} from "@/types/community/community.type";

const feedCategoryLabels: Record<ServerPostDetail["category"], CommunityCategory> = {
    pregnancy: "임신 이야기",
    parenting: "육아 이야기",
    neighborhood: "우리 동네",
    health: "건강·병원",
    living: "살림·추천",
};

const feedCategoryIds: Record<CommunityCategory, ServerPostDetail["category"]> = {
    "임신 이야기": "pregnancy",
    "육아 이야기": "parenting",
    "우리 동네": "neighborhood",
    "건강·병원": "health",
    "살림·추천": "living",
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface ServerApiResponse<T> {
    success: boolean;
    message: string;
    data: T | null;
}

// 서버 게시글 상세 응답을 화면 형식으로 바꿉니다.
export const fromServerPost = (post: ServerPostDetail): CommunityPostDetail => {
    const category = feedCategoryLabels[post.category];

    return {
        id: String(post.id),
        isMine: post.isMine,
        badge: post.authorTag === "육아맘" ? "아이맘" : "예비맘",
        category,
        prefix: post.prefix,
        title: post.title,
        body: post.content,
        tags: [`#${category}`, `#${post.prefix}`],
        author: { name: post.authorName, avatar: post.authorName.slice(0, 1) },
        publishedAt: post.createdAt,
        postedAgo: "",
        likes: post.likeCount,
        comments: post.commentCount,
        views: post.viewCount,
        isFollowing: false,
        contents: post.content.split("\n"),
        attachments: {
            photos: post.photos,
            videos: post.videos,
            place: post.place,
            poll: post.poll
                ? {
                    question: post.poll.question,
                    options: post.poll.options.map((option) => option.text),
                    votes: post.poll.options.map((option) => option.votes),
                    allowMultiple: post.poll.allowMultiple,
                    voterCount: post.poll.voterCount,
                    myVotes: post.poll.myVotes,
                }
                : null,
        },
    };
};

// 서버에서 게시글 상세를 읽습니다. 없거나 서버에 닿지 못하면 null 입니다. 투표·작성자 여부는 쿠키가 필요해 브라우저에서 다시 읽습니다.
export const fetchServerPost = async (postId: string, withCredentials = false): Promise<CommunityPostDetail | null> => {
    if (!/^\d+$/.test(postId)) return null;
    try {
        const response = await fetch(`${BACKEND_URL}/communities/posts/${postId}`, {
            cache: "no-store",
            ...(withCredentials ? { credentials: "include" as const } : {}),
        });
        if (!response.ok) return null;
        const body: ServerApiResponse<ServerPostDetail> = await response.json();
        return body.data ? fromServerPost(body.data) : null;
    } catch {
        return null;
    }
};

// 상세 화면(서버 컴포넌트)에서 게시글을 읽습니다.
export const getCommunityPost = async (postId: string): Promise<CommunityPostDetail | null> => fetchServerPost(postId);

// 투표합니다(회원당 1회, 단일 선택이면 항목 1개). 갱신된 게시글을 돌려줍니다.
export const voteCommunityPost = async (postId: string, optionIndexes: number[]): Promise<CommunityPostDetail> => {
    const response = await fetch(`${BACKEND_URL}/communities/posts/${postId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ optionIndexes }),
    }).catch(() => null);
    if (response?.status === 401) throw new Error("로그인이 필요합니다.");
    if (response?.status === 409) throw new Error("이미 투표했습니다.");
    if (!response?.ok) throw new Error("투표에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    const body: ServerApiResponse<ServerPostDetail> | null = await response.json().catch(() => null);
    if (!body?.data) throw new Error("투표에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    return fromServerPost(body.data);
};

interface UploadedImage {
    originalKey: string;
    originalUrl: string;
    thumbUrl: string | null;
}

interface UploadedFile {
    fileKey: string;
    fileUrl: string;
}

const uploadToS3 = async <T>(path: "image" | "general-file", file: File): Promise<T> => {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", "post");
    const response = await fetch(`${BACKEND_URL}/s3/${path}`, { method: "POST", body: form, credentials: "include" });
    if (!response.ok) throw new Error("파일 업로드에 실패했습니다.");
    const body: ServerApiResponse<T> = await response.json();
    if (!body.data) throw new Error("파일 업로드에 실패했습니다.");
    return body.data;
};

// 사진·동영상을 S3에 올리고, 그 key/url 을 담은 요청 본문을 만듭니다.
const buildPostBody = async (payload: CommunityPostPayload) => {
    const [photos, videos] = await Promise.all([
        Promise.all(payload.photos.map((file) => uploadToS3<UploadedImage>("image", file))),
        Promise.all(payload.videos.map(async ({ file, duration }) => {
            const uploaded = await uploadToS3<UploadedFile>("general-file", file);
            return { key: uploaded.fileKey, url: uploaded.fileUrl, duration };
        })),
    ]);

    return {
        category: feedCategoryIds[payload.category],
        prefix: payload.prefix,
        title: payload.title,
        content: payload.content,
        isPublic: payload.isPublic,
        photos: photos.map((photo) => ({ key: photo.originalKey, url: photo.originalUrl, thumbUrl: photo.thumbUrl })),
        videos,
        place: payload.place,
        poll: payload.poll,
    };
};

// 게시글을 등록합니다. 서버가 로그인(쿠키)을 확인하므로 비로그인이면 401 로 실패합니다.
export const createCommunityPost = async (payload: CommunityPostPayload): Promise<void> => {
    const response = await fetch(`${BACKEND_URL}/communities/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(await buildPostBody(payload)),
    });
    if (response.status === 401) throw new Error("로그인이 필요합니다.");
    if (!response.ok) throw new Error("게시글 등록에 실패했습니다.");
};

// 수정 화면에 채울 내 게시글을 읽습니다.
export const getPostForEdit = async (postId: string): Promise<CommunityPostEditData> => {
    const failed = "게시글을 불러오지 못했어요.";
    const response = await fetch(`${BACKEND_URL}/communities/posts/${encodeURIComponent(postId)}/edit`, {
        cache: "no-store",
        credentials: "include",
    }).catch(() => null);
    if (response?.status === 401) throw new Error("로그인이 필요합니다.");
    if (response?.status === 403) throw new Error("본인이 쓴 글만 수정할 수 있어요.");
    if (response?.status === 404) throw new Error("게시글을 찾을 수 없어요.");
    if (!response?.ok) throw new Error(failed);
    const body: ServerApiResponse<ServerPostEdit> = await response.json();
    if (!body.data) throw new Error(failed);
    return { ...body.data, id: String(body.data.id), category: feedCategoryLabels[body.data.category] };
};

// 게시글을 수정합니다. payload 의 파일은 새로 추가한 것이고, 남길 기존 첨부는 id 로 보냅니다.
export const updateCommunityPost = async (
    postId: string,
    payload: CommunityPostPayload,
    keep: { photoIds: number[]; videoIds: number[] },
): Promise<void> => {
    const response = await fetch(`${BACKEND_URL}/communities/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...(await buildPostBody(payload)), keepPhotoIds: keep.photoIds, keepVideoIds: keep.videoIds }),
    });
    if (response.status === 401) throw new Error("로그인이 필요합니다.");
    if (response.status === 409) throw new Error("참여한 사람이 생겨 투표를 바꿀 수 없어요. 화면을 새로고침해 주세요.");
    if (!response.ok) throw new Error("게시글 수정에 실패했습니다.");
};
