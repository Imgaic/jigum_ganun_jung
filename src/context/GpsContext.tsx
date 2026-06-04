"use client";

import React, { createContext, useContext, useState } from "react";

interface GpsContextType {
  myGPSBuilding: string;
  setMyGPSBuilding: React.Dispatch<React.SetStateAction<string>>;
}

const GpsContext = createContext<GpsContextType | undefined>(undefined);

export function GpsProvider({ children }: { children: React.ReactNode }) {
  const [myGPSBuilding, setMyGPSBuilding] = useState<string>("310관"); // 기본 GPS 세팅 건물

  return (
    <GpsContext.Provider value={{ myGPSBuilding, setMyGPSBuilding }}>
      {children}
    </GpsContext.Provider>
  );
}

export function useGpsContext() {
  const context = useContext(GpsContext);
  if (!context) {
    throw new Error("useGpsContext must be used within a GpsProvider");
  }
  return context;
}
