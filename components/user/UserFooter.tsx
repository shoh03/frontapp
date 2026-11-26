import Image from "next/image";
import Link from "next/link";

// 현재 제공하는 화면만 안내합니다. 미구현 회사·요금·고객지원 메뉴는 넣지 않습니다.
const footerNavigation = [
    {
        title: "산모/보호자",
        links: [
            { label: "임신 관리", href: "/pregnancies" },
            { label: "마이페이지", href: "/my" },
        ],
    },
    {
        title: "정보 안내",
        links: [
            { label: "임신·지원 정보", href: "/pregnancy-guide" },
            { label: "주변 의료기관", href: "/facilities" },
        ],
    },
    {
        title: "함께하기",
        links: [
            { label: "커뮤니티", href: "/community" },
            { label: "베이비샵", href: "/shop" },
        ],
    },
];

export default function UserFooter() {
    return (
        <footer className="min-w-330 bg-surface-alt font-pretendard">
            <div className="mx-auto flex w-330 min-w-330 justify-between gap-16 py-12">
                <div>
                    <Link href="/" aria-label="NESTEP 홈" className="inline-flex items-center gap-1.5 rounded-sm text-2xl font-semibold text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                        <Image src="/icons/nestep_main_icon.png" alt="" width={146} height={141} sizes="28px" className="h-auto w-7 object-contain" />
                        <span>NESTEP</span>
                    </Link>
                    <p className="mt-5 text-sm leading-6 text-slate-500">
                        산모와 아기의 건강한 여정을 함께하는<br />
                        임신·출산 케어 플랫폼 NESTEP입니다.
                    </p>
                    <p className="mt-6 text-xs leading-5 text-slate-500">© 2026 NESTEP. All rights reserved.</p>
                </div>
                <nav aria-label="하단 메뉴" className="flex gap-10">
                    {footerNavigation.map(({ title, links }) => (
                        <div key={title} className="min-w-28">
                            <h2 className="text-base font-semibold text-slate-800">{title}</h2>
                            <ul className="mt-4 space-y-3">
                                {links.map(({ label, href }) => (
                                    <li key={href}>
                                        <Link href={href} className="rounded-sm text-sm leading-6 text-slate-500 hover:text-brand-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">{label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </nav>
            </div>
        </footer>
    );
}
