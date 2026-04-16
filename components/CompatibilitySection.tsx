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

  const scoreColor =
    result === null ? ''
    : result.score >= 81 ? 'text-orange-500'
    : result.score >= 61 ? 'text-blue-600'
    : result.score >= 41 ? 'text-amber-600'
    : 'text-slate-500';

  return (
    <section className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
      <h2 className="text-lg font-bold text-slate-800 mb-1">相性を調べる</h2>
      <p className="text-slate-500 text-sm mb-5">あなたのタイプを起点に比較します</p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* 左：診断済みタイプ（固定） */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
            あなた
          </label>
          <div className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-slate-700 text-sm select-none">
            {userTypeName}
          </div>
        </div>

        {/* 右：比較対象（コンボボックス） */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
            比較するタイプ
          </label>
          <TypeCombobox
            value={otherTypeId}
            onChange={(id) => setOtherTypeId(id)}
            showCatchphrase={false}
            inputClassName="w-full border border-slate-300 rounded-xl px-4 py-3 pr-8 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      </div>

      {result && otherType ? (
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
          <p className="text-center text-sm font-bold text-slate-600 mb-3">
            {userTypeName} × {otherType.name}
          </p>
          <div className="text-center mb-4">
            <span className={`text-5xl font-bold ${scoreColor}`}>{result.score}%</span>
            <p className="mt-1 text-base font-semibold text-slate-700">「{result.label}」</p>
          </div>
          <div className="space-y-2 border-t border-slate-200 pt-4">
            {result.comments.map((c, i) => (
              <p key={i} className="text-slate-600 text-sm leading-relaxed flex gap-1.5">
                <span className="text-orange-400 mt-0.5 shrink-0">●</span>
                {c}
              </p>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center">
          <p className="text-slate-300 text-sm">比較するタイプを選ぶと結果が表示されます</p>
        </div>
      )}
    </section>
  );
}
