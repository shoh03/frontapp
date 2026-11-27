export type CommunityBadge = "예비맘" | "아이맘";

export type CommunityCategory = "임신 이야기" | "육아 이야기" | "우리 동네" | "건강·병원" | "살림·추천";

export interface CommunityAuthor {
    name: string;
    avatar: string;
}

// 화면에서 사용하는 게시글 형식입니다. 백엔드 DTO가 정해지면 응답을 이 형식에 맞춥니다.
export interface CommunityPost {
    id: string;
    badge: CommunityBadge;
    category: CommunityCategory;
    prefix?: string; // 말머리
    title: string;
    body: string;
    tags: string[];
    author: CommunityAuthor;
    publishedAt: string;
    postedAgo: string;
    likes: number;
    comments: number;
    views: number;
    isFollowing: boolean;
}

// 게시글 상세 화면에서 사용하는 형식입니다.
export interface CommunityPostDetail extends CommunityPost {
    contents: string[];
    attachments?: CommunityAttachments;
    // 로그인 쿠키를 보내 읽었을 때, 내가 쓴 글이면 true 입니다.
    isMine?: boolean;
}

export interface PostLikeState {
    liked: boolean;
    likeCount: number;
}

// 서버 댓글 응답(camelCase)입니다.
export interface ServerComment {
    id: number;
    authorName: string;
    content: string;
    isSecret: boolean;
    isMine: boolean;
    createdAt: string;
}

export interface CommunityVideo {
    url: string;
    duration: number;
}

// 카카오 장소 검색으로 고른 장소입니다.
export interface CommunityPlace {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
}

// 서버가 돌려주는 장소입니다. 좌표 없이 저장된 예전 글은 좌표가 null 입니다.
export interface CommunityPostPlace {
    name: string;
    address: string;
    latitude?: number | null;
    longitude?: number | null;
}

export interface CommunityPoll {
    question: string;
    options: string[];
    votes: number[];
    allowMultiple: boolean;
    voterCount: number;
    myVotes: number[];
}

// 글에 붙이는 첨부(사진·동영상·장소·투표)입니다.
export interface CommunityAttachments {
    photos: string[];
    videos: CommunityVideo[];
    place: CommunityPostPlace | null;
    poll: CommunityPoll | null;
}

export type CommunityPrefix = "질문" | "후기" | "정보 공유" | "일상" | "모임" | "추천";

// 글쓰기 폼이 넘기는 값입니다. 사진·동영상은 파일 그대로 받아 등록 함수가 S3에 올립니다.
export interface CommunityPostPayload {
    isPublic: boolean;
    category: CommunityCategory;
    prefix: CommunityPrefix;
    title: string;
    content: string;
    photos: File[];
    videos: { file: File; duration: number }[];
    place: CommunityPostPlace | null;
    poll: { question: string; options: string[]; allowMultiple: boolean } | null;
}

// 수정 화면에 채울 기존 게시글입니다. locked 투표는 참여한 사람이 있어 바꿀 수 없습니다.
export interface CommunityPostEditData {
    id: string;
    category: CommunityCategory;
    prefix: string;
    title: string;
    content: string;
    photos: { id: number; url: string }[];
    videos: { id: number; url: string; duration: number }[];
    place: CommunityPostPlace | null;
    poll: { question: string; options: string[]; allowMultiple: boolean; locked: boolean } | null;
}

// 서버의 수정 정보 응답은 게시판만 영문 id 입니다.
export type ServerPostEdit = Omit<CommunityPostEditData, "id" | "category"> & {
    id: number;
    category: ServerPostDetail["category"];
};

// 서버 게시글 상세 응답(camelCase)입니다.
export interface ServerPostDetail {
    id: number;
    category: "pregnancy" | "parenting" | "neighborhood" | "health" | "living";
    authorTag: "예비맘" | "육아맘";
    prefix: string;
    title: string;
    content: string;
    authorName: string;
    likeCount: number;
    commentCount: number;
    viewCount: number;
    createdAt: string;
    photos: string[];
    videos: CommunityVideo[];
    place: CommunityPostPlace | null;
    poll: {
        question: string;
        options: { text: string; votes: number }[];
        allowMultiple: boolean;
        voterCount: number;
        myVotes: number[];
    } | null;
    isMine: boolean;
}
