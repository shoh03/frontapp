import Link from "next/link";
import type { PopularProduct } from "@/types/community/communityFeed.type";
import { FOCUS_RING } from "../_constants/feed";
import ProductRankItem from "./ProductRankItem";

interface PopularProductCardProps {
    products: PopularProduct[];
}

// 09:00(KST) 전에는 어제 09:00 기준 목록이 보입니다.
const getBaseDayLabel = () => (new Date(Date.now() + 9 * 60 * 60 * 1000).getUTCHours() < 9 ? "어제" : "오늘");

export default function PopularProductCard({ products }: PopularProductCardProps) {
    // 서버 렌더링 중에는 현재 시각을 읽지 않도록, 브라우저에서 목록을 받은 뒤에만 계산합니다.
    const baseDay = products.length > 0 ? getBaseDayLabel() : "오늘";

    return (
        <section className="rounded-feed-lg border border-line bg-white px-5 pt-5 pb-2.5">
            <div className="flex items-center justify-between">
                <h2 className="text-base leading-6 font-bold text-ink">오늘의 인기상품</h2>
                <Link href="/shop" className={`text-xs font-bold text-brand-text ${FOCUS_RING}`}>더보기 →</Link>
            </div>
            <p className="mt-0.5 border-b border-line pb-2.5 text-[10px] leading-[14px] font-bold text-mute-light">베이비샵 · {baseDay} 09:00 기준</p>
            <ul className="mt-[9px] flex flex-col gap-2.5">
                {products.map((product) => (
                    <ProductRankItem
                        key={product.id}
                        rank={product.rank}
                        name={product.name}
                        discountRate={product.discountRate}
                        price={product.price}
                        thumbnailUrl={product.thumbnailUrl}
                    />
                ))}
            </ul>
        </section>
    );
}
