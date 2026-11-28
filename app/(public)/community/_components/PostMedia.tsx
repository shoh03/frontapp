import type { PostPhotoAlign, PostPhotoSize } from "@/lib/community/postContent";
import { FOCUS_RING } from "../_constants/feed";
import { PHOTO_ALIGN_CLASSES, PHOTO_WIDTH_CLASSES } from "../_constants/write";

interface PostPhotoProps {
    src: string;
    alt: string;
    size?: PostPhotoSize;
    align?: PostPhotoAlign;
}

// 글 상세의 사진 한 장입니다. 누르면 원본을 새 창에서 엽니다.
export function PostPhoto({ src, alt, size, align }: PostPhotoProps) {
    return (
        <a href={src} target="_blank" rel="noopener noreferrer" title="원본 크기로 보기" className={`${PHOTO_ALIGN_CLASSES[align ?? "center"]} block max-w-full ${size ? PHOTO_WIDTH_CLASSES[size] : "w-fit"} ${FOCUS_RING}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt} className={`rounded-feed-lg ${size ? "w-full" : "max-w-full"}`} />
        </a>
    );
}

// 글 상세의 동영상 한 개입니다.
export function PostVideo({ src }: { src: string }) {
    return <video src={src} controls className="w-full rounded-feed-lg bg-black" />;
}
