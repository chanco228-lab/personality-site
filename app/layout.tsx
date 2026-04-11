import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '性格診断 | あなたの本質を科学で照らす',
  description:
    'クロニンジャーの心理学モデルをベースにした本格性格診断。21問に答えるだけで54タイプの中からあなたの性格を診断します。陰キャ度・衝動性スコアも測定。',
  keywords: '性格診断, 無料, タイプ診断, 心理テスト, 陰キャ診断,MBTI',
  metadataBase: new URL('https://personality-site.vercel.app'),
  openGraph: {
    title: '性格診断 | あなたの本質を科学で照らす',
    description:
      'クロニンジャーの心理学モデルをベースにした本格性格診断。21問に答えるだけで54タイプの中からあなたの性格を診断します。陰キャ度・衝動性スコアも測定。',
    url: 'https://personality-site.vercel.app',
    siteName: '性格診断',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '性格診断 | あなたの本質を科学で照らす',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '性格診断 | あなたの本質を科学で照らす',
    description:
      'クロニンジャーの心理学モデルをベースにした本格性格診断。21問に答えるだけで54タイプの中からあなたの性格を診断します。陰キャ度・衝動性スコアも測定。',
    images: ['/og-image.png'],
  },
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
