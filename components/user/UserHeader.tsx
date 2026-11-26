"use client";

import Image from "next/image";
import Link from "next/link";
import UserAccountMenu from "./UserAccountMenu";
import { user_header_navigation } from "@/types/navigation/navigation.type";

export default function UserHeader() {
    return (
        <header className="sticky top-0 z-50 min-w-330 bg-white shadow-[0_4px_18px_rgb(0_0_0/0.08)] font-pretendard">
            <div className="mx-auto grid min-h-20 w-330 min-w-330 grid-cols-[260px_minmax(0,1fr)_180px] items-center gap-x-6">
                <Link
                    href="/"
                    className="inline-flex w-fit items-center gap-2 rounded-sm text-[26px] leading-8.5 font-semibold text-primary no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                    aria-label="NESTEP 홈">
                    <Image
                        src="/icons/nestep_main_icon.png"
                        alt=""
                        width={146}
                        height={141}
                        sizes="34px"
                        className="h-auto w-8.5 object-contain"
                    />
                    <span>NESTEP</span>
                </Link>
                <nav className="min-w-0" aria-label="주요 메뉴">
                    <ul className="m-0 flex w-max list-none items-center gap-10 p-0">
                        {user_header_navigation.map(({ id, label, href }) => (
                            <li key={id}>
                                <Link
                                    href={href}
                                    className="inline-flex min-h-11 items-center rounded-sm text-base leading-6 font-medium whitespace-nowrap text-nav no-underline hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                                    {label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
                <UserAccountMenu />
            </div>
        </header>
    );
}
