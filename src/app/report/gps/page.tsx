"use client";

import React, { Suspense } from "react";
import ReportGpsScreen from "../../../components/screens/ReportGpsScreen";

export default function Page() {
  return (
    <Suspense fallback={
      <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>
        GPS 센서 연동 확인 중... 📡
      </div>
    }>
      <ReportGpsScreen />
    </Suspense>
  );
}
