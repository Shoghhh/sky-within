import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { api } from '../lib/api';

interface ChartImageProps {
  imageUrl: string;
  token: string | null;
  width: number;
  height: number;
  accentColor?: string;
}

/**
 * Fetches and displays the natal chart SVG with auth.
 * React Native's Image doesn't reliably send headers on iOS, and doesn't support SVG.
 * We fetch with Authorization and render via SvgXml.
 */
export default function ChartImage({
  imageUrl,
  token,
  width,
  height,
  accentColor = '#6366F1',
}: ChartImageProps) {
  const [svgXml, setSvgXml] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!imageUrl || !token) return;

    let cancelled = false;
    setError(false);
    setSvgXml(null);

    const url = api.user.getNatalChartImageUrl();
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (cancelled) return null;
        if (!res.ok) throw new Error(`Chart image failed: ${res.status}`);
        return res.text();
      })
      .then((text) => {
        if (!cancelled && text) setSvgXml(text);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [imageUrl, token]);

  if (error) return null;
  if (!svgXml) {
    return (
      <View style={[styles.placeholder, { width, height }]}>
        <ActivityIndicator size="large" color={accentColor} />
      </View>
    );
  }

  return (
    <SvgXml
      xml={svgXml}
      width={width}
      height={height}
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
