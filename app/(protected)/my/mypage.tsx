"use client"

import Image from "next/image";
import { ChangeEvent, MouseEvent, useRef, useState } from "react";

// 임신 기록 카드 한 줄(라벨/값)
interface RecordRow {
    k: string;
    v: string;
}

// 임신 기록 카드
interface PregnancyCard {
    id: number;
    active: boolean;
    tag: string;
    name: string;
    rows: RecordRow[];
}

// 회원 정보 (수정 가능한 값)
interface MemberInfo {
    nickname: string;
    realName: string;
    phone: string;
}

const PREGNANCY_CARDS: PregnancyCard[] = [
    {
        id: 1, active: true, tag: "진행 중", name: "튼튼이",
        rows: [
            { k: "현재", v: "임신 28주 4일" },
            { k: "출산 예정일", v: "2027.03.14" },
            { k: "등록일", v: "2026.06.02" },
        ],
    },
    {
        id: 2, active: false, tag: "출산 완료", name: "콩콩이",
        rows: [
            { k: "출산일", v: "2024.08.21" },
            { k: "임신 기간", v: "2023.11.30 ~ 2024.08.21" },
            { k: "기록", v: "검진 12회 · 증상일지 48건" },
        ],
    },
    {
        id: 3, active: false, tag: "출산 완료", name: "새싹이",
        rows: [
            { k: "출산일", v: "2021.12.03" },
            { k: "임신 기간", v: "2021.03.08 ~ 2021.12.03" },
            { k: "기록", v: "검진 10회 · 증상일지 31건" },
        ],
    },
];

const FOOTER_COLS: { title: string; items: string[] }[] = [
    { title: "서비스", items: ["서비스 소개", "이용 안내", "요금 안내"] },
    { title: "산모/보호자", items: ["임신 기록", "병원 일정", "커뮤니티"] },
    { title: "의료진", items: ["의료진 소개", "진료 지원", "업로드 가이드"] },
    { title: "고객지원", items: ["자주 묻는 질문", "1:1 문의", "공지사항"] },
    { title: "회사", items: ["회사 소개", "이용약관", "개인정보처리방침"] },
];

const CARD_GAP = 16;
const cardShell = "border border-[#E7EAEE] rounded-[22px] shadow-[0_4px_14px_rgba(15,30,60,0.04)]";

// 임신 기록 카드
function RecordCard({ card, className = "" }: { card: PregnancyCard; className?: string }) {
    const handleOpen = (e: MouseEvent<HTMLAnchorElement>) => e.preventDefault();

    return (
        <a
            href="#"
            onClick={handleOpen}
            title={`${card.name} 기록 보기`}
            className={`min-h-57.5 rounded-2xl px-5.5 py-6 flex flex-col text-[#0E1B33] cursor-pointer transition hover:brightness-97 ${
                card.active ? "border-2 border-[#10C49A] bg-[#F1FBF8]" : "border border-[#EEF0F3] bg-[#F7F8FA]"
            } ${className}`}
        >
            <div className="flex items-center gap-2.5">
                <span className={`text-[11px] font-bold rounded-full px-2.25 py-1 ${
                    card.active ? "bg-[#10C49A] text-white" : "bg-[#E7EAEE] text-[#4A5466]"
                }`}>
                    {card.tag}
                </span>
                <span className="text-[20px] font-extrabold">{card.name}</span>
            </div>
            <div className={`mt-5 flex flex-col gap-3.5 justify-between ${card.active ? "" : "flex-1"}`}>
                {card.rows.map((r) => (
                    <div key={r.k} className="flex justify-between text-[12px]">
                        <span className="text-[#8A93A3]">{r.k}</span>
                        <span className="font-semibold text-[13px]">{r.v}</span>
                    </div>
                ))}
            </div>
            {card.active && (
                <>
                    <div className="mt-auto h-2 rounded bg-[#DDEFEA]">
                        <div className="w-[71%] h-full rounded bg-[#10C49A]" />
                    </div>
                    <div className="mt-2.5 text-[11px] font-semibold text-[#0FA882]">40주 중 28주 진행 · 약 71%</div>
                </>
            )}
        </a>
    );
}

export default function MyPageContent() {
    const [member, setMember] = useState<MemberInfo>({ nickname: "튼튼이 엄마", realName: "김하늘", phone: "010-1234-5678" });
    const [draft, setDraft] = useState<MemberInfo>(member);
    const [editing, setEditing] = useState<boolean>(false);
    const [photo, setPhoto] = useState<string | null>(null);
    const [page, setPage] = useState<number>(0);

    const fileRef = useRef<HTMLInputElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    const activeCards = PREGNANCY_CARDS.filter((c) => c.active);
    const doneCards = PREGNANCY_CARDS.filter((c) => !c.active);

    // 회원 정보 수정
    const handleStartEdit = () => {
        setDraft(member);
        setEditing(true);
    };
    const handleCancelEdit = () => setEditing(false);
    const handleSaveEdit = () => {
        setMember((prev) => ({
            nickname: draft.nickname.trim() || prev.nickname,
            realName: draft.realName.trim() || prev.realName,
            phone: draft.phone.trim() || prev.phone,
        }));
        setEditing(false);
    };
    const handleDraft = (key: keyof MemberInfo) => (e: ChangeEvent<HTMLInputElement>) => {
        const value = key === "phone" ? e.target.value.replace(/[^0-9-]/g, "") : e.target.value;
        setDraft((prev) => ({ ...prev, [key]: value }));
    };

    // 프로필 사진
    const handlePickPhoto = () => fileRef.current?.click();
    const handlePhoto = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setPhoto(reader.result as string);
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    // 출산 완료 캐러셀
    const handleMove = (dir: 1 | -1) => {
        const t = trackRef.current;
        if (!t) return;
        const card = t.firstElementChild as HTMLElement | null;
        const step = card ? card.getBoundingClientRect().width + CARD_GAP : 270;
        const max = t.scrollWidth - t.clientWidth;
        const target = t.scrollLeft + dir * step;
        const left = dir > 0
            ? (t.scrollLeft >= max - 2 ? 0 : Math.min(target, max))
            : (t.scrollLeft <= 2 ? max : Math.max(target, 0));
        t.scrollTo({ left });
    };
    const handleTrackScroll = () => {
        const t = trackRef.current;
        if (!t) return;
        const max = t.scrollWidth - t.clientWidth;
        const p = max <= 0 ? 0 : (t.scrollLeft >= max - 4 ? 1 : 0);
        if (p !== page) setPage(p);
    };
    const handleDot = (n: number) => {
        const t = trackRef.current;
        t?.scrollTo({ left: n ? t.scrollWidth : 0 });
    };

    const infoRows: { key: keyof MemberInfo; label: string; weight: string }[] = [
        { key: "nickname", label: "닉네임", weight: "font-bold" },
        { key: "realName", label: "이름(실명)", weight: "font-bold" },
        { key: "phone", label: "휴대폰 번호", weight: "font-semibold" },
    ];

    const preventDefault = (e: MouseEvent<HTMLAnchorElement>) => e.preventDefault();
    const navBtn = "flex-none w-10 h-10 rounded-full border border-[#DDE1E6] bg-white text-[18px] cursor-pointer hover:bg-[#F5F6F8]";

    return (
        <>
        <div className="w-full max-w-307.5 mx-auto px-6 pt-22.5 pb-13.5 text-[#0E1B33]">
            {/* 브레드크럼 + 제목 */}
            <div className="text-[12px] text-[#8A93A3] flex gap-2">
                <span>홈</span><span>›</span><span className="text-[#10B98A]">마이페이지</span>
            </div>
            <h1 className="mt-3.5 mb-4.5 text-[38px] font-extrabold tracking-[-0.5px]">마이페이지</h1>
            <p className="text-[17px] text-[#4A5466]">회원 정보와 임신 기록을 한곳에서 확인하고 관리할 수 있어요.</p>
            <div className="h-px bg-[#E7EAEE] mt-8.5 mb-12" />

            {/* 프로필 / 내 정보 */}
            <div className="grid gap-5.5 grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))]">
                <div>
                    <h3 className="mb-4 text-[16px] font-bold">회원 프로필</h3>
                    <div className={`${cardShell} h-108.5 flex flex-col items-center justify-center text-center`}>
                        <div className="relative w-31.5 h-31.5">
                            <div className="w-31.5 h-31.5 rounded-full border-3 border-[#10C49A] overflow-hidden bg-[#E3F8F1] flex items-center justify-center">
                                {photo ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={photo} alt="프로필 사진" className="w-full h-full object-cover" />
                                ) : (
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="#10C49A" aria-hidden="true">
                                        <circle cx="12" cy="8" r="4" />
                                        <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z" />
                                    </svg>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={handlePickPhoto}
                                title="프로필 사진 변경"
                                className="absolute -right-1 bottom-0 w-10 h-10 p-0 rounded-full bg-[#0B2447] border-3 border-white flex items-center justify-center cursor-pointer hover:bg-[#13336A]"
                            >
                                <div className="w-3.5 h-2.75 border-2 border-white rounded-[3px]" />
                            </button>
                            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                        </div>
                        <div className="mt-3 text-[25px] font-extrabold">{member.nickname}</div>
                        <div className="mt-3 text-[13px] text-[#8A93A3]">{member.realName} · {member.phone}</div>
                        <div className="mt-3.5 text-[12px] font-semibold text-[#0FA882] bg-[#E6F8F2] rounded-full px-3.25 py-1.5">
                            임신 28주 4일 · 예정일 2027.03.14
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="mb-4 text-[16px] font-bold">내 정보</h3>
                    <div className={`${cardShell} h-108.5 px-7.25 pt-2.5 pb-6.25 flex flex-col`}>
                        {infoRows.map((r) => (
                            <div key={r.key} className="h-14.25 flex items-center justify-between border-b border-[#EEF0F3]">
                                <span className="text-[13px] text-[#6B7485]">{r.label}</span>
                                {editing ? (
                                    <input
                                        value={draft[r.key]}
                                        onChange={handleDraft(r.key)}
                                        className="w-[min(260px,60%)] h-9.5 border-[1.5px] border-[#10C49A] rounded-[10px] px-3 text-[15px] font-semibold text-right text-[#0E1B33] outline-none bg-[#F7FDFB]"
                                    />
                                ) : (
                                    <span className={`text-[15px] ${r.weight}`}>{member[r.key]}</span>
                                )}
                            </div>
                        ))}
                        <div className="h-14.25 flex items-center justify-between border-b border-[#EEF0F3]">
                            <span className="text-[13px] text-[#6B7485]">이메일</span>
                            <span className="text-[15px] font-medium">haneul.kim@kakao.com</span>
                        </div>
                        <div className="h-14.25 flex items-center justify-between">
                            <span className="text-[13px] text-[#6B7485]">가입 방법</span>
                            <span className="text-[12px] font-bold bg-[#FEE500] rounded-full px-3 py-1.25">● 카카오 계정으로 가입</span>
                        </div>
                        <div className="h-14.25 flex items-center justify-between border-t border-[#EEF0F3]">
                            <span className="text-[13px] text-[#6B7485]">가입일</span>
                            <span className="text-[15px] font-semibold">2026.06.02</span>
                        </div>
                        {editing ? (
                            <div className="mt-auto grid grid-cols-[1fr_2fr] gap-2.5">
                                <button type="button" onClick={handleCancelEdit}
                                    className="h-11.75 border border-[#DDE1E6] rounded-full bg-white text-[#4A5466] text-[15px] font-bold cursor-pointer hover:bg-[#F5F6F8]">
                                    취소
                                </button>
                                <button type="button" onClick={handleSaveEdit}
                                    className="h-11.75 rounded-full bg-[#10C49A] text-white text-[15px] font-bold cursor-pointer hover:bg-[#0FAE88]">
                                    저장
                                </button>
                            </div>
                        ) : (
                            <button type="button" onClick={handleStartEdit}
                                className="mt-auto h-11.75 rounded-full bg-[#0B2447] text-white text-[15px] font-bold cursor-pointer hover:bg-[#13336A]">
                                ✎ 회원 정보 수정
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* 나의 임신 기록 */}
            <h2 className="mt-17 mb-5.5 text-[21px] font-extrabold">나의 임신 기록</h2>
            <div className="grid gap-5.5 grid-cols-[repeat(auto-fit,minmax(min(100%,520px),1fr))]">
                <div className={`${cardShell} px-7.25 pt-6.5 pb-7.5`}>
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <div className="text-[20px] font-extrabold">현재 임신 진행 중</div>
                            <div className="mt-1.5 text-[13px] text-[#6B7485]">지금 함께하고 있는 40주 여정이에요.</div>
                        </div>
                        <span className="mt-1.5 rounded-full px-3.25 py-1.75 text-[12px] font-bold bg-[#E6F8F2] text-[#0FA882]">
                            진행 중 {activeCards.length}
                        </span>
                    </div>
                    <div className="grid gap-4 mt-5 grid-cols-[repeat(auto-fill,minmax(min(100%,220px),1fr))]">
                        <a
                            href="#"
                            onClick={preventDefault}
                            className="min-h-57.5 rounded-2xl border-[1.5px] border-dashed border-[#C9EFE3] bg-white flex flex-col items-center justify-center gap-3 text-[#0FA882] cursor-pointer transition hover:brightness-97"
                        >
                            <div className="w-11 h-11 rounded-full bg-[#E6F8F2] text-[24px] flex items-center justify-center">+</div>
                            <div className="text-[15px] font-bold">새 임신(아이) 등록</div>
                        </a>
                        {activeCards.map((c) => <RecordCard key={c.id} card={c} />)}
                    </div>
                </div>

                <div className={`${cardShell} px-7.25 pt-6.5 pb-7.5`}>
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <div className="text-[20px] font-extrabold">출산 완료</div>
                            <div className="mt-1.5 text-[13px] text-[#6B7485]">지난 임신의 기록을 다시 꺼내 볼 수 있어요.</div>
                        </div>
                        <span className="mt-1.5 rounded-full px-3.25 py-1.75 text-[12px] font-bold bg-[#F1F3F5] text-[#4A5466]">
                            출산 완료 {doneCards.length}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 mt-5">
                        <button type="button" onClick={() => handleMove(-1)} className={navBtn}>‹</button>
                        <div
                            ref={trackRef}
                            onScroll={handleTrackScroll}
                            className="flex-1 flex gap-4 min-w-0 overflow-x-auto scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        >
                            {doneCards.map((c) => (
                                <RecordCard key={c.id} card={c} className="flex-[0_0_calc((100%-16px)/2)] min-w-62.5 snap-start" />
                            ))}
                        </div>
                        <button type="button" onClick={() => handleMove(1)} className={navBtn}>›</button>
                    </div>
                    <div className="flex justify-center gap-1.25 mt-5">
                        {[0, 1].map((n) => (
                            <button
                                key={n}
                                type="button"
                                onClick={() => handleDot(n)}
                                className={`p-0 border-0 cursor-pointer h-1.5 rounded-[3px] transition-[width] duration-200 ${
                                    page === n ? "w-4.5 bg-[#10C49A]" : "w-1.5 bg-[#DDE1E6]"
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* 회원 탈퇴 */}
            <div className="flex justify-end items-center gap-3 mt-5.5">
                <span className="text-[12px] text-[#8A93A3]">더 이상 NESTEP을 이용하지 않으시나요?</span>
                <button type="button"
                    className="h-8.5 px-3.75 border border-[#DDE1E6] rounded-full bg-white text-[12px] font-semibold text-[#4A5466] cursor-pointer">
                    회원 탈퇴 ›
                </button>
            </div>

            {/* 고객센터 배너 */}
            <a
                href="#"
                onClick={preventDefault}
                className="mt-9 h-54 rounded-r-[40px] bg-linear-to-r from-white from-0% via-[#FFF7C2] via-35% to-[#FFE97A] relative overflow-hidden px-6 lg:px-15.75 flex items-center text-[#0E1B33] cursor-pointer"
            >
                <Image src="/image/my/baby.png" alt="" width={0} height={0} sizes="216px"
                    className="absolute right-0 top-0 h-54 w-auto" />
                <div className="relative">
                    <div className="text-[40px] font-extrabold tracking-[-0.5px]">도움이 필요하신가요?</div>
                    <div className="mt-4 text-[19px] text-[#2B3446]">궁금한 점이 생기면 NESTEP 고객센터가 함께할게요.</div>
                </div>
            </a>
        </div>

        {/* 푸터 */}
        <footer className="bg-[#F5F6F8]">
            <div className="max-w-327.5 mx-auto px-6 pt-11 pb-12.5 flex flex-wrap justify-between gap-10">
                <div>
                    <div className="flex items-center gap-1.5 font-extrabold text-[21px] text-[#10C49A]">
                        <div className="w-5.75 h-5.25 border-3 border-[#10C49A] rounded-full" />NESTEP
                    </div>
                    <div className="mt-9.5 text-[13px] leading-[1.8] text-[#6B7485]">
                        산모와 아기의 건강한 여정을 함께하는<br />임신·출산 케어 플랫폼 NESTEP입니다.
                    </div>
                    <div className="mt-5 text-[13px] text-[#4A5466]">© 2026 NESTEP. All rights reserved.</div>
                </div>
                <div className="flex flex-wrap gap-7.5 pr-11.5">
                    {FOOTER_COLS.map((col) => (
                        <div key={col.title} className="flex flex-col gap-3.5 min-w-21">
                            <div className="text-[17px] font-bold mb-2">{col.title}</div>
                            {col.items.map((it) => (
                                <a key={it} href="#" onClick={preventDefault} className="text-[14px] text-[#6B7485] hover:text-[#10B98A]">{it}</a>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </footer>
        </>
    );
}
