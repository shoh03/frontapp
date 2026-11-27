import type { LoginRequestDTO } from "@/types/auth/auth.type";
import type { ApiResponseDTO } from "@/types/common/common.type";
import type { UserDTO } from "@/types/user/user.type";

// 소셜 로그인 화면은 /auth/google, /auth/kakao, /auth/naver로 이동합니다.
// 아래 일반 /auth/login은 기존 코드이며 현재 로그인 화면에서는 사용하지 않습니다.
// 로그인 함수
export const loginApi = async (
  loginRequestDTO: LoginRequestDTO,
): Promise<ApiResponseDTO> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // 쿠키를 주고 받을 때 옵션 허용
      body: JSON.stringify(loginRequestDTO),
    },
  );

  if (!response.ok)
    throw new Error(
      "로그인 요청에 실패했습니다. 백엔드 로그인 경로를 확인해 주세요.",
    );
  const datas: ApiResponseDTO = await response.json();
  return datas;
};

// HttpOnly 쿠키는 브라우저가 전송하고, 서버가 검증한 사용자 정보로 상태를 복원합니다.
export const getCurrentUserApi = async (signal?: AbortSignal): Promise<UserDTO | null> => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const options: RequestInit = { credentials: "include", cache: "no-store", signal };
  const fetchUser = () => fetch(`${backendUrl}/users/me`, options);
  let response = await fetchUser();

  if (response.status === 401) {
    // access_token이 없어도 refresh_token으로 한 번만 재발급을 시도합니다.
    const refreshResponse = await fetch(`${backendUrl}/auth/refresh`, options);
    if (refreshResponse.status === 401 || refreshResponse.status === 403) return null;
    if (!refreshResponse.ok) throw new Error("로그인 상태를 확인하지 못했습니다.");
    const refreshed: ApiResponseDTO = await refreshResponse.json();
    if (!refreshed.success) return null;
    response = await fetchUser();
  }

  if (response.status === 401 || response.status === 403) return null;
  if (!response.ok) throw new Error("로그인 상태를 확인하지 못했습니다.");
  const result: ApiResponseDTO<UserDTO> = await response.json();
  if (!result.success || !result.data) throw new Error("회원 정보를 확인하지 못했습니다.");
  return result.data;
};

// 로그아웃 함수
export const logoutApi = async (): Promise<ApiResponseDTO> => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const requestLogout = () => fetch(
    `${backendUrl}/auth/logout`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    },
  );
  let response = await requestLogout();

  if (response.status === 401) {
    // 로그아웃 API는 access_token이 필요하므로, 만료됐으면 한 번만 재발급받고 다시 요청합니다.
    const refreshResponse = await fetch(`${backendUrl}/auth/refresh`, { credentials: "include", cache: "no-store" });
    const expired: ApiResponseDTO = { success: true, message: "이미 만료된 로그인입니다.", data: null };
    if (refreshResponse.status === 401 || refreshResponse.status === 403) return expired;
    if (refreshResponse.ok) {
      // refresh_token까지 만료되면 백엔드가 쿠키를 지우고 success: false를 반환합니다.
      const refreshed: ApiResponseDTO = await refreshResponse.json();
      if (!refreshed.success) return expired;
      response = await requestLogout();
    }
  }

  if (!response.ok) {
    throw new Error(
      "로그아웃 요청에 실패했습니다. 백엔드 로그아웃 경로를 확인해 주세요.",
    );
  }
  const datas: ApiResponseDTO = await response.json();
  return datas;
};
