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
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedType = selectedId
    ? personalityTypes.find((t) => t.id === selectedId)
    : null;

  const result = selectedId ? computeCompatibility(userTypeId, selectedId) : null;

  return (
    <section className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
      <h2 className="text-lg font-bold text-slate-800 mb-1">相性を調べる</h2>
      <p className="text-sm text-slate-500 mb-5">
        【あなたのタイプ】{userTypeName}
      </p>

      <TypeCombobox
        value={selectedId}
        onChange={(typeId) => setSelectedId(typeId)}
      />

      {result && selectedType && (
        <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-5">
          <p className="text-center text-sm font-bold text-slate-600 mb-3">
            {userTypeName} × {selectedType.name}
          </p>
          <div className="text-center mb-4">
            <span className="text-5xl font-bold text-teal-600">{result.score}%</span>
            <p className="mt-1 text-base font-semibold text-slate-700">「{result.label}」</p>
          </div>
          <div className="space-y-2 border-t border-slate-200 pt-4 mt-4">
            {result.comments.map((c, i) => (
              <p key={i} className="text-slate-600 text-sm leading-relaxed">
                {c}
              </p>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
