import Link from "next/link";
import { Plus } from "lucide-react";
import { FOCUS_RING, WRITE_POST_PATH } from "../_constants/feed";

// 로그인 여부는 화면 상태가 아니라 middleware 가 로그인 쿠키로 판단합니다.
// 비로그인이면 middleware 가 /login?redirect=/community/new 로 보내고, 로그인 후에는 작성 페이지로 돌아옵니다.
export default function WritePostButton({ href = WRITE_POST_PATH }: { href?: string }) {
    return (
        <Link
            href={href}
            className={`inline-flex h-[52px] w-[170px] items-center justify-center gap-2 rounded-full bg-primary text-base font-bold text-white transition-colors hover:bg-brand-hover ${FOCUS_RING}`}
        >
            <Plus aria-hidden="true" className="size-4" />
            이야기 나누기
        </Link>
    );
}
