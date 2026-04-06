'use client';

type Props = {
  score: number;
  label: string;
  description?: string;
  colorFrom: string;
  colorMid: string;
  colorTo: string;
  leftLabel: string;
  rightLabel: string;
};

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function lerpColor(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)})`;
}

function getScoreColor(score: number, from: string, mid: string, to: string): string {
  return score <= 50
    ? lerpColor(from, mid, score / 50)
    : lerpColor(mid, to, (score - 50) / 50);
}

export default function GradientScoreBar({
  score, label, description,
  colorFrom, colorMid, colorTo,
  leftLabel, rightLabel,
}: Props) {
  const scoreColor = getScoreColor(score, colorFrom, colorMid, colorTo);

  return (
    <div>
      {/* スコア数字 */}
      <div className="text-center mb-4">
        <span className="text-6xl font-extrabold tabular-nums" style={{ color: scoreColor }}>
          {score}
        </span>
        <span className="text-3xl font-bold ml-1" style={{ color: scoreColor }}>%</span>
      </div>

      {/* グラデーションバー */}
      <div
        className="relative h-3 rounded-full overflow-hidden"
        style={{
          background: `linear-gradient(to right, ${colorFrom}, ${colorMid}, ${colorTo})`,
        }}
      >
        {/* スコア位置インジケーター */}
        <div
          className="absolute top-0 bottom-0 bg-white"
          style={{ left: `calc(${score}% - 1px)`, width: '2px', opacity: 0.9 }}
        />
      </div>

      {/* 左右ラベル */}
      <div className="flex justify-between text-xs text-slate-400 mt-1.5 px-0.5">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>

      {/* ラベル名 + 説明文 */}
      <div className="mt-4 text-center">
        <p className="text-base font-semibold" style={{ color: scoreColor }}>
          「{label}」
        </p>
        {description && (
          <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{description}</p>
        )}
      </div>
    </div>
  );
}
