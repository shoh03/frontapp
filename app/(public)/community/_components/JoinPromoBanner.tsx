import Link from "next/link";
import { FOCUS_RING, LOGIN_PATH } from "../_constants/feed";

// 카드 전체가 로그인 이동 영역입니다. 로그인 상태에서는 상위(CommunityLayout)가 렌더하지 않습니다.
export default function JoinPromoBanner() {
    return (
        <Link href={`${LOGIN_PATH}?redirect=/community`} className={`block rounded-feed-lg bg-promo-bg px-4 pt-[21px] pb-[22px] ${FOCUS_RING}`}>
            <span aria-hidden="true" className="block text-xs">🔔</span>
            <span className="mt-2 block text-sm font-bold text-promo-title">함께라서 더 든든해요</span>
            <span className="mt-2 block text-sm leading-5 text-promo-body">
                궁금한 이야기가 생길 때마다<br />매일 새로운 소식을 받아보세요.
            </span>
            <span className="mt-3 block text-xs font-bold text-promo-link">가입하고 둘러보기 →</span>
        </Link>
    );
}
