"use client";

import React, { createContext, useContext, useState } from "react";
import { Place, INITIAL_PLACES } from "../types";
import { useSimulation } from "../hooks/useSimulation";

interface PlaceContextType {
  places: Place[];
  setPlaces: React.Dispatch<React.SetStateAction<Place[]>>;
  isSimulating: boolean;
  setIsSimulating: React.Dispatch<React.SetStateAction<boolean>>;
  simLogs: string[];
  targetCount: number;
  setTargetCount: React.Dispatch<React.SetStateAction<number>>;
  generatedCount: number;
  simBias: string;
  setSimBias: React.Dispatch<React.SetStateAction<string>>;
}

const PlaceContext = createContext<PlaceContextType | undefined>(undefined);

export function PlaceProvider({ children }: { children: React.ReactNode }) {
  const [places, setPlaces] = useState<Place[]>(() => INITIAL_PLACES());
  const [targetCount, setTargetCount] = useState<number>(30); // 기본 제보 생성 개수: 30개
  const [simBias, setSimBias] = useState<string>("random");

  // 시뮬레이터 훅 주입 연동
  const { isSimulating, setIsSimulating, simLogs, generatedCount } = useSimulation(places, setPlaces, targetCount, simBias);

  return (
    <PlaceContext.Provider value={{
      places,
      setPlaces,
      isSimulating,
      setIsSimulating,
      simLogs,
      targetCount,
      setTargetCount,
      generatedCount,
      simBias,
      setSimBias
    }}>
      {children}
    </PlaceContext.Provider>
  );
}

export function usePlacesContext() {
  const context = useContext(PlaceContext);
  if (!context) {
    throw new Error("usePlacesContext must be used within a PlaceProvider");
  }
  return context;
}
