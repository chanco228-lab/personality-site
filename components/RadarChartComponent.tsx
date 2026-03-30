'use client';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { FactorScores, FACTOR_LABELS, FactorType } from '@/data/types';

type RadarChartProps = {
  scores: FactorScores;
};

const FACTOR_ORDER: FactorType[] = ['NS', 'HA', 'RD', 'P', 'SD', 'CO', 'ST'];

export default function RadarChartComponent({ scores }: RadarChartProps) {
  // Recharts RadarChart centers at the domain minimum, so shift +12 to make -12→0, 0→12, +12→24
  const data = FACTOR_ORDER.map((factor) => ({
    subject: FACTOR_LABELS[factor],
    value: scores[factor] + 12,
  }));

  return (
    <div className="w-full h-72 md:h-96">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }}
          />
          {/* Radial axis: display range 0–24 but label as −12 to +12 */}
          <PolarRadiusAxis
            domain={[0, 24]}
            tickCount={5}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            tickFormatter={(v: number) => v === 12 ? '0' : v < 12 ? String(v - 12) : `+${v - 12}`}
            angle={90}
          />
          <Radar
            name="スコア"
            dataKey="value"
            stroke="#2d9596"
            fill="#2d9596"
            fillOpacity={0.35}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
