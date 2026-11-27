"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import Script from "next/script";
import { getKakaoMapKey, getKakaoMapSrc, KAKAO_MAP_SCRIPT_ID } from "@/lib/kakaoMap";
import type { CommunityPlace, CommunityPostPlace } from "@/types/community/community.type";
import type { KakaoPlaceResult } from "@/types/facilities/kakao-map.type";
import useKakaoSdk from "../_hooks/useKakaoSdk";
import PostPlaceMap from "./PostPlaceMap";

interface PlaceSearchProps {
    value: CommunityPostPlace | null;
    onChange: (place: CommunityPlace | null) => void;
    // 장소 첨부 전체를 삭제합니다.
    onRemove: () => void;
}

const toPlace = (result: KakaoPlaceResult): CommunityPlace => ({
    name: result.place_name,
    address: result.road_address_name || result.address_name,
    latitude: Number(result.y),
    longitude: Number(result.x),
});

// 카카오 장소 키워드 검색으로 장소 하나를 고릅니다. 고르면 아래에 지도를 보여 줍니다.
export default function PlaceSearch({ value, onChange, onRemove }: PlaceSearchProps) {
    const key = getKakaoMapKey();
    const { status, handleReady, handleError } = useKakaoSdk(!!key);
    const [keyword, setKeyword] = useState("");
    const [results, setResults] = useState<KakaoPlaceResult[]>([]);
    const [message, setMessage] = useState("");
    // 늦게 도착한 이전 검색 결과는 버립니다.
    const requestRef = useRef(0);

    const search = () => {
        const query = keyword.trim();
        if (!query || status !== "ready" || !window.kakao) return;
        const { services } = window.kakao.maps;
        const request = ++requestRef.current;
        setMessage("검색 중이에요.");
        setResults([]);
        new services.Places().keywordSearch(query, (found, searchStatus) => {
            if (request !== requestRef.current) return;
            if (searchStatus === services.Status.OK) {
                setResults(found);
                setMessage("");
            } else {
                setMessage(searchStatus === services.Status.ZERO_RESULT ? "검색 결과가 없어요." : "장소를 검색하지 못했어요. 다시 시도해 주세요.");
            }
        });
    };

    // 게시글 폼 안에 있으므로, Enter 는 글 등록 대신 장소 검색으로 처리합니다.
    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        if (!event.nativeEvent.isComposing) search();
    };

    const select = (result: KakaoPlaceResult) => {
        requestRef.current += 1;
        onChange(toPlace(result));
        setResults([]);
        setMessage("");
    };

    const unavailable = !key || status === "failed";

    return (
        <div>
            {key && <Script id={KAKAO_MAP_SCRIPT_ID} src={getKakaoMapSrc(key)} strategy="afterInteractive" onReady={handleReady} onError={handleError} />}
            <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-bold">📍 장소</p>
                <button type="button" aria-label="장소 삭제" onClick={onRemove} className="shrink-0 text-sm font-bold text-primary hover:underline">삭제</button>
            </div>
            <div className="mt-3 flex gap-2">
                <input
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="장소 이름이나 주소로 검색 (예: 강남 산부인과)"
                    aria-label="장소 검색어"
                    className="h-12 w-full rounded-xl border border-[#E1E9E4] px-4 text-base outline-none placeholder:text-[#98A89F] focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                />
                <button
                    type="button"
                    onClick={search}
                    disabled={status !== "ready" || !keyword.trim()}
                    className="shrink-0 rounded-xl bg-primary px-6 text-sm font-bold text-white hover:opacity-90 disabled:opacity-40"
                >
                    검색
                </button>
            </div>
            <p role="status" className="mt-2 text-sm text-[#8A9A90] empty:hidden">
                {unavailable ? "지도를 불러오지 못해 장소를 검색할 수 없어요." : message}
            </p>

            {results.length > 0 && (
                <ul aria-label="장소 검색 결과" className="mt-2 max-h-64 divide-y divide-[#E1E9E4] overflow-y-auto rounded-xl border border-[#E1E9E4]">
                    {results.map((result) => (
                        <li key={result.id}>
                            <button type="button" onClick={() => select(result)} className="w-full px-4 py-3 text-left hover:bg-[#F4F7F5]">
                                <span className="block text-sm font-bold">{result.place_name}</span>
                                <span className="mt-0.5 block text-xs text-[#8A9A90]">{result.road_address_name || result.address_name}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {value && (
                <div className="mt-4 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-bold">{value.name}</p>
                            {value.address && <p className="mt-0.5 text-xs text-[#8A9A90]">{value.address}</p>}
                        </div>
                        <button type="button" onClick={() => onChange(null)} className="shrink-0 text-sm font-bold text-primary hover:underline">선택 해제</button>
                    </div>
                    {value.latitude != null && value.longitude != null && (
                        <PostPlaceMap name={value.name} latitude={value.latitude} longitude={value.longitude} />
                    )}
                </div>
            )}
        </div>
    );
}
