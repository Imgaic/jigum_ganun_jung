"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, SendIcon } from "../Icons";
import { useChatContext } from "../../context/ChatContext";
import { useUserContext } from "../../context/UserContext";
import CrowdBadge from "../CrowdBadge";
import { calculateWeightedCrowdLevel } from "../../utils/crowdAnalyzer";

export default function ChatbotScreen() {
  const router = useRouter();

  // 대화 및 유저 포인트 전역 Context 참조
  const { chatMessages, handleSendChatMessage, isGenerating } = useChatContext();
  const { unlockedUntil, handlePromptUnlock, nowMs } = useUserContext();

  // 입력창 텍스트 상태 격리 (전역에서 페이지 로컬 상태로 하향화 완료!)
  const [chatInput, setChatInput] = useState<string>("");

  const onSendMessage = () => {
    if (!chatInput.trim() || isGenerating) return;
    // 메세지를 송출한 뒤, 콜백을 통해 입력 필드를 공백으로 지웁니다.
    handleSendChatMessage(chatInput, () => setChatInput(""));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "10px" }}>
      {/* 챗봇 상단 헤더 */}
      <header style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "16px 16px 0",
      }}>
        <button
          onClick={() => router.back()}
          style={{ border: "none", background: "none", cursor: "pointer", padding: "4px", color: "var(--foreground)" }}
        >
          <ArrowLeftIcon />
        </button>
        <div>
          <h2 style={{ fontSize: "16px", fontWeight: "900" }}>AI 장소 추천 챗봇</h2>
          <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>실시간 혼잡도 분석 매핑</span>
        </div>
      </header>

      {/* 퀵 추천 질문 칩 */}
      <div style={{ display: "flex", gap: "6px", padding: "0 16px", overflowX: "auto", scrollbarWidth: "none", flexShrink: 0 }}>
        {[
          "📖 조용한 공부 장소",
          "🍔 한산한 학식 정보",
          "☕ 310관 여유로운 공간",
        ].map((chip) => (
          <button
            key={chip}
            onClick={() => {
              const text = chip.substring(2); // 이모지 제외 추출
              setChatInput(`지금 ${text} 추천해줘`);
            }}
            style={{
              padding: "6px 10px",
              fontSize: "11px",
              fontWeight: "700",
              borderRadius: "12px",
              border: "1px solid var(--border)",
              backgroundColor: "var(--surface)",
              color: "var(--text-muted)",
              whiteSpace: "nowrap",
              cursor: "pointer"
            }}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* 채팅 메세지 스레드 영역 */}
      <div style={{
        flex: 1,
        padding: "10px 16px",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "14px"
      }}>
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            style={{
              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
              maxWidth: "85%",
              display: "flex",
              flexDirection: "column",
              gap: "4px"
            }}
          >
            {/* 메세지 말풍선 */}
            <div style={{
              backgroundColor: msg.sender === "user" ? "var(--primary)" : "var(--surface)",
              color: msg.sender === "user" ? "white" : "var(--foreground)",
              padding: "12px 14px",
              borderRadius: msg.sender === "user" ? "16px 16px 2px 16px" : "16px 16px 16px 2px",
              fontSize: "12.5px",
              fontWeight: "600",
              lineHeight: "1.5",
              border: msg.sender === "user" ? "none" : "1px solid var(--border)",
              boxShadow: "var(--shadow-sm)",
              whiteSpace: "pre-line"
            }}>
              {msg.text}
            </div>

            {/* AI 가이드 추천 장소의 인라인 카드 삽입 영역 */}
            {msg.places && msg.places.length > 0 && (
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                marginTop: "6px"
              }}>
                {msg.places.map((place) => {
                  return (
                    <div
                      key={place.id}
                      onClick={() => {
                        const isUnknown = calculateWeightedCrowdLevel(place.history, nowMs) === 0;
                        if (isUnknown || unlockedUntil > nowMs) {
                          router.push(`/detail/${place.id}`);
                        } else {
                          handlePromptUnlock();
                        }
                      }}
                      style={{
                        backgroundColor: "var(--surface)",
                        border: "1px dashed var(--primary)",
                        padding: "10px 12px",
                        borderRadius: "10px",
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                        cursor: "pointer",
                        boxShadow: "var(--shadow-sm)"
                      }}
                    >
                      {/* 미니 썸네일 */}
                      <div style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "6px",
                        overflow: "hidden",
                        backgroundColor: "var(--surface-hover)",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid var(--border)"
                      }}>
                        {place.imageUrl ? (
                          <img
                            src={place.imageUrl}
                            alt={place.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <span style={{ fontSize: "16px" }}>🏢</span>
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: "9px", fontWeight: "700", color: "var(--primary)" }}>
                          🏢 {place.building} {place.floor}
                        </span>
                        <h4 style={{ fontSize: "12.5px", fontWeight: "800", color: "var(--foreground)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {place.name}
                        </h4>
                      </div>

                      {/* 공통 CrowdBadge 마운트 */}
                      <CrowdBadge place={place} customClick />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
        {isGenerating && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            alignSelf: "flex-start",
            backgroundColor: "var(--surface)",
            padding: "12px 16px",
            borderRadius: "14px 14px 14px 0",
            maxWidth: "80%",
            boxShadow: "var(--shadow-sm)",
            border: "1px dashed var(--primary)",
            fontSize: "12px",
            color: "var(--primary)",
            fontWeight: "750",
            marginTop: "6px",
            marginBottom: "4px"
          }}>
            <span style={{
              width: "12px",
              height: "12px",
              border: "2px solid var(--primary-light)",
              borderTop: "2px solid var(--primary)",
              borderRadius: "50%",
              display: "inline-block",
              animation: "spin 1s linear infinite"
            }} />
            <span>AI 도우미가 분석하고 있습니다... 🤖</span>
          </div>
        )}
      </div>

      {/* 하단 메세지 전송 인풋 창 */}
      <div style={{
        padding: "10px 14px 16px",
        borderTop: "1px solid var(--border)",
        backgroundColor: "var(--surface)",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        flexShrink: 0
      }}>
        <input
          type="text"
          placeholder={isGenerating ? "AI 답변 생성 대기 중..." : "챗봇에게 공간에 대해 직접 물어보세요..."}
          value={chatInput}
          disabled={isGenerating}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSendMessage()}
          style={{
            flex: 1,
            padding: "10px 14px",
            border: "1px solid var(--border)",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: "600",
            backgroundColor: isGenerating ? "var(--surface-hover)" : "var(--background)",
            color: "var(--foreground)",
            outline: "none",
            cursor: isGenerating ? "not-allowed" : "text"
          }}
        />
        <button
          onClick={onSendMessage}
          disabled={isGenerating}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: isGenerating ? "var(--border)" : "var(--primary)",
            border: "none",
            color: isGenerating ? "var(--text-muted)" : "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: isGenerating ? "not-allowed" : "pointer",
            boxShadow: isGenerating ? "none" : "var(--shadow-sm)",
            transition: "var(--transition-smooth)"
          }}
        >
          <SendIcon size={14} />
        </button>
      </div>

    </div>
  );
}
