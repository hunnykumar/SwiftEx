import React, { useState, useRef, useEffect } from 'react';
import { View, Text, PanResponder, StyleSheet, Dimensions, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import Svg, { Rect, Line, Defs, LinearGradient, Stop, G, Text as SvgText } from 'react-native-svg';
import * as StellarSdk from '@stellar/stellar-sdk';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { colors } from '../../../../../../Screens/ThemeColorsConfig';

const CandleStickChart = ({ visible, activeTheme, pair }) => {
  const theme = activeTheme ? colors.dark : colors.light;

  const styles = StyleSheet.create({
    container: {
      padding: 10,
      backgroundColor: theme.bg
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 8,
    },
    title: {
      fontSize: 20,
      color: theme.headingTx,
      fontWeight: '700',
    },
    ohlcContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginTop: 4,
    },
    ohlcItem: {
      fontSize: 12,
      color: theme.inactiveTx,
    },
    ohlcValue: {
      fontWeight: '600',
    },
    ohlcValueBull: {
      color: '#10b981',
    },
    ohlcValueBear: {
      color: '#ef4444',
    },
    changeContainer: {
      alignItems: 'flex-end',
    },
    change: {
      fontSize: 24,
      fontWeight: '700',
    },
    changePercent: {
      fontSize: 14,
      fontWeight: '600',
      marginTop: 2,
    },
    positive: {
      color: '#10b981',
    },
    negative: {
      color: '#ef4444',
    },
    chartContainer: {
      backgroundColor: theme.cardBg,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.inactiveTx + '20',
      overflow: 'hidden',
    },
    timeControls: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 16,
      paddingHorizontal: 4,
      flexWrap: 'wrap',
    },
    timeButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 6,
      backgroundColor: theme.cardBg,
      borderWidth: 1,
      borderColor: theme.inactiveTx + '30',
    },
    timeButtonActive: {
      backgroundColor: '#dcfce7',
      borderColor: '#10b981',
    },
    timeButtonText: {
      fontSize: 13,
      color: theme.inactiveTx,
      fontWeight: '500',
    },
    timeButtonTextActive: {
      color: '#10b981',
      fontWeight: '600',
    },
    legend: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 20,
      gap: 24,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    legendDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    bullDot: {
      backgroundColor: '#10b981',
    },
    bearDot: {
      backgroundColor: '#ef4444',
    },
    legendText: {
      fontSize: 13,
      color: theme.inactiveTx,
      fontWeight: '500',
    },
  });

  const [isLoading, setisLoading] = useState(true);
  const [candlestickData, setcandlestickData] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');

  const screenWidth = Dimensions.get('window').width;
  const CHART_HEIGHT = 320;
  const VOLUME_HEIGHT = 100;
  const TOTAL_HEIGHT = CHART_HEIGHT + VOLUME_HEIGHT;
  const CANDLE_WIDTH = 8;
  const CANDLE_GAP = 4;
  const PADDING_TOP = 20;
  const PADDING_BOTTOM = 20;

  const timeframes = [
    { label: '1m', hours: 1 / 60, resolution: 60000, limit: 60 },
    { label: '5m', hours: 5 / 60, resolution: 300000, limit: 60 },
    { label: '15m', hours: 6, resolution: 900000, limit: 24 },
    { label: '1h', hours: 24, resolution: 3600000, limit: 50 },
    { label: '1d', hours: 720, resolution: 86400000, limit: 30 },
    { label: '1w', hours: 5040, resolution: 604800000, limit: 20 },
  ];

  const createAsset = (assetCode, issuer) => {
    if (assetCode === 'native' || issuer === 'native') {
      return StellarSdk.Asset.native();
    }
    return new StellarSdk.Asset(assetCode, issuer);
  };

  async function fetchCandleStick(baseAsset, counterAsset, hours, resolution, limit) {
    try {
      const now = Date.now();
      const startTime = now - hours * 60 * 60 * 1000;
      const endTime = now;
      const server = new StellarSdk.Horizon.Server("https://horizon.stellar.lobstr.co");
      const resp = await server
        .tradeAggregation(baseAsset, counterAsset, startTime, endTime, resolution, 0)
        .limit(limit)
        .call();
      return {
        status: true,
        records: resp.records || []
      };
    } catch (err) {
      console.log(err)
      return {
        status: false,
        error: err.message || "Unknown error",
      };
    }
  }

  const loadChartData = async (timeframe) => {
    if (!pair) {
      setisLoading(false);
      return;
    }
    setisLoading(true);
    const baseAsset = createAsset(pair.base_value, pair.visible1Issuer);
    const counterAsset = createAsset(pair.counter_value, pair.visible0Issuer);

    const tf = timeframes.find(t => t.label === timeframe);
    const chartRes = await fetchCandleStick(baseAsset, counterAsset, tf.hours, tf.resolution, tf.limit);

    if (chartRes.status && chartRes.records.length > 0) {
      const processedData = chartRes.records.map(item => ({
        ...item,
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close),
        volume: parseFloat(item.base_volume),
        avg: parseFloat(item.avg)
      }));
      setcandlestickData(processedData);
    } else {
      setcandlestickData([]);
    }
    setisLoading(false);
  };

  useEffect(() => {
    if (visible && pair) {
      loadChartData(selectedTimeframe);
    }
  }, [visible, pair]);

  const handleTimeframeChange = (timeframe) => {
    setSelectedTimeframe(timeframe);
    setSelectedIndex(null);
    loadChartData(timeframe);
  };

  const scrollViewRef = useRef(null);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: evt => {
      handleTouch(evt.nativeEvent.locationX);
    },
    onPanResponderMove: evt => {
      handleTouch(evt.nativeEvent.locationX);
    },
    onPanResponderRelease: () => {
      setTimeout(() => setSelectedIndex(null), 2000);
    },
    onPanResponderTerminate: () => setSelectedIndex(null),
  });

  const handleTouch = (locationX) => {
    const x = locationX - 16;
    if (x < 0) {
      setSelectedIndex(null);
      return;
    }
    const index = Math.floor(x / (CANDLE_WIDTH + CANDLE_GAP));
    if (index >= 0 && index < candlestickData.length) {
      setSelectedIndex(index);
    } else {
      setSelectedIndex(null);
    }
  };

  if (!pair) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.headingTx }}>Please select a trading pair</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color="#10b981" size="large" />
        <Text style={{ color: theme.headingTx, marginTop: 12 }}>
          Loading {pair.name} {selectedTimeframe} chart...
        </Text>
      </View>
    );
  }

  if (candlestickData.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.headingTx }}>No data available for {pair.name}</Text>
      </View>
    );
  }

  const values = candlestickData.flatMap(d => [d.high, d.low]);
  const minPrice = Math.min(...values);
  const maxPrice = Math.max(...values);
  const priceRange = maxPrice - minPrice;
  const maxVolume = Math.max(...candlestickData.map(d => d.volume));

  const scaleY = value =>
    PADDING_TOP + ((maxPrice - value) / priceRange) * (CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM);

  const scaleVolume = volume =>
    (volume / maxVolume) * (VOLUME_HEIGHT - 20);

  const currentPrice = candlestickData[candlestickData.length - 1].close;
  const priceChange = currentPrice - candlestickData[0].open;
  const priceChangePercent = ((priceChange / candlestickData[0].open) * 100).toFixed(2);
  const isPositive = priceChange >= 0;

  const displayData = selectedIndex !== null
    ? candlestickData[selectedIndex]
    : candlestickData[candlestickData.length - 1];

  const isBullishCandle = displayData.close >= displayData.open;
  const isSelectedCandle = selectedIndex !== null;

  const getOHLCColor = () => {
    if (!isSelectedCandle) {
      return theme.inactiveTx;
    }
    return isBullishCandle ? '#10b981' : '#ef4444';
  };

  const ohlcColorStyle = getOHLCColor();
  const minChartWidth = screenWidth - 52;
  const calculatedWidth = (CANDLE_WIDTH + CANDLE_GAP) * candlestickData.length;
  const chartWidth = Math.max(minChartWidth, calculatedWidth);
  const getPriceDecimals = (price) => {
    if (price >= 1) return 4;
    if (price >= 0.01) return 6;
    return 7;
  };

  const priceDecimals = getPriceDecimals(currentPrice);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{pair.name}</Text>
          </View>
          <View style={styles.ohlcContainer}>
            <Text style={styles.ohlcItem}>
              O: <Text style={[styles.ohlcValue, { color: ohlcColorStyle }]}>{displayData.open.toFixed(priceDecimals)}</Text>
            </Text>
            <Text style={styles.ohlcItem}>
              H: <Text style={[styles.ohlcValue, { color: ohlcColorStyle }]}>{displayData.high.toFixed(priceDecimals)}</Text>
            </Text>
            <Text style={styles.ohlcItem}>
              L: <Text style={[styles.ohlcValue, { color: ohlcColorStyle }]}>{displayData.low.toFixed(priceDecimals)}</Text>
            </Text>
            <Text style={styles.ohlcItem}>
              C: <Text style={[styles.ohlcValue, { color: ohlcColorStyle }]}>{displayData.close.toFixed(priceDecimals)}</Text>
            </Text>
            <Text style={styles.ohlcItem}>
              Volume ({pair.visible_0}): <Text style={[styles.ohlcValue, { color: ohlcColorStyle }]}>{(displayData.volume / 1000000).toFixed(2)}M</Text>
            </Text>
          </View>
        </View>
        <View style={styles.changeContainer}>
          <Text style={[styles.change, isPositive ? styles.positive : styles.negative]}>
            {isPositive ? '+' : ''}{priceChange.toFixed(priceDecimals)}
          </Text>
          <Text style={[styles.changePercent, isPositive ? styles.positive : styles.negative]}>
            {isPositive ? '▲' : '▼'} {Math.abs(priceChangePercent)}%
          </Text>
        </View>
      </View>

      <View style={styles.chartContainer} {...panResponder.panHandlers}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          onContentSizeChange={() => {
            scrollViewRef.current?.scrollToEnd({ animated: false });
          }}
        >
          <Svg width={chartWidth} height={TOTAL_HEIGHT}>
            <Defs>
              <LinearGradient id="bullGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#10b981" stopOpacity="1" />
                <Stop offset="1" stopColor="#059669" stopOpacity="1" />
              </LinearGradient>
              <LinearGradient id="bearGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#ef4444" stopOpacity="1" />
                <Stop offset="1" stopColor="#dc2626" stopOpacity="1" />
              </LinearGradient>
            </Defs>
            {[0, 0.25, 0.5, 0.75, 1].map((factor, i) => {
              const price = minPrice + priceRange * factor;
              const y = scaleY(price);
              return (
                <G key={`grid-${i}`}>
                  <Line
                    x1={0}
                    y1={y}
                    x2={chartWidth}
                    y2={y}
                    stroke={theme.inactiveTx}
                    strokeWidth="0.5"
                    opacity="0.2"
                  />
                </G>
              );
            })}
            {candlestickData.map((d, i) => {
              const x = i * (CANDLE_WIDTH + CANDLE_GAP);
              const candleTop = scaleY(Math.max(d.open, d.close));
              const candleBottom = scaleY(Math.min(d.open, d.close));
              const wickTop = scaleY(d.high);
              const wickBottom = scaleY(d.low);
              const isBull = d.close >= d.open;
              const isActive = selectedIndex === i;

              return (
                <G key={`candle-${i}`}>
                  <Line
                    x1={x + CANDLE_WIDTH / 2}
                    y1={wickTop}
                    x2={x + CANDLE_WIDTH / 2}
                    y2={wickBottom}
                    stroke={isActive ? '#4f46e5' : (isBull ? '#10b981' : '#ef4444')}
                    strokeWidth={isActive ? 2 : 1}
                  />
                  <Rect
                    x={x}
                    y={candleTop}
                    width={CANDLE_WIDTH}
                    height={Math.max(2, candleBottom - candleTop)}
                    fill={isActive ? '#4f46e5' : (isBull ? '#10b981' : '#ef4444')}
                    opacity={isActive ? 1 : 0.9}
                  />
                </G>
              );
            })}
            {candlestickData.map((d, i) => {
              const x = i * (CANDLE_WIDTH + CANDLE_GAP);
              const volumeHeight = scaleVolume(d.volume);
              const volumeY = CHART_HEIGHT + (VOLUME_HEIGHT - volumeHeight);
              const isBull = d.close >= d.open;
              const isActive = selectedIndex === i;

              return (
                <Rect
                  key={`vol-${i}`}
                  x={x}
                  y={volumeY}
                  width={CANDLE_WIDTH}
                  height={volumeHeight}
                  fill={isActive ? '#4f46e5' : (isBull ? '#10b981' : '#ef4444')}
                  opacity={isActive ? 0.8 : 0.4}
                />
              );
            })}
            {selectedIndex !== null && (
              <Line
                x1={selectedIndex * (CANDLE_WIDTH + CANDLE_GAP) + CANDLE_WIDTH / 2}
                y1={0}
                x2={selectedIndex * (CANDLE_WIDTH + CANDLE_GAP) + CANDLE_WIDTH / 2}
                y2={TOTAL_HEIGHT}
                stroke="#6366f1"
                strokeWidth="1"
                strokeDasharray="4,4"
                opacity="0.5"
              />
            )}
          </Svg>
        </ScrollView>
      </View>

      <View style={styles.timeControls}>
        {timeframes.map((tf) => (
          <TouchableOpacity
            key={tf.label}
            onPress={() => handleTimeframeChange(tf.label)}
            style={[
              styles.timeButton,
              selectedTimeframe === tf.label && styles.timeButtonActive
            ]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.timeButtonText,
                selectedTimeframe === tf.label && styles.timeButtonTextActive
              ]}
            >
              {tf.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.bullDot]} />
          <Text style={styles.legendText}>Bullish</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.bearDot]} />
          <Text style={styles.legendText}>Bearish</Text>
        </View>
      </View>
    </View>
  );
};

export default CandleStickChart;