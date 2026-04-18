'use client';

import { useState } from 'react';
import { personalityTypes } from '@/data/types';
import { computeCompatibility } from '@/lib/compatibility';
import TypeCombobox from '@/components/TypeCombobox';

type Props = {
  userTypeId: string;
  userTypeName: string;
};

export default function CompatibilitySection({ userTypeId, userTypeName }: Props) {
  const [otherTypeId, setOtherTypeId] = useState<string | null>(null);

  const otherType = otherTypeId
    ? personalityTypes.find((t) => t.id === otherTypeId)
    : null;

  const result = otherTypeId ? computeCompatibility(userTypeId, otherTypeId) : null;

  const scoreBg =
    result === null ? ''
    : result.score >= 81 ? 'bg-coral text-paper'
    : result.score >= 61 ? 'bg-turq text-paper'
    : result.score >= 41 ? 'bg-yellow text-ink'
    : 'bg-paper text-ink';

  return (
    <section
      className="bg-paper border-2 border-ink rounded-[20px] p-6 md:p-8"
      style={{ boxShadow: '6px 6px 0 #0E0E0E' }}
    >
      <div className="inline-flex items-center gap-[10px] font-mono text-[13px] font-bold uppercase tracking-[0.1em] mb-3">
        <span aria-hidden="true" className="inline-block w-5 h-[2px] bg-ink" />
        COMPATIBILITY
      </div>
      <h2 className="font-black text-[22px] tracking-tight mb-1">相性を調べる</h2>
      <p className="text-[14px] mb-6" style={{ color: '#2A2A2A' }}>あなたのタイプを起点に比較します</p>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {/* あなた（固定） */}
        <div>
          <label className="block font-mono text-[11px] font-bold uppercase tracking-[0.08em] mb-2 text-ink/50">あなた</label>
          <div className="w-full border-2 border-ink rounded-[10px] px-4 py-3 text-[14px] font-bold bg-bg select-none">
            {userTypeName}
          </div>
        </div>
        {/* 比較対象 */}
        <div>
          <label className="block font-mono text-[11px] font-bold uppercase tracking-[0.08em] mb-2 text-ink/50">比較するタイプ</label>
          <TypeCombobox
            value={otherTypeId}
            onChange={(id) => setOtherTypeId(id)}
            showCatchphrase={false}
            inputClassName="w-full border-2 border-ink rounded-[10px] px-4 py-3 pr-8 text-[14px] font-bold bg-paper focus:outline-none focus:ring-2 focus:ring-yellow"
          />
        </div>
      </div>

      {result && otherType ? (
        <div className="border-2 border-ink rounded-[14px] overflow-hidden">
          <div className={`px-5 py-4 text-center border-b-2 border-ink ${scoreBg}`}>
            <p className="font-mono text-[12px] font-bold mb-2 opacity-70">
              {userTypeName} × {otherType.name}
            </p>
            <span className="font-mono font-black text-[48px] leading-none">{result.score}%</span>
            <p className="font-black text-[16px] mt-1">「{result.label}」</p>
          </div>
          <div className="p-5 space-y-3 bg-paper">
            {result.comments.map((c, i) => (
              <p key={i} className="text-[14px] leading-[1.6] flex gap-2">
                <span className="text-coral mt-[3px] shrink-0">●</span>
                {c}
              </p>
            ))}
          </div>
        </div>
      ) : (
        <div
          className="rounded-[14px] p-5 text-center"
          style={{ border: '2px dashed rgba(14,14,14,0.2)' }}
        >
          <p className="text-[13px]" style={{ color: '#2A2A2A', opacity: 0.5 }}>比較するタイプを選ぶと結果が表示されます</p>
        </div>
      )}
    </section>
  );
}
