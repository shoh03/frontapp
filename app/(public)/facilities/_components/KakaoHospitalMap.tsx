"use client";

import Script from "next/script";
import { LocateFixed, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { KakaoMap, KakaoOverlay } from "@/types/facilities/kakao-map.type";
import type {
  MapBounds,
  MapFacility,
  MapPosition,
} from "@/types/facilities/facilities.type";

interface Props {
  center: MapPosition;
  facilities: MapFacility[];
  selectedKey: string | null;
  onSelect: (key: string | null) => void;
  onBoundsChange: (bounds: MapBounds) => void;
  onLocate: () => void;
  isLocating: boolean;
}

interface FacilityOverlay {
  key: string;
  button: HTMLButtonElement;
  overlay: KakaoOverlay;
}

export default function KakaoHospitalMap({
  center,
  facilities,
  selectedKey,
  onSelect,
  onBoundsChange,
  onLocate,
  isLocating,
}: Props) {
  const key = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY?.trim();
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<KakaoMap | null>(null);
  const initialCenter = useRef(center);
  const overlays = useRef<Map<string, FacilityOverlay>>(new Map());
  const [sdkReady, setSdkReady] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!key || initialized) return;
    const timeout = setTimeout(() => setFailed(true), 15000);
    return () => clearTimeout(timeout);
  }, [key, initialized]);

  useEffect(() => {
    if (!sdkReady || !container.current || !window.kakao) return;
    const { maps } = window.kakao;
    let active = true;
    let instance: KakaoMap | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const publishBounds = () => {
      if (!instance || !active) return;
      const bounds = instance.getBounds();
      const southWest = bounds.getSouthWest();
      const northEast = bounds.getNorthEast();
      onBoundsChange({
        south: southWest.getLat(),
        west: southWest.getLng(),
        north: northEast.getLat(),
        east: northEast.getLng(),
      });
    };
    const onIdle = () => {
      clearTimeout(timer);
      timer = setTimeout(publishBounds, 400);
    };
    // SDK의 지도 클릭만 처리하므로 드래그 이동이나 핀·컨트롤 조작은 선택을 해제하지 않습니다.
    const onMapClick = () => onSelect(null);

    maps.load(() => {
      if (!active || !container.current) return;
      try {
        instance = new maps.Map(container.current, {
          center: new maps.LatLng(
            initialCenter.current.latitude,
            initialCenter.current.longitude,
          ),
          level: 6,
        });
        map.current = instance;
        instance.addControl(new maps.ZoomControl(), maps.ControlPosition.RIGHT);
        maps.event.addListener(instance, "idle", onIdle);
        maps.event.addListener(instance, "click", onMapClick);
        setFailed(false);
        setInitialized(true);
        publishBounds();
      } catch {
        setFailed(true);
      }
    });

    return () => {
      active = false;
      clearTimeout(timer);
      if (instance) {
        maps.event.removeListener(instance, "idle", onIdle);
        maps.event.removeListener(instance, "click", onMapClick);
      }
      map.current = null;
    };
  }, [sdkReady, onBoundsChange, onSelect]);

  useEffect(() => {
    if (!initialized || !map.current || !window.kakao) return;
    map.current.setCenter(
      new window.kakao.maps.LatLng(center.latitude, center.longitude),
    );
  }, [center, initialized]);

  useEffect(() => {
    if (!initialized || !map.current || !window.kakao) return;
    const { maps } = window.kakao;
    // 지도 범위가 바뀌어도 남아 있는 기관은 같은 마커를 재사용합니다.
    const visibleKeys = new Set(facilities.map((facility) => facility.key));
    overlays.current.forEach((instance, markerKey) => {
      if (!visibleKeys.has(markerKey)) {
        instance.overlay.setMap(null);
        overlays.current.delete(markerKey);
      }
    });

    facilities.forEach((facility) => {
      const existing = overlays.current.get(facility.key);
      const button = existing?.button ?? document.createElement("button");
      if (!existing) {
        button.type = "button";
        button.className =
          "relative flex h-10 w-8 shrink-0 items-center justify-center border-0 bg-transparent p-0 outline-offset-4 outline-primary focus-visible:outline-2";
        // 핀의 아래 꼭짓점이 좌표를 가리키도록 고정된 크기의 SVG를 사용합니다.
        const namespace = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(namespace, "svg");
        svg.setAttribute("viewBox", "0 0 32 40");
        svg.setAttribute("aria-hidden", "true");
        svg.setAttribute(
          "class",
          "h-full w-full overflow-visible drop-shadow-sm",
        );
        const shape = document.createElementNS(namespace, "path");
        shape.setAttribute(
          "d",
          "M16 1C7.716 1 1 7.716 1 16c0 10 15 23 15 23s15-13 15-23C31 7.716 24.284 1 16 1Z",
        );
        shape.setAttribute("class", "fill-primary stroke-white stroke-2");
        shape.setAttribute("stroke-linejoin", "round");
        const dot = document.createElementNS(namespace, "circle");
        dot.setAttribute("cx", "16");
        dot.setAttribute("cy", "15");
        dot.setAttribute("r", "5");
        dot.setAttribute("class", "fill-white");
        svg.append(shape, dot);
        button.append(svg);
      }
      button.setAttribute(
        "aria-label",
        `${facility.name}, ${facility.hospital.hospital_type}, 상세 보기`,
      );
      button.title = facility.name;
      button.onclick = () => {
        maps.event.preventMap();
        onSelect(facility.key);
      };
      const position = new maps.LatLng(facility.latitude, facility.longitude);
      const overlay =
        existing?.overlay ??
        new maps.CustomOverlay({
          position,
          content: button,
          xAnchor: 0.5,
          // 아래 꼭짓점이 실제 좌표에 맞습니다. 선택/줌 변경으로 크기를 바꾸지 않습니다.
          yAnchor: 1,
          clickable: true,
        });
      if (existing) overlay.setPosition(position);
      else overlay.setMap(map.current);
      overlays.current.set(facility.key, {
        key: facility.key,
        button,
        overlay,
      });
    });
  }, [facilities, initialized, onSelect]);

  useEffect(() => {
    const instances = overlays.current;
    return () => {
      instances.forEach(({ overlay }) => overlay.setMap(null));
      instances.clear();
    };
  }, []);

  useEffect(() => {
    overlays.current.forEach(({ key: markerKey, button, overlay }) => {
      const selected = markerKey === selectedKey;
      button.setAttribute("aria-pressed", String(selected));
      const dot = button.querySelector("circle");
      dot?.classList.toggle("fill-white", !selected);
      dot?.classList.toggle("fill-sub-1", selected);
      button.classList.toggle("drop-shadow-md", selected);
      overlay.setZIndex(selected ? 100 : 1);
    });
  }, [selectedKey, facilities, initialized]);

  return (
    <div
      className="relative h-150 overflow-hidden rounded-3xl border border-[#DFE9E7] bg-[#F5F9F8]"
      role="region"
      aria-label="분만 가능 의료기관 지도"
    >
      {key && (
        <Script
          id="kakao-hospital-map-sdk"
          src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(key)}&autoload=false`}
          strategy="afterInteractive"
          onReady={() => {
            if (window.kakao?.maps) setSdkReady(true);
            else setFailed(true);
          }}
          onError={() => setFailed(true)}
        />
      )}
      <div ref={container} className="h-full w-full" />
      {initialized && !failed && (
        <button
          type="button"
          onClick={onLocate}
          disabled={isLocating}
          className="absolute bottom-6 right-4 z-20 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#DCE8E2] bg-white px-4 text-sm font-medium text-[#486257] shadow-md hover:bg-[#F5F9F7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-50"
        >
          <LocateFixed size={17} aria-hidden="true" />내 위치
        </button>
      )}
      {(!key || !initialized || failed) && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-[#F5F9F8] px-10 text-center">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
            <MapPin size={28} aria-hidden="true" />
          </span>
          <p className="text-xl font-semibold text-[#263C37]">
            {failed
              ? "지도를 불러오지 못했습니다"
              : key
                ? "지도를 불러오고 있습니다"
                : "지도 연결을 준비하고 있습니다"}
          </p>
          <p className="text-sm text-[#687C76]">
            {failed
              ? "네트워크 연결을 확인한 후 다시 시도해 주세요."
              : key
                ? "잠시만 기다려 주세요."
                : "지도 연결 후 주변 분만 가능 의료기관을 확인할 수 있습니다."}
          </p>
          {failed && (
            <button
              type="button"
              className="rounded-xl border border-[#D8E5E0] bg-white px-5 py-2 text-sm"
              onClick={() => window.location.reload()}
            >
              다시 시도
            </button>
          )}
        </div>
      )}
    </div>
  );
}
