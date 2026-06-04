"use client";

import React, { Suspense } from "react";
import ListScreen from "../../components/screens/ListScreen";

export default function Page() {
  return (
    <Suspense fallback={
      <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>
        목록을 불러오는 중입니다... 🔄
      </div>
    }>
      <ListScreen />
    </Suspense>
  );
}
