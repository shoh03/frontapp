import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import CommunityWriteForm from "@/app/(public)/community/_components/CommunityWriteForm";
import { FEED_CATEGORIES } from "@/app/(public)/community/_constants/feed";
import { BOARDS } from "@/app/(public)/community/_constants/write";

const writeFormId = "community-write-form";

export const metadata: Metadata = {
    title: "새 이야기 나누기 | NESTEP",
    description: "엄마, 아빠의 하루를 편안하게 들려주세요.",
};

type SearchParams = Promise<{ category?: string | string[] }>;

// 주소의 ?category= 값을 게시판 기본값으로 씁니다. 요청마다 다른 값이라 Suspense 안에서 읽습니다.
async function WriteForm({ searchParams }: { searchParams: SearchParams }) {
    const { category } = await searchParams;
    const label = FEED_CATEGORIES.find((item) => item.id === category)?.label;

    return <CommunityWriteForm formId={writeFormId} defaultCategory={BOARDS.find((board) => board === label)} />;
}

export default function Page({ searchParams }: { searchParams: SearchParams }) {
    return (
        <div className="pb-16 font-pretendard text-[#253B3A]">
            <Link href="/community" className="inline-flex items-center gap-2 pt-8 text-sm font-semibold text-[#7F8F86] hover:text-primary">
                <ArrowLeft aria-hidden="true" className="size-4" />
                커뮤니티 피드
            </Link>

            <section className="mt-10 flex items-end justify-between gap-6">
                <div>
                    <p className="flex items-center gap-2 text-sm font-semibold tracking-wide text-[#8A9A90]">
                        <span aria-hidden="true" className="size-2 rounded-full bg-primary" />
                        NESTEP COMMUNITY
                    </p>
                    <h1 className="mt-5 text-5xl font-extrabold tracking-tight">
                        새 이야기 <span className="text-primary">나누기</span>
                    </h1>
                    <p className="mt-5 text-lg text-[#8A9A90]">엄마, 아빠의 하루를 편안하게 들려주세요.</p>
                </div>
                <button
                    type="submit"
                    form={writeFormId}
                    className="inline-flex shrink-0 items-center gap-3 rounded-full bg-primary px-8 py-4 text-base font-bold text-white hover:opacity-90 disabled:opacity-40"
                >
                    게시글 등록
                    <ArrowRight aria-hidden="true" className="size-5" />
                </button>
            </section>

            <div className="mt-12">
                <Suspense fallback={<p className="py-20 text-center">글쓰기 화면을 불러오는 중...</p>}>
                    <WriteForm searchParams={searchParams} />
                </Suspense>
            </div>
        </div>
    );
}
