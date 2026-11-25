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

export interface CommunityComment {
    id: string;
    author: CommunityAuthor;
    content: string;
    postedAgo: string;
}

// 게시글 상세 화면에서 사용하는 형식입니다.
export interface CommunityPostDetail extends CommunityPost {
    contents: string[];
    commentList: CommunityComment[];
    attachments?: CommunityAttachments;
}

// 글에 붙이는 첨부(사진·동영상·장소·투표)입니다.
export interface CommunityAttachments {
    photos: string[];
    video: { url: string; duration: number } | null;
    place: { name: string; address: string } | null;
    // votes·myVote 는 서버에 저장된 투표일 때만 있습니다. 없으면 이 브라우저에서만 집계하는 예전 글입니다.
    poll: { question: string; options: string[]; votes?: number[]; myVote?: number | null } | null;
}

export type CommunityPrefix = "질문" | "후기" | "정보 공유" | "일상";

// 글쓰기 폼이 넘기는 값입니다. 사진·동영상은 파일 그대로 받아 등록 함수가 S3에 올립니다.
export interface CommunityPostPayload {
    isPublic: boolean;
    category: CommunityCategory;
    prefix: CommunityPrefix;
    title: string;
    content: string;
    photos: File[];
    video: { file: File; duration: number } | null;
    place: { name: string; address: string } | null;
    poll: { question: string; options: string[] } | null;
}

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
    video: { url: string; duration: number } | null;
    place: { name: string; address: string } | null;
    poll: { question: string; options: { text: string; votes: number }[]; myVote: number | null } | null;
}
