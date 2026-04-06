import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'パーソナリティ診断 | あなたの本質を、科学で照らす。',
  description:
    '心理学に基づいた35問の質問で、あなたのパーソナリティタイプを診断します。新規性探求・損害回避・報酬依存など7つの気質因子から8タイプを判定。',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
