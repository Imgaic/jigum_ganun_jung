import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { PlaceProvider } from "../context/PlaceContext";
import { UserProvider } from "../context/UserContext";
import { GpsProvider } from "../context/GpsContext";
import { ChatProvider } from "../context/ChatContext";
import AppLayoutWrapper from "../components/AppLayoutWrapper";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-noto-sans",
});

export const metadata: Metadata = {
  title: "지금 가는 중 | 실시간 약속 및 위치 공유 프로토타입",
  description: "기말 시연을 위한 실시간 위치 및 약속 공유 모바일 웹 앱 프로토타입",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={notoSansKr.variable}>
      <body>
        <UserProvider>
          <PlaceProvider>
            <ChatProvider>
              <GpsProvider>
                <AppLayoutWrapper>{children}</AppLayoutWrapper>
              </GpsProvider>
            </ChatProvider>
          </PlaceProvider>
        </UserProvider>
      </body>
    </html>
  );
}
