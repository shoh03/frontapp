// 카카오 SDK 좌표 객체에서 현재 사용하는 기능만 선언합니다. SDK 자체를 구현하는 파일은 아닙니다.
export interface KakaoLatLng {
  // 좌표 객체에서 위도를 읽는 메서드입니다.
  getLat(): number;
  // 좌표 객체에서 경도를 읽는 메서드입니다.
  getLng(): number;
}

// 생성된 카카오 지도 객체에서 사용하는 메서드들의 타입입니다.
export interface KakaoMap {
  // 전달한 좌표로 지도 중심을 이동합니다. void는 반환값을 사용하지 않는다는 뜻입니다.
  setCenter(position: KakaoLatLng): void;
  // 지도의 현재 표시 영역을 읽습니다. 아래 두 메서드를 가진 영역 객체가 반환됩니다.
  getBounds(): {
    // 표시 영역의 남서쪽 모서리 좌표를 읽습니다.
    getSouthWest(): KakaoLatLng;
    // 표시 영역의 북동쪽 모서리 좌표를 읽습니다.
    getNorthEast(): KakaoLatLng;
  };
  // 확대·축소 같은 지도 컨트롤을 지정 위치에 붙입니다. 사용하는 부분만 최소한으로 선언했습니다.
  addControl(control: object, position: object): void;
}

// 직접 만든 마커 DOM을 지도에 올리는 커스텀 오버레이 객체의 타입입니다.
export interface KakaoOverlay {
  // 지도 객체를 넣으면 표시하고 null을 넣으면 지도에서 제거합니다.
  setMap(map: KakaoMap | null): void;
  // 기존 마커를 재생성하지 않고 변경된 좌표를 반영합니다.
  setPosition(position: KakaoLatLng): void;
  // 마커가 겹칠 때 앞뒤 순서를 지정합니다. 선택한 마커를 앞으로 올릴 때 사용합니다.
  setZIndex(index: number): void;
}

// 장소 키워드 검색 결과 한 건입니다. SDK 는 x 에 경도, y 에 위도를 문자열로 줍니다.
export interface KakaoPlaceResult {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
}

// libraries=services 로 불러온 경우에 생기는 장소 검색 API 입니다.
export interface KakaoServices {
  Places: new () => {
    keywordSearch(
      keyword: string,
      callback: (results: KakaoPlaceResult[], status: string) => void,
    ): void;
  };
  Status: { OK: string; ZERO_RESULT: string; ERROR: string };
}

// 스크립트 로딩 후 window.kakao.maps에 생기는 생성자와 함수들의 타입입니다.
export interface KakaoMaps {
  services: KakaoServices;
  // autoload=false로 불러온 SDK를 초기화하고 준비되면 callback을 실행합니다.
  load(callback: () => void): void;
  // new maps.LatLng(위도, 경도)로 좌표 객체를 생성할 수 있다는 선언입니다.
  LatLng: new (latitude: number, longitude: number) => KakaoLatLng;
  // 지도용 DOM 요소, 중심 좌표, 확대 레벨을 전달해 지도 객체를 생성합니다.
  Map: new (
    container: HTMLElement,
    options: { center: KakaoLatLng; level: number },
  ) => KakaoMap;
  // 아래 옵션으로 직접 만든 마커 오버레이를 생성할 수 있다는 선언입니다.
  CustomOverlay: new (options: {
    // 마커를 놓을 지도상의 좌표입니다.
    position: KakaoLatLng;
    // 마커로 표시할 DOM 요소입니다. 현재는 클릭 가능한 button을 전달합니다.
    content: HTMLElement;
    // 마커 가로 방향 기준점입니다. 0.5면 가로 중앙을 좌표에 맞춥니다.
    xAnchor: number;
    // 핀 마커의 세로 기준점입니다. 1이면 아래 꼭짓점을 좌표에 맞춥니다.
    yAnchor: number;
    // 오버레이 클릭을 지도 클릭과 구분해 처리할지 지정하는 옵션입니다.
    clickable: boolean;
    // 위 옵션으로 생성된 결과가 KakaoOverlay 타입임을 나타냅니다.
  }) => KakaoOverlay;
  // 카카오 기본 확대·축소 컨트롤을 만드는 생성자입니다.
  ZoomControl: new () => object;
  // 컨트롤을 지도 오른쪽에 놓을 때 사용하는 SDK 상수입니다.
  ControlPosition: { RIGHT: object };
  // 지도 이벤트를 등록하고 해제하는 API를 묶어 선언합니다.
  event: {
    // 지도에 idle 같은 이벤트가 발생했을 때 실행할 함수를 등록합니다.
    addListener(target: KakaoMap, name: string, callback: () => void): void;
    // 등록했던 동일한 함수를 전달해 이벤트를 해제합니다. 화면을 떠날 때 정리합니다.
    removeListener(target: KakaoMap, name: string, callback: () => void): void;
    // 마커에서 처리한 클릭 등이 지도 이벤트로 함께 처리되지 않도록 막습니다.
    preventMap(): void;
  };
}

// 이 파일 밖에서도 브라우저 전역 타입을 사용할 수 있도록 기존 전역 선언을 확장합니다.
declare global {
  // 브라우저의 window 객체에 추가되는 속성을 선언합니다.
  interface Window {
    // SDK가 로딩되면 생기는 window.kakao입니다. ?는 로딩 전에는 없을 수 있다는 뜻입니다.
    kakao?: { maps: KakaoMaps };
  }
}
