'use client';

import { useEffect, useState } from 'react';
import { logEvent } from '@/lib/logger';

type Props = {
  xUrl: string;
  lineUrl: string;
};

export default function StickyShareBar({ xUrl, lineUrl }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById('result-hero');
    const bottom = document.getElementById('result-share-bottom');
    if (!hero) return;

    let heroGone = false;
    let bottomVisible = false;
    const update = () => setVisible(heroGone && !bottomVisible);

    const heroObs = new IntersectionObserver(([e]) => {
      heroGone = !e.isIntersecting;
      update();
    }, { threshold: 0 });
    heroObs.observe(hero);

    let bottomObs: IntersectionObserver | null = null;
    if (bottom) {
      bottomObs = new IntersectionObserver(([e]) => {
        bottomVisible = e.isIntersecting;
        update();
      }, { threshold: 0.3 });
      bottomObs.observe(bottom);
    }

    return () => {
      heroObs.disconnect();
      bottomObs?.disconnect();
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-[100] flex gap-[10px] px-4 py-3"
      style={{
        background: 'rgba(250, 246, 238, 0.95)',
        backdropFilter: 'blur(8px)',
        borderTop: '2px solid #0E0E0E',
      }}
    >
      <a
        href={xUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => logEvent('x_shared')}
        className="flex-1 inline-flex items-center justify-center gap-2 bg-ink text-paper font-black text-[14px] py-[14px] rounded-full border-2 border-ink"
        style={{ boxShadow: '3px 3px 0 #0E0E0E' }}
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Xでシェア
      </a>
      <a
        href={lineUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => logEvent('line_shared')}
        className="flex-1 inline-flex items-center justify-center gap-2 text-paper font-black text-[14px] py-[14px] rounded-full border-2 border-ink"
        style={{ background: '#06C755', boxShadow: '3px 3px 0 #0E0E0E' }}
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.477 2 2 6.045 2 11.077c0 4.562 3.253 8.376 7.656 9.083.334.07.79.217.905.497.104.256.068.657.033.916l-.147.864c-.044.262-.206 1.023.896.558 1.101-.466 5.942-3.5 8.107-5.992C20.917 15.149 22 13.209 22 11.077 22 6.045 17.523 2 12 2z" />
        </svg>
        LINEで送る
      </a>
    </div>
  );
}
