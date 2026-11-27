import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import CommunityEditForm from "@/app/(public)/community/_components/CommunityEditForm";

export const metadata: Metadata = {
    title: "이야기 수정하기 | NESTEP",
};

export default function Page({ params }: { params: Promise<{ postId: string }> }) {
    return (
        <Suspense fallback={<p className="py-20 text-center">게시글을 불러오는 중...</p>}>
            <EditContent params={params} />
        </Suspense>
    );
}

async function EditContent({ params }: { params: Promise<{ postId: string }> }) {
    const { postId } = await params;
    const formId = `community-edit-form-${postId}`;

    return (
        <div className="pb-16 font-pretendard text-[#253B3A]">
            <Link href={`/community/${postId}`} className="inline-flex items-center gap-2 pt-8 text-sm font-semibold text-[#7F8F86] hover:text-primary">
                <ArrowLeft aria-hidden="true" className="size-4" />
                게시글로 돌아가기
            </Link>

            <section className="mt-10 flex items-end justify-between gap-6">
                <div>
                    <p className="flex items-center gap-2 text-sm font-semibold tracking-wide text-[#8A9A90]">
                        <span aria-hidden="true" className="size-2 rounded-full bg-primary" />
                        NESTEP COMMUNITY
                    </p>
                    <h1 className="mt-5 text-5xl font-extrabold tracking-tight">
                        이야기 <span className="text-primary">수정하기</span>
                    </h1>
                </div>
                <button
                    type="submit"
                    form={formId}
                    className="inline-flex shrink-0 items-center gap-3 rounded-full bg-primary px-8 py-4 text-base font-bold text-white hover:opacity-90 disabled:opacity-40"
                >
                    수정 완료
                    <ArrowRight aria-hidden="true" className="size-5" />
                </button>
            </section>

            <div className="mt-12">
                <CommunityEditForm key={postId} formId={formId} postId={postId} />
            </div>
        </div>
    );
}
