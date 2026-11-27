export const instant = false

import { Suspense } from "react";
import JoinContainer from "./_components/JoinContainer";

export default function page() {
    return (
        // JoinContainer 가 주소의 쿼리(useSearchParams)를 읽으므로 Suspense 가 필요합니다.
        <Suspense fallback={null}>
            <JoinContainer />
        </Suspense>
    );
}