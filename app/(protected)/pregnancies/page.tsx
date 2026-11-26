import { redirect } from "next/navigation";

export default function PregnanciesPage() {
    // 임신·보호자 연결 조회를 구현하기 전에는 마이페이지를 진입점으로 사용합니다.
    redirect("/my");
}
