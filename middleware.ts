import { NextResponse, type NextRequest } from "next/server";
import { getSafeRedirectPath, LOGIN_REDIRECT_COOKIE } from "@/lib/loginRedirect";

export function middleware(request: NextRequest) {
    const hasRefreshToken = Boolean(request.cookies.get("refresh_token")?.value);
    const { pathname } = request.nextUrl;
    const requiresLogin = pathname === "/my" || pathname.startsWith("/my/")
        || pathname === "/pregnancies" || pathname.startsWith("/pregnancies/")
        || pathname === "/community/new" || /^\/community\/[^/]+\/edit$/.test(pathname);

    // 화면 이동만 제어합니다. 실제 토큰 유효성·데이터 접근 권한은 백엔드에서 검사해야 합니다.
    if (!hasRefreshToken && requiresLogin) {
        // 로그인 후 원래 가려던 페이지로 돌아올 수 있도록 경로를 함께 넘깁니다.
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname + request.nextUrl.search);
        return NextResponse.redirect(loginUrl);
    }
    if (hasRefreshToken && (pathname === "/login" || pathname === "/")) {
        // 주소의 ?redirect= 가 우선이고, 소셜 로그인 후 "/"로 돌아온 경우에는 보관한 쿠키를 씁니다.
        const queryPath = pathname === "/login" ? request.nextUrl.searchParams.get("redirect") : null;
        const target = getSafeRedirectPath(queryPath ?? request.cookies.get(LOGIN_REDIRECT_COOKIE)?.value);
        if (pathname === "/" && !target) return NextResponse.next();
        const response = NextResponse.redirect(new URL(target ?? "/", request.url));
        response.cookies.delete(LOGIN_REDIRECT_COOKIE);
        return response;
    }
    return NextResponse.next();
}

// (protected)는 URL에 포함되지 않으므로 실제 페이지 주소를 지정합니다.
export const config = {
    matcher: ["/", "/login", "/my/:path*", "/pregnancies/:path*", "/community/new", "/community/:postId/edit"],
};
