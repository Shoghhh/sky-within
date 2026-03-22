import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { planetColors } from '../constants/theme';

const PLANET_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Sun: 'sunny',
  Moon: 'moon',
  Mercury: 'planet',
  Venus: 'heart',
  Mars: 'flash',
  Jupiter: 'planet',
  Saturn: 'planet',
  Uranus: 'planet',
  Neptune: 'planet',
  Pluto: 'planet',
  Ascendant: 'compass',
};

interface PlanetIconProps {
  name: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  animated?: boolean;
}

export default function PlanetIcon({ name, size = 24, style, animated = true }: PlanetIconProps) {
  const iconName = PLANET_ICONS[name] || 'planet';
  const color = planetColors[name] || '#A78BFA';
  const rotation = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!animated) return;
    const runRotation = () => {
      Animated.timing(rotation, {
        toValue: 360,
        duration: 30000,
        useNativeDriver: true,
      }).start(() => {
        rotation.setValue(0);
        runRotation();
      });
    };
    runRotation();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 1250, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1250, useNativeDriver: true }),
      ])
    ).start();
  }, [animated]);

  const animatedStyle = animated
    ? {
        transform: [
          { rotate: rotation.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] }) },
          { scale: pulse },
        ],
      }
    : {};

  return (
    <Animated.View style={[style, animatedStyle]}>
      <Ionicons name={iconName} size={size} color={color} />
    </Animated.View>
  );
}
