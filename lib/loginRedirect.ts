// 소셜 로그인은 백엔드를 거쳐 항상 "/"로 돌아오므로, 원래 가려던 경로를 쿠키에 잠시 보관합니다.
export const LOGIN_REDIRECT_COOKIE = "login_redirect";
export const LOGIN_REDIRECT_MAX_AGE = 60 * 10;

// 같은 사이트 안의 경로만 허용합니다. "//evil.com", "/\evil.com" 같은 외부 주소는 null 입니다.
export const getSafeRedirectPath = (value: string | null | undefined): string | null => {
    if (!value?.startsWith("/")) return null;
    const base = "http://localhost";
    const url = new URL(value, base);
    return url.origin === base ? url.pathname + url.search + url.hash : null;
};
