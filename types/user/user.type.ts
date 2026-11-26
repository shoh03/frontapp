import type { UserProvider } from "@/enums/user.enum";

// 백엔드 UserResponseDTO입니다. datetime은 JSON에서 문자열로 전달됩니다.
export interface UserResponseDTO {
  id: number;
  user_name: string;
  user_provider: UserProvider;
  user_provider_id: string;
  user_email: string;
  user_nickname: string;
  user_phone: string;
  user_status: boolean;
  user_created_at: string;
}



// 기존 user 이름을 쓰는 코드가 백엔드 UserResponseDTO를 그대로 사용하도록 연결합니다.
export type UserDTO = UserResponseDTO;
// 추가 정보 입력 폼의 필드와 키를 맞춘 요청 DTO입니다.
export interface JoinAdditionalRequestDTO {
  userEmail: string;
  userPhone: string;
  userName: string;
  userNickname: string;
  userType: string;
  userProvider: string;
  userProviderId: string;
  // 필수 약관 동의 체크박스
  agreeTerms: boolean;
  agreeHealthData: boolean;
}

// 기존 프로필 업로드 함수의 프론트 입력값입니다. File은 FormData로 보냅니다.
// 대응하는 회원 프로필 변경 API는 백엔드 구현 후 연결해야 합니다.
export interface ProfileUpdateRequestDTO {
  id: number;
  file: File;
}
