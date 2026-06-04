"use client";

import React, { Suspense } from "react";
import ReportInputScreen from "../../../components/screens/ReportInputScreen";

export default function Page() {
  return (
    <Suspense fallback={
      <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>
        제보 정보 기입란 로드 중... ✍️
      </div>
    }>
      <ReportInputScreen />
    </Suspense>
  );
}
