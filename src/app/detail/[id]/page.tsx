"use client";

import React, { use } from "react";
import DetailScreen from "../../../components/screens/DetailScreen";
import { usePlacesContext } from "../../../context/PlaceContext";

interface DetailPageProps {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: DetailPageProps) {
  // React 19 use API를 사용해 비동기 params 프로미스를 클라이언트 단에서 동기적으로 해소합니다.
  const resolvedParams = use(params);
  const { places } = usePlacesContext();

  const placeId = Number(resolvedParams.id);
  const selectedPlace = places.find((p) => p.id === placeId);

  // 로딩 등의 시점에 대비한 안전 예외 처리
  if (!selectedPlace) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>
        장소 정보를 불러올 수 없습니다. ⚠️
      </div>
    );
  }

  return <DetailScreen selectedPlace={selectedPlace} />;
}
