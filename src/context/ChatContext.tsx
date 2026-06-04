"use client";

import React, { createContext, useContext, useState } from "react";
import { ChatMessage } from "../types";
import { usePlacesContext } from "./PlaceContext";
import { calculateWeightedCrowdLevel, getCrowdLevelInfo } from "../utils/crowdAnalyzer";
import { getVirtualNow, formatVirtualTime } from "../utils/timeSpeed";

interface ChatContextType {
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  handleSendChatMessage: (chatInput: string, clearInput: () => void) => void;
  isGenerating: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { places } = usePlacesContext();
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: "bot",
      text: "안녕하세요! 중앙대학교 실시간 공간 도우미 챗봇입니다. 🤖\n\n'지금 공부하기 좋은 여유로운 라운지 추천해줘' 혹은 '310관 식당 자리 있어?' 같이 원하시는 장소나 상태를 물어보세요!",
      time: formatVirtualTime(getVirtualNow())
    },
  ]);

  const handleSendChatMessage = async (chatInput: string, clearInput: () => void) => {
    if (!chatInput.trim() || isGenerating) return;

    const userMsg: ChatMessage = {
      id: chatMessages.length + 1,
      sender: "user",
      text: chatInput,
      time: formatVirtualTime(getVirtualNow())
    };

    setChatMessages((prev) => [...prev, userMsg]);
    clearInput();
    setIsGenerating(true);

    try {
      // 실시간 가중 혼잡도 계산 스냅샷 동봉
      const responseTime = getVirtualNow();
      const placesWithCalculatedCrowd = places.map((p) => {
        const currentLevel = calculateWeightedCrowdLevel(p.history, responseTime);
        const levelInfo = getCrowdLevelInfo(currentLevel);
        return {
          ...p,
          currentCrowdLevel: currentLevel,
          crowdLabel: levelInfo.label
        };
      });

      // 가상 기준시 포맷팅 (예: "15시 30분")
      const date = new Date(responseTime);
      const virtualTimeStr = `${String(date.getHours()).padStart(2, "0")}시 ${String(date.getMinutes()).padStart(2, "0")}분`;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: chatInput,
          places: placesWithCalculatedCrowd,
          history: chatMessages,
          virtualTime: virtualTimeStr
        })
      });

      const data = await response.json();

      const botMsg: ChatMessage = {
        id: chatMessages.length + 2,
        sender: "bot",
        text: data.text || "죄송합니다. 답변을 가져오지 못했습니다.",
        places: data.places && data.places.length > 0 ? data.places : undefined,
        time: formatVirtualTime(getVirtualNow())
      };

      setChatMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat API error:", error);
      const errorMsg: ChatMessage = {
        id: chatMessages.length + 2,
        sender: "bot",
        text: "🚨 AI 응답을 불러오는 중에 네트워크 오류가 발생했습니다. API 키 및 연결을 점검해주세요."
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ChatContext.Provider value={{ chatMessages, setChatMessages, handleSendChatMessage, isGenerating }}>
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
