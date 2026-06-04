"use client";

import React, { createContext, useContext, useState } from "react";
import { ChatMessage, Place } from "../types";
import { usePlacesContext } from "./PlaceContext";
import { calculateWeightedCrowdLevel } from "../utils/crowdAnalyzer";

interface ChatContextType {
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  handleSendChatMessage: (chatInput: string, clearInput: () => void) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { places } = usePlacesContext();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: "bot",
      text: "안녕하세요! 중앙대학교 실시간 공간 도우미 챗봇입니다. 🤖\n\n'지금 공부하기 좋은 여유로운 라운지 추천해줘' 혹은 '310관 식당 자리 있어?' 같이 원하시는 장소나 상태를 물어보세요!",
    },
  ]);

  const handleSendChatMessage = (chatInput: string, clearInput: () => void) => {
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: chatMessages.length + 1,
      sender: "user",
      text: chatInput,
    };

    setChatMessages((prev) => [...prev, userMsg]);
    const inputKeyword = chatInput.toLowerCase();
    clearInput();

    // 챗봇 자동화 비동기 대답 시뮬레이션
    setTimeout(() => {
      let responseText = "";
      let recommendedPlaces: Place[] = [];

      if (inputKeyword.includes("공부") || inputKeyword.includes("시험") || inputKeyword.includes("조용한")) {
        responseText = "조용하고 쾌적하게 공부하기 좋은 장소들을 실시간 정보를 기반으로 추천해 드릴게요! 📚";
        const responseTime = Date.now();
        recommendedPlaces = places.filter(
          (p) => {
            const crowdLevel = calculateWeightedCrowdLevel(p.history, responseTime);
            return p.purposes.includes("공부") && crowdLevel <= 2 && crowdLevel > 0;
          }
        );
      } else if (inputKeyword.includes("학식") || inputKeyword.includes("식사") || inputKeyword.includes("참슬기")) {
        responseText = "현재 참슬기식당이나 학생식당 등 교내 식사 장소 상황입니다. 혼잡한 시간을 피해 방문해 보세요! 🍔";
        recommendedPlaces = places.filter((p) => p.purposes.includes("식사"));
      } else if (inputKeyword.includes("310관") || inputKeyword.includes("경영대")) {
        responseText = "310관(경영관) 내부 장소들의 실시간 실내 혼잡 상태입니다. 🏢";
        recommendedPlaces = places.filter((p) => p.building === "310관");
      } else {
        responseText =
          "중앙대학교 실시간 공간 상태 정보를 분석해 드립니다. 원하시는 학습공간, 식사 장소나 조용한 곳을 구체적으로 알려주시면 가장 한산한 곳 위주로 맞춤 추천해 드려요! 🍀";
      }

      const botMsg: ChatMessage = {
        id: chatMessages.length + 2,
        sender: "bot",
        text: responseText,
        places: recommendedPlaces.length > 0 ? recommendedPlaces : undefined,
      };

      setChatMessages((prev) => [...prev, botMsg]);
    }, 800);
  };

  return (
    <ChatContext.Provider value={{ chatMessages, setChatMessages, handleSendChatMessage }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}
