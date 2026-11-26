import { Suspense, type ReactNode } from "react";
import UserHeader from "./UserHeader";
import UserFooter from "./UserFooter";

// 공개 페이지와 회원 전용 페이지가 같은 헤더·본문 너비를 공유합니다.
export default function UserPageLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col">
            <Suspense fallback={null}><UserHeader /></Suspense>
            <main className="mx-auto w-330 min-w-330 flex-1">{children}</main>
            <UserFooter />
        </div>
    );
}
