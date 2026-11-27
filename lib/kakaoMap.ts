// 카카오 지도 SDK 로드 설정입니다. 지도를 쓰는 화면은 모두 같은 id·src 로 next/script 에 넣어 SDK 를 한 번만 받습니다.
export const KAKAO_MAP_SCRIPT_ID = "kakao-map-sdk";

export const getKakaoMapKey = () => process.env.NEXT_PUBLIC_KAKAO_MAP_KEY?.trim();

// autoload=false 이므로 onReady 에서 window.kakao.maps.load() 를 호출한 뒤 사용합니다. services 는 장소 검색용입니다.
export const getKakaoMapSrc = (key: string) =>
    `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(key)}&autoload=false&libraries=services`;
