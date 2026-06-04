import { NextResponse } from "next/server";

interface ChatPlacePayload {
  id: number;
  name: string;
  building: string;
  floor: string;
  detailLocation: string;
  purposes: string[];
  currentCrowdLevel?: number;
  crowdLabel?: string;
}

interface ChatRequestBody {
  message?: string;
  places?: ChatPlacePayload[];
  history?: Array<{ sender: string; text: string }>;
  virtualTime?: string;
}

interface GeminiResult {
  text?: string;
  recommendedIds?: number[];
}

export async function POST(request: Request) {
  try {
    const { message = "", places = [], history = [], virtualTime = "" } = (await request.json()) as ChatRequestBody;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          text: "⚠️ Gemini API Key가 설정되지 않았습니다. .env.local 파일에 GEMINI_API_KEY를 추가한 뒤 개발 서버를 다시 시작해주세요.",
          places: []
        },
        { status: 500 }
      );
    }

    const placeSummary = places.map((place) => ({
      id: place.id,
      name: place.name,
      building: place.building,
      floor: place.floor,
      detailLocation: place.detailLocation,
      purposes: place.purposes,
      currentCrowdLevel: place.currentCrowdLevel || 0,
      crowdLabel: place.crowdLabel || "알 수 없음"
    }));

    const systemInstruction =
      "너는 중앙대학교 실시간 공간 혼잡도 도우미 '지금 가는 중'의 AI 가이드이다. " +
      "사용자가 질문하는 조건에 맞는 장소를 아래 제공된 [교내 공간 실시간 데이터] 목록 중에서 찾아 답변하라.\n\n" +
      "답변 시 다음 규칙을 철저히 따라야 한다:\n" +
      "1. 오직 제공된 장소 목록에 있는 장소들만 언급하고 추천해야 한다. 존재하지 않는 장소는 추천하면 안 된다.\n" +
      "2. '공부', '과제', '시험', '조용한 곳'을 원한다면 혼잡도 레벨이 낮고 한산한 장소(1단계 매우 한산, 2단계 여유) 위주로 추천하라.\n" +
      "3. 실시간 정보가 '알 수 없음'(0단계)인 장소를 언급할 때는, '최근 30분 이내 제보가 없어 혼잡도를 알 수 없지만, 혹시 그 장소에 가게 되신다면 현장 첫 제보자가 되어 보상 포인트를 획득할 수 있다'는 내용으로 유저의 제보를 독려하라.\n" +
      "4. 답변의 어조는 대학생 비서처럼 친근하고 이모지를 섞어 반갑게 답하라.\n" +
      "5. 자연어 답변 텍스트(text) 내에 '(id: 2)' 또는 'ID: 6' 같이 장소의 고유 번호 식별자를 노출하여 출력해서는 안 된다. ID는 오직 'recommendedIds' 배열 값으로만 다루고 자연어 본문에는 장소 이름만 깔끔하게 언급하라.\n" +
      "6. 최종 응답은 반드시 다음 JSON 포맷 구조로만 출력해야 한다. 마크다운 백틱(```json) 없이 순수 JSON만 리턴하라:\n" +
      "{\n" +
      "  \"text\": \"사용자에게 보여줄 자연어 답변 메시지\",\n" +
      "  \"recommendedIds\": [추천한 장소의 id 숫자 배열 (없다면 빈 배열)]\n" +
      "}";

    const prompt = `
[가상 현재 시각]
${virtualTime}

[교내 공간 실시간 데이터]
${JSON.stringify(placeSummary, null, 2)}

[사용자 질문]
${message}
    `;

    // Gemini API 규격에 맞춰 멀티턴(대화 이력) contents 배열 조립
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history) && history.length > 0) {
      history.forEach((msg: { sender: string; text: string }) => {
        const role = msg.sender === "user" ? "user" : "model";
        contents.push({
          role,
          parts: [{ text: msg.text }]
        });
      });
    }

    // 최신 프롬프트(공간 스냅샷 + 질문)를 contents 맨 뒤에 user 역할로 추가
    contents.push({
      role: "user",
      parts: [{ text: prompt }]
    });

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    const data = await response.json();
    const botText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!botText) {
      return NextResponse.json({ text: "AI 응답을 생성하지 못했습니다. 다시 시도해 주세요.", places: [] });
    }

    const aiResult = JSON.parse(botText) as GeminiResult;
    const matchedPlaces = places.filter((place) => aiResult.recommendedIds?.includes(place.id));

    return NextResponse.json({
      text: aiResult.text,
      places: matchedPlaces
    });
  } catch (error: unknown) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      {
        text: "🚨 챗봇 응답 처리 중 시스템 에러가 발생했습니다. API 키나 입력을 확인해주세요.",
        places: []
      },
      { status: 500 }
    );
  }
}
