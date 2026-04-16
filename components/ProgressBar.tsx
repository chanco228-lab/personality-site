'use client';

type ProgressBarProps = {
  current: number;
  total: number;
};

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = Math.round(((current - 1) / total) * 100);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-slate-600">
          <span className="text-orange-500 font-bold text-base">{current}</span>
          <span className="text-slate-400"> / {total}</span>
        </span>
        <span className="text-sm text-slate-500">{percentage}%</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            background: 'linear-gradient(90deg, #F97316 0%, #fb923c 100%)',
          }}
        />
      </div>
    </div>
  );
}
