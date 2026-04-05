import React from 'react';
import { View } from 'react-native';
import Svg, {
  Circle,
  Line,
  Text as SvgText,
  G,
} from 'react-native-svg';
import type { PlanetPosition, HouseCusp } from '../lib/api';

const SIGNS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
];

const SIGN_SYMBOLS: Record<string, string> = {
  aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋', leo: '♌', virgo: '♍',
  libra: '♎', scorpio: '♏', sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓',
};

interface ChartWheelProps {
  size: number;
  planets: PlanetPosition[];
  houses: HouseCusp[];
  ascendant: number;
  textColor?: string;
  lineColor?: string;
}

export default function ChartWheel({
  size,
  planets,
  houses,
  ascendant,
  textColor = '#1E1B4B',
  lineColor = '#6366F1',
}: ChartWheelProps) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 20;
  const signR = outerR - 14;
  const houseR = outerR - 28;
  const planetR = outerR - 50;

  const lonToXY = (lon: number, r: number) => {
    const theta = Math.PI + ((lon - ascendant) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(theta),
      y: cy - r * Math.sin(theta),
    };
  };

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* Outer circle */}
        <Circle cx={cx} cy={cy} r={outerR} fill="none" stroke={lineColor} strokeWidth={2} opacity={0.5} />
        <Circle cx={cx} cy={cy} r={signR} fill="none" stroke={lineColor} strokeWidth={1} opacity={0.3} />
        <Circle cx={cx} cy={cy} r={houseR} fill="none" stroke={lineColor} strokeWidth={1} opacity={0.3} />

        {/* House cusp lines */}
        {houses.map((h, i) => {
          const start = lonToXY(h.longitude, outerR);
          const end = lonToXY(h.longitude, 0);
          return (
            <Line
              key={`cusp-${i}`}
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke={lineColor}
              strokeWidth={i === 0 ? 2 : 1}
              opacity={i === 0 ? 0.8 : 0.3}
            />
          );
        })}

        {/* Zodiac signs on outer ring */}
        {SIGNS.map((sign, i) => {
          const lon = i * 30 + 15;
          const { x, y } = lonToXY(lon, signR);
          const sym = SIGN_SYMBOLS[sign] || '';
          return (
            <SvgText
              key={sign}
              x={x}
              y={y}
              fill={textColor}
              fontSize={10}
              textAnchor="middle"
              fontWeight="600"
            >
              {sym}
            </SvgText>
          );
        })}

        {/* Planets */}
        {planets.map((p) => {
          const { x, y } = lonToXY(p.longitude, planetR);
          return (
            <G key={`${p.planet}-${p.sign}`}>
              <Circle cx={x} cy={y} r={8} fill="#6366F1" opacity={0.3} />
              <SvgText
                x={x}
                y={y + 4}
                fill={textColor}
                fontSize={9}
                textAnchor="middle"
                fontWeight="600"
              >
                {p.planet.slice(0, 1)}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
}
