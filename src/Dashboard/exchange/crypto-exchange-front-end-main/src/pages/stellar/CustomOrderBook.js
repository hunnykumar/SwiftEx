import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator, Animated, Easing, RefreshControl, Modal } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import LinearGradient from 'react-native-linear-gradient';
import StellarSdk from 'stellar-sdk';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeEventSource, EventSourcePolyfill } from 'event-source-polyfill';

const { width } = Dimensions.get('window');
const ASSET_PAIRS = [
  {
    base: { code: 'XLM', issuer: null },
    counter: { code: 'USDC', issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN' },
    displayName: 'XLM/USDC'
  },
  {
    base: { code: 'USDC', issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN' },
    counter: { code: 'XLM', issuer: null },
    displayName: 'USDC/XLM'
  },
  {
    base: { code: 'XLM', issuer: null },
    counter: { code: 'AQUA', issuer: 'GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA' },
    displayName: 'XLM/AQUA'
  },
  {
    base: { code: 'AQUA', issuer: 'GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA' },
    counter: { code: 'XLM', issuer: null },
    displayName: 'AQUA/XLM'
  },
  {
    base: { code: 'XLM', issuer: null },
    counter: { code: 'yXLM', issuer: 'GARDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55' },
    displayName: 'XLM/yXLM'
  },
  {
    base: { code: 'yXLM', issuer: "GARDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55" },
    counter: { code: 'XLM', issuer: null },
    displayName: 'yXLM/XLM'
  },
  {
    base: { code: 'USDC', issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN' },
    counter: { code: 'BTC', issuer: 'GDPJALI4AZKUU2W426U5WKMAT6CN3AJRPIIRYR2YM54TL2GDWO5O2MZM' },
    displayName: 'USDC/BTC'
  },
  {
    base: { code: 'BTC', issuer: 'GDPJALI4AZKUU2W426U5WKMAT6CN3AJRPIIRYR2YM54TL2GDWO5O2MZM' },
    counter: { code: 'USDC', issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN' },
    displayName: 'BTC/USDC'
  }
];

const CustomOrderBook = () => {
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const isConnectingRef = useRef(false);

  const [selectedPair, setSelectedPair] = useState(ASSET_PAIRS[0]);
  const [bids, setBids] = useState([]);
  const [asks, setAsks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('chart');
  const [priceHistory, setPriceHistory] = useState([]);
  const [lastTrade, setLastTrade] = useState(null);
  const [recentTrades, setRecentTrades] = useState([]);
  const [pairSelectorVisible, setPairSelectorVisible] = useState(false);
  
  // Animation for refresh icon
  const spinValue = useRef(new Animated.Value(0)).current;
  
  // Start rotation animation
  const startRotation = () => {
    spinValue.setValue(0);
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 800,
      easing: Easing.linear,
      useNativeDriver: true
    }).start();
  };
  
  // Interpolate for rotation
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  // Prepare chart data
  const chartData = {
    labels: priceHistory.slice(-6).map((_, i) => `${i+1}`),
    datasets: [
      {
        data: priceHistory.slice(-6).map(point => point.askPrice),
        color: (opacity = 1) => `rgba(255, 59, 59, ${opacity})`,
        strokeWidth: 2
      },
      {
        data: priceHistory.slice(-6).map(point => point.bidPrice),
        color: (opacity = 1) => `rgba(76, 217, 100, ${opacity})`,
        strokeWidth: 2
      }
    ]
  };

  // Helper function to get asset from pair definition
  const getAsset = (assetDef) => {
    if (assetDef.code === 'XLM' && assetDef.issuer === null) {
      return StellarSdk.Asset.native();
    } else {
      return new StellarSdk.Asset(assetDef.code, assetDef.issuer);
    }
  };

  // Helper function to create event source URL for the selected pair
  const getEventSourceUrl = useCallback(() => {
    const baseAsset = getAsset(selectedPair.base);
    const counterAsset = getAsset(selectedPair.counter);
    
    let url = 'https://horizon.stellar.org/order_book?';
    
    // Add selling asset parameters
    if (baseAsset.isNative()) {
      url += 'selling_asset_type=native';
    } else {
      url += `selling_asset_type=credit_alphanum${baseAsset.code.length <= 4 ? '4' : '12'}`;
      url += `&selling_asset_code=${baseAsset.code}`;
      url += `&selling_asset_issuer=${baseAsset.issuer}`;
    }
    
    // Add buying asset parameters
    if (counterAsset.isNative()) {
      url += '&buying_asset_type=native';
    } else {
      url += `&buying_asset_type=credit_alphanum${counterAsset.code.length <= 4 ? '4' : '12'}`;
      url += `&buying_asset_code=${counterAsset.code}`;
      url += `&buying_asset_issuer=${counterAsset.issuer}`;
    }
    
    url += '&limit=20';
    
    return url;
  }, [selectedPair]);

  const fetchRecentTrades = useCallback(async () => {
    try {
      const server = new StellarSdk.Server('https://horizon.stellar.org');
      const baseAsset = getAsset(selectedPair.base);
      const counterAsset = getAsset(selectedPair.counter);

      const trades = await server.trades()
        .forAssetPair(baseAsset, counterAsset)
        .order('desc')
        .limit(20)
        .call();
      
      if (trades.records && trades.records.length > 0) {
        const formattedTrades = trades.records.map(trade => ({
          price: parseFloat(trade.price.d) / parseFloat(trade.price.n),
          amount: parseFloat(trade.base_amount),
          timestamp: new Date(trade.ledger_close_time).toLocaleTimeString(),
          date: new Date(trade.ledger_close_time).toLocaleDateString(),
          type: trade.base_is_seller ? 'sell' : 'buy',
          id: trade.id
        }));
        
        // Update last trade
        setLastTrade(formattedTrades[0]);
        
        // Update recent trades
        setRecentTrades(formattedTrades);
      }
    } catch (error) {
      console.log('Error fetching trades:', error);
    }
  }, [selectedPair]);

  // Reset and load data when selected pair changes
  useEffect(() => {
    setPriceHistory([]);
    setRecentTrades([]);
    setLastTrade(null);
    setBids([]);
    setAsks([]);
    setLoading(true);
    
    // Create demo data for chart until we get real data
    const demoPoints = [];
    const baseAsk = 0.123456;
    const baseBid = 0.123445;
    
    for (let i = 0; i < 6; i++) {
      demoPoints.push({
        timestamp: new Date().toLocaleTimeString(),
        askPrice: baseAsk + (Math.random() * 0.00001),
        bidPrice: baseBid + (Math.random() * 0.00001),
      });
    }
    
    setPriceHistory(demoPoints);
    
    // Disconnect any existing event source before changing pairs
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    // Fetch trades for the new pair
    fetchRecentTrades();
    
    // Connect to event source for the new pair
    setTimeout(() => {
      connectEventSource();
    }, 500);
    
  }, [selectedPair]);

  const connectEventSource = useCallback(() => {
    if (isConnectingRef.current) {
      console.warn("Already connecting, skipping duplicate connection...");
      return;
    }
    isConnectingRef.current = true; // Prevent multiple connections

    const eventSourceUrl = getEventSourceUrl();
    console.log(`Attempting to connect to EventSource: ${eventSourceUrl}`);

    // Close any existing connection before opening a new one
    if (eventSourceRef.current) {
      console.log("Closing previous EventSource...");
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setTimeout(() => {
      console.log("Reconnecting EventSource after cleanup...");

      if (eventSourceRef.current) {
        console.log("EventSource already exists! Skipping reinitialization.");
        return;
      }

      const EventSource = EventSourcePolyfill || NativeEventSource;
      eventSourceRef.current = new EventSource(eventSourceUrl, {
        heartbeatTimeout: 35000, // Prevent unexpected disconnections
      });

      eventSourceRef.current.onopen = () => {
        console.log("Connection Opened Successfully");
        isConnectingRef.current = false; // Allow reconnection if needed
      };

      eventSourceRef.current.onmessage = (event) => {
        try {
          const tradeData = JSON.parse(event.data);
          console.log('New Order Book Data Received');
          setBids(tradeData.bids || []);
          setAsks(tradeData.asks || []);
          
          // Add to price history if we have valid data
          if (tradeData.bids && tradeData.bids.length > 0 && tradeData.asks && tradeData.asks.length > 0) {
            const newDataPoint = {
              timestamp: new Date().toLocaleTimeString(),
              askPrice: parseFloat(tradeData.asks[0].price),
              bidPrice: parseFloat(tradeData.bids[0].price),
            };
            
            setPriceHistory(prev => {
              // Keep last 20 points
              const updated = [...prev, newDataPoint].slice(-20);
              return updated;
            });
          }
          
          setLoading(false);
          setRefreshing(false);
        } catch (error) {
          console.log('Failed to parse order book data:', error);
        }
      };

      eventSourceRef.current.onerror = (error) => {
        console.log('EventSource error:', JSON.stringify(error));

        isConnectingRef.current = false; // Allow reconnection if needed

        // Close and schedule a reconnect
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }

        // Retry connection after 1 seconds
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log("Retrying EventSource connection...");
            connectEventSource();
            reconnectTimeoutRef.current = null; // Clear timeout after retry
          }, 1000);
        }
      };
    }, 1000); // Small delay before reconnecting
  }, [getEventSourceUrl]);

  useFocusEffect(
    useCallback(() => {
      connectEventSource();
      
      // Fetch initial trade data
      fetchRecentTrades();

      return () => {
        console.log("Disconnecting from EventSource...");
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }

        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };
    }, [connectEventSource, fetchRecentTrades])
  );

  const onRefresh = () => {
    setRefreshing(true);
    startRotation();
    
    // Close and reconnect to event source
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    // Fetch fresh trade data
    fetchRecentTrades();
    
    // Reconnect to event source
    setTimeout(() => {
      connectEventSource();
    }, 1000);
  };

  const handlePairSelect = (pair) => {
    setSelectedPair(pair);
    setPairSelectorVisible(false);
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading order book for {selectedPair.displayName}...</Text>
        </View>
      );
    }

    switch (activeTab) {
      case 'chart':
        return (
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>{selectedPair.displayName} Price History</Text>
              <View style={styles.timeframeContainer}>
                <TouchableOpacity style={[styles.timeframeButton, styles.activeTimeframe]}>
                  <Text style={styles.timeframeText}>Live</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {priceHistory.length >= 2 ? (
              <LineChart
                data={chartData}
                width={width - 40}
                height={220}
                yAxisLabel={selectedPair.counter.code === 'USDC' ? '$' : ''}
                yAxisSuffix=""
                withDots={false}
                withInnerLines={false}
                withOuterLines={false}
                bezier
                yLabelsOffset={2}
                chartConfig={{
                  backgroundColor: '#1C1C24',
                  backgroundGradientFrom: '#1C1C24',
                  backgroundGradientTo: '#1C1C24',
                  decimalPlaces: 5,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: '0',
                  },
                  propsForBackgroundLines: {
                    strokeDasharray: '',
                    stroke: '#2E2E3A',
                    strokeWidth: 1
                  }
                }}
                style={styles.chart}
              />
            ) : (
              <View style={styles.noChartContainer}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.noChartText}>Collecting chart data for {selectedPair.displayName}...</Text>
              </View>
            )}

            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#4CD964' }]} />
                <Text style={styles.legendText}>Bids</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#FF3B3B' }]} />
                <Text style={styles.legendText}>Asks</Text>
              </View>
            </View>
            
            {lastTrade && (
              <View style={styles.lastTradeContainer}>
                <Text style={styles.lastTradeTitle}>Last Trade</Text>
                <View style={styles.lastTradeContent}>
                  <View style={styles.lastTradeItem}>
                    <Text style={styles.lastTradeLabel}>Price</Text>
                    <Text style={[
                      styles.lastTradeValue, 
                      lastTrade.type === 'buy' ? styles.bidText : styles.askText
                    ]}>
                      {selectedPair.counter.code === 'USDC' ? '$' : ''}{lastTrade.price.toFixed(6)}
                    </Text>
                  </View>
                  <View style={styles.lastTradeItem}>
                    <Text style={styles.lastTradeLabel}>Amount</Text>
                    <Text style={styles.lastTradeValue}>{lastTrade.amount.toFixed(7)} {selectedPair.base.code}</Text>
                  </View>
                  <View style={styles.lastTradeItem}>
                    <Text style={styles.lastTradeLabel}>Time</Text>
                    <Text style={styles.lastTradeValue}>{lastTrade.timestamp}</Text>
                  </View>
                  <View style={styles.lastTradeItem}>
                    <Text style={styles.lastTradeLabel}>Type</Text>
                    <View style={[
                      styles.lastTradeTypeTag,
                      lastTrade.type === 'buy' ? styles.buyTag : styles.sellTag
                    ]}>
                      <Text style={[
                        styles.lastTradeTypeText,
                        lastTrade.type === 'buy' ? styles.bidText : styles.askText
                      ]}>
                        {lastTrade.type === 'buy' ? 'BUY' : 'SELL'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
            
            <Text style={styles.chartInfo}>
              Chart updates in real-time with market data for {selectedPair.displayName}
            </Text>
          </View>
        );
      case 'trades':
        return (
          <View style={styles.tradesContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerText, { flex: 2 }]}>Price ({selectedPair.counter.code})</Text>
              <Text style={[styles.headerText, { flex: 2 }]}>Amount ({selectedPair.base.code})</Text>
              <Text style={[styles.headerText, { flex: 2.5 }]}>Time</Text>
              <Text style={[styles.headerText, { flex: 1 }]}>Type</Text>
            </View>
            {recentTrades.length > 0 ? (
              recentTrades.map((trade, index) => (
                <View key={trade.id || index} style={styles.tradeRow}>
                  <Text style={[
                    styles.tradePrice, 
                    trade.type === 'buy' ? styles.bidText : styles.askText
                  ]}>
                    {selectedPair.counter.code === 'USDC' ? '$' : ''}{trade.price.toFixed(7)}
                  </Text>
                  <Text style={styles.tradeAmount}>{trade.amount.toFixed(7)}</Text>
                  <View style={styles.tradeTimeCol}>
                    <Text style={styles.tradeTime}>{trade.timestamp}</Text>
                    <Text style={styles.tradeDate}>{trade.date}</Text>
                  </View>
                  <View style={[
                    styles.tradeTypeTag,
                    trade.type === 'buy' ? styles.buyTag : styles.sellTag
                  ]}>
                    <Text style={[
                      styles.tradeTypeText,
                      trade.type === 'buy' ? styles.bidText : styles.askText
                    ]}>
                      {trade.type === 'buy' ? 'B' : 'S'}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.noTradesContainer}>
                <Text style={styles.noTradesText}>No recent trades found for {selectedPair.displayName}</Text>
              </View>
            )}
          </View>
        );
      case 'bids':
        return (
          <View style={styles.ordersContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerText, { flex: 2 }]}>Price ({selectedPair.counter.code})</Text>
              <Text style={[styles.headerText, { flex: 2 }]}>Amount ({selectedPair.base.code})</Text>
              <Text style={[styles.headerText, { flex: 1 }]}>Total</Text>
            </View>
            {bids.length > 0 ? (
              bids.map((bid, index) => {
                const amount = parseFloat(bid.amount);
                const price = parseFloat(bid.price);
                const total = (amount * price).toFixed(7);
                const depth = (index / bids.length) * 100;
                
                return (
                  <View key={index} style={styles.orderRow}>
                    <LinearGradient
                      colors={['rgba(76, 217, 100, 0.15)', 'rgba(76, 217, 100, 0)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.depthIndicator, { width: `${depth}%` }]}
                    />
                    <Text style={[styles.priceText, styles.bidText]}>
                      {selectedPair.counter.code === 'USDC' ? '$' : ''}{parseFloat(bid.price).toFixed(7)}
                    </Text>
                    <Text style={[styles.amountText]}>{parseFloat(bid.amount).toFixed(7)}</Text>
                    <Text numberOfLines={1} style={styles.totalText}>{total}</Text>
                  </View>
                );
              })
            ) : (
              <View style={styles.noTradesContainer}>
                <Text style={styles.noTradesText}>No bids found for {selectedPair.displayName}</Text>
              </View>
            )}
          </View>
        );
      case 'asks':
        return (
          <View style={styles.ordersContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerText, { flex: 2 }]}>Price ({selectedPair.counter.code})</Text>
              <Text style={[styles.headerText, { flex: 2 }]}>Amount ({selectedPair.base.code})</Text>
              <Text style={[styles.headerText, { flex: 1 }]}>Total</Text>
            </View>
            {asks.length > 0 ? (
              asks.map((ask, index) => {
                const amount = parseFloat(ask.amount);
                const price = parseFloat(ask.price);
                const total = (amount * price).toFixed(7);
                const depth = ((asks.length - index) / asks.length) * 100;
                
                return (
                  <View key={index} style={styles.orderRow}>
                    <LinearGradient
                      colors={['rgba(255, 59, 59, 0.15)', 'rgba(255, 59, 59, 0)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.depthIndicator, { width: `${depth}%` }]}
                    />
                    <Text style={[styles.priceText, styles.askText]}>
                      {selectedPair.counter.code === 'USDC' ? '$' : ''}{parseFloat(ask.price).toFixed(7)}
                    </Text>
                    <Text style={styles.amountText}>{parseFloat(ask.amount).toFixed(7)}</Text>
                    <Text numberOfLines={1} style={styles.totalText}>{total}</Text>
                  </View>
                );
              })
            ) : (
              <View style={styles.noTradesContainer}>
                <Text style={styles.noTradesText}>No asks found for {selectedPair.displayName}</Text>
              </View>
            )}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerLeft}
          onPress={() => setPairSelectorVisible(true)}
        >
          <View style={styles.pairSelector}>
            <Text style={styles.title}>{selectedPair.displayName}</Text>
            <Ionicons name="chevron-down" size={16} color="#8A8A8F" />
          </View>
          <Text style={styles.subtitle}>
            {!loading && asks.length > 0 ? 
              `${selectedPair.counter.code === 'USDC' ? '$' : ''}${parseFloat(asks[0].price).toFixed(6)}` : 
              '...'}
          </Text>
          {lastTrade && (
            <View style={styles.lastTradePreview}>
              <Text style={styles.lastTradePreviewLabel}>Last:</Text>
              <Text style={[
                styles.lastTradePreviewValue,
                lastTrade.type === 'buy' ? styles.bidText : styles.askText
              ]}>
                {selectedPair.counter.code === 'USDC' ? '$' : ''}{lastTrade.price.toFixed(6)}
              </Text>
              <View style={[
                styles.lastTradeTypeIndicator,
                lastTrade.type === 'buy' ? styles.buyIndicator : styles.sellIndicator
              ]} />
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.headerRight}>
          {refreshing ? (
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Ionicons name="refresh" size={24} color="#007AFF" />
            </Animated.View>
          ) : (
            <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
              <Ionicons name="refresh" size={24} color="#8A8A8F" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'chart' && styles.activeTab]}
          onPress={() => setActiveTab('chart')}
        >
          <Text style={[styles.tabText, activeTab === 'chart' && styles.activeTabText]}>Chart</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'trades' && styles.activeTab]}
          onPress={() => setActiveTab('trades')}
        >
          <Text style={[styles.tabText, activeTab === 'trades' && styles.activeTabText]}>Trades</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'bids' && styles.activeTab]}
          onPress={() => setActiveTab('bids')}
        >
          <Text style={[styles.tabText, activeTab === 'bids' && styles.activeTabText]}>Bids</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'asks' && styles.activeTab]}
          onPress={() => setActiveTab('asks')}
        >
          <Text style={[styles.tabText, activeTab === 'asks' && styles.activeTabText]}>Asks</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
          />
        }
      >
        {renderTabContent()}
      </ScrollView>
      
      {refreshing && (
        <View style={styles.overlayIndicator}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.overlayText}>Updating {selectedPair.displayName}...</Text>
        </View>
      )}

      {/* Asset Pair Selector Modal */}
      <Modal
        visible={pairSelectorVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPairSelectorVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Asset Pair</Text>
              <TouchableOpacity onPress={() => setPairSelectorVisible(false)}>
                <Ionicons name="close" size={24} color="#8A8A8F" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pairsList}>
              {ASSET_PAIRS.map((pair, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[
                    styles.pairItem,
                    selectedPair.displayName === pair.displayName && styles.selectedPairItem
                  ]}
                  onPress={() => handlePairSelect(pair)}
                >
                  <Text style={[
                    styles.pairItemText,
                    selectedPair.displayName === pair.displayName && styles.selectedPairText
                  ]}>
                    {pair.displayName}
                  </Text>
                  {selectedPair.displayName === pair.displayName && (
                    <Ionicons name="checkmark" size={20} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#011434',
  },
  header: {
    paddingTop: 5,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2E2E3A',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  pairSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginRight: 5,
  },
  subtitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 5,
  },
  lastTradePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  lastTradePreviewLabel: {
    fontSize: 13,
    color: '#8A8A8F',
    marginRight: 5,
  },
  lastTradePreviewValue: {
    fontSize: 13,
    fontWeight: '500',
    marginRight: 5,
  },
  lastTradeTypeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  buyIndicator: {
    backgroundColor: '#4CD964',
  },
  sellIndicator: {
    backgroundColor: '#FF3B3B',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#2E2E3A',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8A8A8F',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  chartContainer: {
    padding: 20,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  timeframeContainer: {
    flexDirection: 'row',
  },
  timeframeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
    backgroundColor: '#2E2E3A',
  },
  activeTimeframe: {
    backgroundColor: '#007AFF',
  },
  timeframeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  chart: {
    marginVertical: 10,
    borderRadius: 16,
  },
  noChartContainer: {
    width: '100%',
    height: 220,
    backgroundColor: '#1C1C24',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noChartText: {
    color: '#8A8A8F',
    marginTop: 10,
    fontSize: 14,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  chartInfo: {
    textAlign: 'center',
    color: '#8A8A8F',
    fontSize: 12,
    marginTop: 10,
    marginBottom:15,
  },
  lastTradeContainer: {
    marginTop: 25,
    backgroundColor: '#1C1C24',
    borderRadius: 16,
    padding: 15,
  },
  lastTradeTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  lastTradeContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  lastTradeItem: {
    width: '50%',
    marginBottom: 12,
  },
  lastTradeLabel: {
    color: '#8A8A8F',
    fontSize: 12,
    marginBottom: 4,
  },
  lastTradeValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  lastTradeTypeTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  buyTag: {
    backgroundColor: 'rgba(76, 217, 100, 0.2)',
  },
  sellTag: {
    backgroundColor: 'rgba(255, 59, 59, 0.2)',
  },
  lastTradeTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bidText: {
    color: '#4CD964',
  },
  askText: {
    color: '#FF3B3B',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#8A8A8F',
    fontSize: 16,
    marginTop: 10,
  },
  ordersContainer: {
    padding: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2E2E3A',
  },
  headerText: {
    color: '#8A8A8F',
    fontSize: 12,
    fontWeight: '500',
  },
  orderRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2E2E3A',
    position: 'relative',
  },
  depthIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
  },
  priceText: {
    flex: 2,
    fontSize: 14,
    fontWeight: '500',
  },
  amountText: {
    flex: 2,
    fontSize: 14,
    color: '#FFFFFF',
  },
  totalText: {
    flex: 1,
    fontSize: 14,
    color: '#8A8A8F',
  },
  tradesContainer: {
    padding: 20,
  },
  tradeRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2E2E3A',
    alignItems: 'center',
  },
  tradePrice: {
    flex: 2,
    fontSize: 14,
    fontWeight: '500',
  },
  tradeAmount: {
    flex: 2,
    fontSize: 14,
    color: '#FFFFFF',
  },
  tradeTimeCol: {
    flex: 2.5,
  },
  tradeTime: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  tradeDate: {
    fontSize: 12,
    color: '#8A8A8F',
    marginTop: 2,
  },
  tradeTypeTag: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tradeTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  noTradesContainer: {
    padding: 30,
    alignItems: 'center',
  },
  noTradesText: {
    color: '#8A8A8F',
    fontSize: 14,
  },
  overlayIndicator: {
    position: 'absolute',
    top: 90,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  overlayText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#13131A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2E2E3A',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  pairsList: {
    maxHeight: 400,
  },
  pairItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2E2E3A',
  },
  selectedPairItem: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  pairItemText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  selectedPairText: {
    fontWeight: '600',
    color: '#007AFF',
  }
});
export default CustomOrderBook;
