import React from 'react';
import { PredictionDataPoint } from '../../types/ai';

interface AiPredictionChartProps {
  data: PredictionDataPoint[];
  metricName: string;
  trendDirection: 'IMPROVING' | 'STABLE' | 'DETERIORATING' | 'CRITICAL_RISK';
}

export const AiPredictionChart: React.FC<AiPredictionChartProps> = ({
  data,
  trendDirection,
}) => {
  if (!data || data.length === 0) return null;

  const width = 560;
  const height = 180;
  const padding = { top: 24, right: 36, bottom: 36, left: 45 };

  const values = data.map(d => d.value);
  const minVal = Math.max(0, Math.floor(Math.min(...values) * 0.85));
  const maxVal = Math.ceil(Math.max(...values, ...data.map(d => d.upperBound || d.value)) * 1.15) || 100;

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const getX = (index: number) => padding.left + (index / (data.length - 1)) * chartWidth;
  const getY = (val: number) => padding.top + chartHeight - ((val - minVal) / (maxVal - minVal || 1)) * chartHeight;

  // Split into historical and projected
  const historicalPoints = data.filter(d => !d.isProjected);
  const lastHistoricalIndex = historicalPoints.length - 1;
  const projectedPoints = data.slice(Math.max(0, lastHistoricalIndex));

  const historicalPath = historicalPoints
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.value)}`)
    .join(' ');

  const projectedPath = projectedPoints
    .map((d, i) => {
      const idx = lastHistoricalIndex + i;
      return `${i === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(d.value)}`;
    })
    .join(' ');

  // Confidence area for projected points
  let confidenceAreaPath = '';
  if (projectedPoints.length > 1) {
    const topPoints = projectedPoints.map((d, i) => {
      const idx = lastHistoricalIndex + i;
      const val = d.upperBound !== undefined ? d.upperBound : d.value * 1.05;
      return `${getX(idx)},${getY(val)}`;
    });
    const bottomPoints = [...projectedPoints].reverse().map((d, i) => {
      const idx = lastHistoricalIndex + (projectedPoints.length - 1 - i);
      const val = d.lowerBound !== undefined ? d.lowerBound : d.value * 0.95;
      return `${getX(idx)},${getY(val)}`;
    });
    confidenceAreaPath = `M ${topPoints.join(' L ')} L ${bottomPoints.join(' L ')} Z`;
  }

  const isRisk = trendDirection === 'CRITICAL_RISK' || trendDirection === 'DETERIORATING';
  const strokeColor = isRisk ? '#f43f5e' : '#10b981';
  const projectedStroke = isRisk ? '#fb7185' : '#34d399';

  return (
    <div className="w-full overflow-x-auto select-none py-1">
      <div className="flex items-center justify-between text-xs text-[var(--text-metadata)] mb-2 px-1">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-full bg-emerald-500 inline-block" />
            <span className="font-mono text-[11px]">Historical Baseline</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 border-b-2 border-dashed border-rose-400 inline-block" />
            <span className="font-mono text-[11px]">AI Projected Horizon</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-3 bg-rose-500/15 border border-rose-500/30 rounded inline-block" />
            <span className="font-mono text-[11px]">Confidence Interval (90%)</span>
          </div>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
        <defs>
          <linearGradient id={`gradient-hist-${trendDirection}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id={`gradient-proj-${trendDirection}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding.top + chartHeight * ratio;
          const val = Math.round(maxVal - ratio * (maxVal - minVal));
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="currentColor"
                className="text-neutral-500/15 dark:text-neutral-400/10"
                strokeDasharray="3 3"
              />
              <text
                x={padding.left - 8}
                y={y + 3}
                textAnchor="end"
                className="text-[9px] font-mono fill-neutral-400 dark:fill-neutral-500"
              >
                {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
              </text>
            </g>
          );
        })}

        {/* Confidence Interval Band */}
        {confidenceAreaPath && (
          <path
            d={confidenceAreaPath}
            fill={isRisk ? 'rgba(244, 63, 94, 0.12)' : 'rgba(16, 185, 129, 0.12)'}
            stroke="none"
          />
        )}

        {/* Vertical divider at present point */}
        <line
          x1={getX(lastHistoricalIndex)}
          y1={padding.top}
          x2={getX(lastHistoricalIndex)}
          y2={padding.top + chartHeight}
          stroke="#06b6d4"
          strokeWidth="1.5"
          strokeDasharray="2 2"
        />
        <text
          x={getX(lastHistoricalIndex)}
          y={padding.top - 8}
          textAnchor="middle"
          className="text-[9px] font-mono font-bold fill-cyan-400 uppercase"
        >
          Present (T0)
        </text>

        {/* Historical Line */}
        <path
          d={historicalPath}
          fill="none"
          stroke="#10b981"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Projected Line (Dashed) */}
        {projectedPoints.length > 1 && (
          <path
            d={projectedPath}
            fill="none"
            stroke={projectedStroke}
            strokeWidth="2.5"
            strokeDasharray="4 4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Data points */}
        {data.map((d, i) => {
          const x = getX(i);
          const y = getY(d.value);
          const isProj = !!d.isProjected;
          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r={isProj ? 4 : 4.5}
                fill={isProj ? (isRisk ? '#f43f5e' : '#10b981') : '#10b981'}
                stroke="var(--bg-surface)"
                strokeWidth="2"
              />
              <text
                x={x}
                y={padding.top + chartHeight + 16}
                textAnchor="middle"
                className={`text-[9px] font-mono ${
                  isProj ? 'fill-rose-400 font-bold' : 'fill-neutral-400'
                }`}
              >
                {d.period}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
