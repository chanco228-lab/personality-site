'use client';

import { useState, useRef } from 'react';
import { personalityTypes } from '@/data/types';
import { computeCompatibility } from '@/lib/compatibility';

type Props = {
  userTypeId: string;
  userTypeName: string;
};

export default function CompatibilitySection({ userTypeId, userTypeName }: Props) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = personalityTypes.filter((t) =>
    t.name.includes(query)
  );

  const selectedType = selectedId
    ? personalityTypes.find((t) => t.id === selectedId)
    : null;

  const result = selectedId ? computeCompatibility(userTypeId, selectedId) : null;

  const handleSelect = (typeId: string, typeName: string) => {
    setSelectedId(typeId);
    setQuery(typeName);
    setIsOpen(false);
  };

  const handleFocus = () => {
    if (selectedId) setQuery('');
    setIsOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSelectedId(null);
    setIsOpen(true);
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
      <h2 className="text-lg font-bold text-slate-800 mb-1">相性を調べる</h2>
      <p className="text-sm text-slate-500 mb-5">
        【あなたのタイプ】{userTypeName}
      </p>

      {/* Combobox */}
      <div className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={() => setTimeout(() => setIsOpen(false), 150)}
            placeholder="タイプを検索して選択..."
            className="w-full border border-slate-300 rounded-xl px-4 py-3 pr-10 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            ▼
          </span>
        </div>

        {isOpen && filtered.length > 0 && (
          <ul className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
            {filtered.map((t) => (
              <li
                key={t.id}
                className="px-4 py-2.5 text-sm cursor-pointer hover:bg-teal-50 flex items-baseline gap-2"
                onMouseDown={() => handleSelect(t.id, t.name)}
              >
                <span className="font-medium text-slate-700">{t.name}</span>
                <span className="text-xs text-slate-400 truncate">{t.catchphrase}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Result */}
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
