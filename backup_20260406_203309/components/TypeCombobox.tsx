'use client';

import { useState } from 'react';
import { personalityTypes } from '@/data/types';

type Props = {
  value: string | null;
  onChange: (typeId: string) => void;
  placeholder?: string;
  inputClassName?: string;
  showCatchphrase?: boolean;
};

export default function TypeCombobox({
  value,
  onChange,
  placeholder = 'タイプを検索して選択...',
  inputClassName,
  showCatchphrase = true,
}: Props) {
  const selectedName = value
    ? (personalityTypes.find((t) => t.id === value)?.name ?? '')
    : '';

  // query は「入力中の文字列」のみ管理。閉じているときは selectedName を表示
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filtered = personalityTypes.filter((t) => t.name.includes(query));

  const handleFocus = () => {
    setQuery('');
    setIsOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };

  const handleSelect = (typeId: string) => {
    setQuery('');
    setIsOpen(false);
    onChange(typeId);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsOpen(false);
      setQuery('');
    }, 150);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={isOpen ? query : selectedName}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={
            inputClassName ??
            'w-full border border-slate-300 rounded-xl px-4 py-3 pr-10 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400'
          }
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">
          ▼
        </span>
      </div>

      {isOpen && filtered.length > 0 && (
        <ul className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {filtered.map((t) => (
            <li
              key={t.id}
              className="px-4 py-2.5 text-sm cursor-pointer hover:bg-teal-50 flex items-baseline gap-2"
              onMouseDown={() => handleSelect(t.id)}
            >
              <span className="font-medium text-slate-700">{t.name}</span>
              {showCatchphrase && (
                <span className="text-xs text-slate-400 truncate">{t.catchphrase}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
