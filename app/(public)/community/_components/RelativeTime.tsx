"use client";

import { useEffect, useState } from "react";
import { formatRelativeTime } from "@/lib/format";

interface RelativeTimeProps {
    iso: string;
    fallback?: string;
}

// 현재 시각에 의존하는 값이라 서버 렌더링 중에는 계산하지 않고, 브라우저에서 마운트된 뒤 상대 시간으로 바꿉니다.
export default function RelativeTime({ iso, fallback = "" }: RelativeTimeProps) {
    const [text, setText] = useState(fallback);

    useEffect(() => {
        setText(formatRelativeTime(iso));
    }, [iso]);

    return <time dateTime={iso} suppressHydrationWarning>{text}</time>;
}
