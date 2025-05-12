'use client'

interface RgbColor {
  r: number;
  g: number;
  b: number;
}

interface GradientLegendProps {
  minValue: number;
  maxValue: number;
  startColor: RgbColor;
  endColor: RgbColor;
  className?: string;
}

function rgbToHex(color: RgbColor): string {
  return `#${color.r.toString(16).padStart(2, '0')}${color.g.toString(16).padStart(2, '0')}${color.b.toString(16).padStart(2, '0')}`;
}

export function GradientLegend({
  minValue,
  maxValue,
  startColor,
  endColor,
  className = "",
}: GradientLegendProps) {
  if (minValue === null || maxValue === null || minValue === maxValue) {
    return null; // Don't render legend if range is invalid or zero
  }

  const gradientStyle = {
    background: `linear-gradient(to right, ${rgbToHex(startColor)}, ${rgbToHex(endColor)})`,
  };

  return (
    <div className={`flex items-center space-x-2 mt-2 ${className}`}>
      <span className="text-xs text-muted-foreground tabular-nums">{minValue.toFixed(0)}</span>
      <div className="h-3 w-32 rounded-sm" style={gradientStyle}></div>
      <span className="text-xs text-muted-foreground tabular-nums">{maxValue.toFixed(0)}</span>
    </div>
  );
} 