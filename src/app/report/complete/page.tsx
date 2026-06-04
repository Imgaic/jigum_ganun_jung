"use client";

import React, { Suspense } from "react";
import ReportCompleteScreen from "../../../components/screens/ReportCompleteScreen";

export default function Page() {
  return (
    <Suspense fallback={
      <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>
        적립 결과 분석 중... 🎉
      </div>
    }>
      <ReportCompleteScreen />
    </Suspense>
  );
}
