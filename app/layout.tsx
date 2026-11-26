import { Metadata } from "next";
import "./globals.css";
import "@/styles/tailwind/tailwind.theme.css"

import { pretendard, nanumSquareRound } from "@/styles/font/font";
import { cn } from "@/lib/utils";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import { Suspense } from "react";
import AuthHydration from "@/components/auth/AuthHydration";


export const metadata: Metadata = {
  title: "Next Project",
  description: "재밌게 공부하는 Next 16!",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={cn(pretendard.variable, nanumSquareRound.variable, "font-sans [scrollbar-gutter:stable_both-edges]")}>
      <body className="min-w-330 font-pretendard">
        <ReactQueryProvider>
          <Suspense fallback={null}><AuthHydration /></Suspense>
          {children}
        </ReactQueryProvider>
      </body>
    </html>
  );
}
