"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { getKakaoMapKey, getKakaoMapSrc, KAKAO_MAP_SCRIPT_ID } from "@/lib/kakaoMap";
import useKakaoSdk from "../_hooks/useKakaoSdk";

interface PostPlaceMapProps {
    name: string;
    latitude: number;
    longitude: number;
}

const MAP_LEVEL = 3;

// 핀의 아래 꼭짓점이 좌표를 가리키는 마커입니다.
const createMarker = (name: string) => {
    const namespace = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(namespace, "svg");
    svg.setAttribute("viewBox", "0 0 32 40");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", `${name} 위치`);
    svg.setAttribute("class", "block h-10 w-8 drop-shadow-sm");
    const shape = document.createElementNS(namespace, "path");
    shape.setAttribute("d", "M16 1C7.716 1 1 7.716 1 16c0 10 15 23 15 23s15-13 15-23C31 7.716 24.284 1 16 1Z");
    shape.setAttribute("class", "fill-primary stroke-white stroke-2");
    const dot = document.createElementNS(namespace, "circle");
    dot.setAttribute("cx", "16");
    dot.setAttribute("cy", "15");
    dot.setAttribute("r", "5");
    dot.setAttribute("class", "fill-white");
    svg.append(shape, dot);

    const wrapper = document.createElement("div");
    wrapper.append(svg);
    return wrapper;
};

// 선택한 장소를 지도 정중앙에 마커와 함께 보여 줍니다. 글쓰기 미리보기와 상세 화면이 같이 씁니다.
export default function PostPlaceMap({ name, latitude, longitude }: PostPlaceMapProps) {
    const key = getKakaoMapKey();
    const container = useRef<HTMLDivElement>(null);
    const { status, handleReady, handleError } = useKakaoSdk(!!key);

    useEffect(() => {
        const element = container.current;
        if (status !== "ready" || !element || !window.kakao) return;
        const { maps } = window.kakao;
        const position = new maps.LatLng(latitude, longitude);
        const map = new maps.Map(element, { center: position, level: MAP_LEVEL });
        const marker = new maps.CustomOverlay({ position, content: createMarker(name), xAnchor: 0.5, yAnchor: 1, clickable: false });
        marker.setMap(map);

        return () => {
            marker.setMap(null);
            element.replaceChildren();
        };
    }, [status, name, latitude, longitude]);

    return (
        <div role="region" aria-label={`${name} 지도`} className="relative h-64 overflow-hidden rounded-feed-lg bg-placeholder">
            {key && <Script id={KAKAO_MAP_SCRIPT_ID} src={getKakaoMapSrc(key)} strategy="afterInteractive" onReady={handleReady} onError={handleError} />}
            <div ref={container} className="h-full w-full" />
            {(!key || status !== "ready") && (
                <p className="absolute inset-0 flex items-center justify-center text-sm text-mute">
                    {!key || status === "failed" ? "지도를 불러오지 못했습니다." : "지도를 불러오고 있습니다."}
                </p>
            )}
        </div>
    );
}
