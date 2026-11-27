"use client";

import { useEffect } from "react";
import { getSafeRedirectPath, LOGIN_REDIRECT_COOKIE, LOGIN_REDIRECT_MAX_AGE } from "@/lib/loginRedirect";

// 로그인 화면의 ?redirect= 값을 보관합니다. 값이 없으면 이전에 보관한 경로를 지웁니다.
export default function LoginRedirectKeeper() {
    useEffect(() => {
        const path = getSafeRedirectPath(new URLSearchParams(window.location.search).get("redirect"));
        const value = path ? encodeURIComponent(path) : "";
        document.cookie = `${LOGIN_REDIRECT_COOKIE}=${value}; path=/; max-age=${path ? LOGIN_REDIRECT_MAX_AGE : 0}; samesite=lax`;
    }, []);

    return null;
}
