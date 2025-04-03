import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator, Animated, Easing, RefreshControl, Modal } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import StellarSdk from 'stellar-sdk';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeEventSource, EventSourcePolyfill } from 'event-source-polyfill';
import { Area, Chart, HorizontalAxis, Line, Tooltip, VerticalAxis } from "react-native-responsive-linechart";
const { width } = Dimensions.get('window');
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
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

// Define available tabs
const ALL_TABS = [
  { id: 'chart', label: 'Chart' },
  { id: 'trades', label: 'Trades' },
  { id: 'bids', label: 'Bids' },
  { id: 'asks', label: 'Asks' }
];

const CustomOrderBook = ({ visibleTabs = ['chart', 'trades', 'bids', 'asks'] }) => {
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const isConnectingRef = useRef(false);

  const [selectedPair, setSelectedPair] = useState(ASSET_PAIRS[0]);
  const [points_data,setpoints_data]=useState(null);
  const [points_data_time,setpoints_data_time]=useState(null);
  const [bids, setBids] = useState([]);
  const [asks, setAsks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [priceHistory, setPriceHistory] = useState([]);
  const [lastTrade, setLastTrade] = useState(null);
  const [recentTrades, setRecentTrades] = useState([]);
  const [pairSelectorVisible, setPairSelectorVisible] = useState(false);
  
  // Filter and validate tabs
  const availableTabs = ALL_TABS.filter(tab => visibleTabs.includes(tab.id));
  
  // Set default active tab from available tabs
  const [activeTab, setActiveTab] = useState(availableTabs.length > 0 ? availableTabs[0].id : 'chart');
  
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

  const chartData = priceHistory
  .map(point => ({
    x: new Date(`1970-01-01T${point.timestamp}Z`).getTime(), // Convert HH:mm:ss to timestamp
    y: isNaN(point.close) ? 0 : point.close // Ensure y is a valid number
  }))
  .filter(point => !isNaN(point.x) && !isNaN(point.y)); // Remove NaN values

const minY = Math.min(...chartData.map(d => d.y).filter(y => !isNaN(y)));
const maxY = Math.max(...chartData.map(d => d.y).filter(y => !isNaN(y)));
  
  const handleTooltipFormat = ({ x, y }) => {
    setpoints_data(y);
    setpoints_data_time(new Date(x).toLocaleTimeString()); // Convert timestamp to readable time
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
    
    url += '&limit=10';
    
    return url;
  }, [selectedPair]);

// Update the fetchRecentTrades function for better performance
const fetchRecentTrades = useCallback(async () => {
  if (!visibleTabs.includes('trades') && !visibleTabs.includes('chart')) {
    return;
  }
  
  try {
    const server = new StellarSdk.Server('https://horizon.stellar.org');
    const baseAsset = getAsset(selectedPair.base);
    const counterAsset = getAsset(selectedPair.counter);

    // Reduce the number of records fetched
    const trades = await server.trades()
      .forAssetPair(baseAsset, counterAsset)
      .order('desc')
      .limit(10)  // Reduced from 20 to 10
      .call();
    
    if (trades.records?.length > 0) {
      const formattedTrades = trades.records.map(trade => ({
        price: parseFloat(trade.price.d) / parseFloat(trade.price.n),
        amount: parseFloat(trade.base_amount),
        timestamp: new Date(trade.ledger_close_time).toLocaleTimeString(),
        date: new Date(trade.ledger_close_time).toLocaleDateString(),
        type: trade.base_is_seller ? 'sell' : 'buy',
        id: trade.id
      }));
      
      setLastTrade(formattedTrades[0]);
      setRecentTrades(formattedTrades);
    }
  } catch (error) {
    console.log('Error fetching trades:', error);
  }
}, [selectedPair, visibleTabs]);

  // Reset and load data when selected pair changes
  useEffect(() => {
    setPriceHistory([{"close": 0.26615, "timestamp": "12:13:00", "volume": 105.3498099}, {"close": 0.2655214, "timestamp": "12:12:00", "volume": 0.162546}, {"close": 0.2660275, "timestamp": "12:11:00", "volume": 13.6603745}, {"close": 0.2659964, "timestamp": "12:10:00", "volume": 0.075171}, {"close": 0.2660395, "timestamp": "12:09:00", "volume": 0.9344969}, {"close": 0.2655214, "timestamp": "12:08:00", "volume": 12.5212161}, {"close": 0.265662, "timestamp": "12:07:00", "volume": 0.4711141}, {"close": 0.2655214, "timestamp": "12:06:00", "volume": 35.5763887}, {"close": 0.2656039, "timestamp": "12:05:00", "volume": 57.5110262}, {"close": 0.265532, "timestamp": "12:04:00", "volume": 264.3881066}, {"close": 0.2657682, "timestamp": "12:03:00", "volume": 0.0756954}, {"close": 0.26615, "timestamp": "12:02:00", "volume": 796.6244152}, {"close": 0.2656, "timestamp": "12:01:00", "volume": 8.4491672}, {"close": 0.2653533, "timestamp": "12:00:00", "volume": 11854.4587687}, {"close": 0.2661392, "timestamp": "11:59:00", "volume": 0.0055433}, {"close": 0.2657277, "timestamp": "11:58:00", "volume": 60.7035676}, {"close": 0.2658869, "timestamp": "11:57:00", "volume": 215.4328488}, {"close": 0.265327, "timestamp": "11:56:00", "volume": 4.5972913}, {"close": 0.2656886, "timestamp": "11:55:00", "volume": 14.4052709}, {"close": 0.2658978, "timestamp": "11:54:00", "volume": 16.1979675}, {"close": 0.2656325, "timestamp": "11:53:00", "volume": 1.4312524}, {"close": 0.2656325, "timestamp": "11:52:00", "volume": 165.2390825}, {"close": 0.2655875, "timestamp": "11:51:00", "volume": 843.9466745}, {"close": 0.2656525, "timestamp": "11:50:00", "volume": 3.9093127}, {"close": 0.265612, "timestamp": "11:49:00", "volume": 537.9988505}, {"close": 0.2658693, "timestamp": "11:48:00", "volume": 591.9173694}, {"close": 0.2659099, "timestamp": "11:47:00", "volume": 182.1820944}, {"close": 0.2658182, "timestamp": "11:46:00", "volume": 0.76869}, {"close": 0.2658102, "timestamp": "11:45:00", "volume": 159.6300807}, {"close": 0.266004, "timestamp": "11:44:00", "volume": 334.4562188}]);
    setRecentTrades([]);
    setLastTrade(null);
    setBids([]);
    setAsks([]);
    setLoading(true);
    
    // Fetch trade aggregation data if chart tab is visible
    if (visibleTabs.includes('chart')) {
      fetchTradeAggregation();
    }
    
    // Disconnect any existing event source before changing pairs
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    // Fetch trades for the new pair if needed
    if (visibleTabs.includes('trades') || visibleTabs.includes('chart')) {
      fetchRecentTrades();
    }
    
    // Connect to event source for the new pair
    setTimeout(() => {
      connectEventSource();
    }, 500);
    
  }, [selectedPair, visibleTabs]);
  
  // Add this function to fetch trade aggregation data
  const fetchTradeAggregation = useCallback(async () => {
    try {
      const server = new StellarSdk.Server('https://horizon.stellar.org');
      const baseAsset = getAsset(selectedPair.base);
      const counterAsset = getAsset(selectedPair.counter);
      
      // Set up time parameters for full day data
      const endTime = new Date();
      const startTime = new Date();
      startTime.setHours(0, 0, 0, 0); // Start from beginning of the day
      
      // 30 minute resolution (1800000 milliseconds)
      const resolution = 1800000;
      // Fetch trade aggregations - increased limit to cover full day (48 for 30-min intervals)
      const tradeAggs = await server.tradeAggregation(
        baseAsset,
        counterAsset,
        1743489836000,
        1743576296000,
        60000,
        0
      ).limit(30).order('desc').call(); // Changed to ascending order for chronological display
      
    
      if (tradeAggs.records && tradeAggs.records.length > 0) {
        const formattedData = tradeAggs.records.map(record => ({
          timestamp: new Date(parseInt(record.timestamp)).toLocaleTimeString(),
          close: parseFloat(record.close),
          volume: parseFloat(record.base_volume)
        }));
        
        setPriceHistory(formattedData);
      } else {
        // If no data is returned, set empty array
    setPriceHistory([{"close": 0.26615, "timestamp": "12:13:00", "volume": 105.3498099}, {"close": 0.2655214, "timestamp": "12:12:00", "volume": 0.162546}, {"close": 0.2660275, "timestamp": "12:11:00", "volume": 13.6603745}, {"close": 0.2659964, "timestamp": "12:10:00", "volume": 0.075171}, {"close": 0.2660395, "timestamp": "12:09:00", "volume": 0.9344969}, {"close": 0.2655214, "timestamp": "12:08:00", "volume": 12.5212161}, {"close": 0.265662, "timestamp": "12:07:00", "volume": 0.4711141}, {"close": 0.2655214, "timestamp": "12:06:00", "volume": 35.5763887}, {"close": 0.2656039, "timestamp": "12:05:00", "volume": 57.5110262}, {"close": 0.265532, "timestamp": "12:04:00", "volume": 264.3881066}, {"close": 0.2657682, "timestamp": "12:03:00", "volume": 0.0756954}, {"close": 0.26615, "timestamp": "12:02:00", "volume": 796.6244152}, {"close": 0.2656, "timestamp": "12:01:00", "volume": 8.4491672}, {"close": 0.2653533, "timestamp": "12:00:00", "volume": 11854.4587687}, {"close": 0.2661392, "timestamp": "11:59:00", "volume": 0.0055433}, {"close": 0.2657277, "timestamp": "11:58:00", "volume": 60.7035676}, {"close": 0.2658869, "timestamp": "11:57:00", "volume": 215.4328488}, {"close": 0.265327, "timestamp": "11:56:00", "volume": 4.5972913}, {"close": 0.2656886, "timestamp": "11:55:00", "volume": 14.4052709}, {"close": 0.2658978, "timestamp": "11:54:00", "volume": 16.1979675}, {"close": 0.2656325, "timestamp": "11:53:00", "volume": 1.4312524}, {"close": 0.2656325, "timestamp": "11:52:00", "volume": 165.2390825}, {"close": 0.2655875, "timestamp": "11:51:00", "volume": 843.9466745}, {"close": 0.2656525, "timestamp": "11:50:00", "volume": 3.9093127}, {"close": 0.265612, "timestamp": "11:49:00", "volume": 537.9988505}, {"close": 0.2658693, "timestamp": "11:48:00", "volume": 591.9173694}, {"close": 0.2659099, "timestamp": "11:47:00", "volume": 182.1820944}, {"close": 0.2658182, "timestamp": "11:46:00", "volume": 0.76869}, {"close": 0.2658102, "timestamp": "11:45:00", "volume": 159.6300807}, {"close": 0.266004, "timestamp": "11:44:00", "volume": 334.4562188}]);

      }
    } catch (error) {
      console.log('Error fetching trade aggregation:', error);
      // Set empty array on error
    setPriceHistory([{"close": 0.26615, "timestamp": "12:13:00", "volume": 105.3498099}, {"close": 0.2655214, "timestamp": "12:12:00", "volume": 0.162546}, {"close": 0.2660275, "timestamp": "12:11:00", "volume": 13.6603745}, {"close": 0.2659964, "timestamp": "12:10:00", "volume": 0.075171}, {"close": 0.2660395, "timestamp": "12:09:00", "volume": 0.9344969}, {"close": 0.2655214, "timestamp": "12:08:00", "volume": 12.5212161}, {"close": 0.265662, "timestamp": "12:07:00", "volume": 0.4711141}, {"close": 0.2655214, "timestamp": "12:06:00", "volume": 35.5763887}, {"close": 0.2656039, "timestamp": "12:05:00", "volume": 57.5110262}, {"close": 0.265532, "timestamp": "12:04:00", "volume": 264.3881066}, {"close": 0.2657682, "timestamp": "12:03:00", "volume": 0.0756954}, {"close": 0.26615, "timestamp": "12:02:00", "volume": 796.6244152}, {"close": 0.2656, "timestamp": "12:01:00", "volume": 8.4491672}, {"close": 0.2653533, "timestamp": "12:00:00", "volume": 11854.4587687}, {"close": 0.2661392, "timestamp": "11:59:00", "volume": 0.0055433}, {"close": 0.2657277, "timestamp": "11:58:00", "volume": 60.7035676}, {"close": 0.2658869, "timestamp": "11:57:00", "volume": 215.4328488}, {"close": 0.265327, "timestamp": "11:56:00", "volume": 4.5972913}, {"close": 0.2656886, "timestamp": "11:55:00", "volume": 14.4052709}, {"close": 0.2658978, "timestamp": "11:54:00", "volume": 16.1979675}, {"close": 0.2656325, "timestamp": "11:53:00", "volume": 1.4312524}, {"close": 0.2656325, "timestamp": "11:52:00", "volume": 165.2390825}, {"close": 0.2655875, "timestamp": "11:51:00", "volume": 843.9466745}, {"close": 0.2656525, "timestamp": "11:50:00", "volume": 3.9093127}, {"close": 0.265612, "timestamp": "11:49:00", "volume": 537.9988505}, {"close": 0.2658693, "timestamp": "11:48:00", "volume": 591.9173694}, {"close": 0.2659099, "timestamp": "11:47:00", "volume": 182.1820944}, {"close": 0.2658182, "timestamp": "11:46:00", "volume": 0.76869}, {"close": 0.2658102, "timestamp": "11:45:00", "volume": 159.6300807}, {"close": 0.266004, "timestamp": "11:44:00", "volume": 334.4562188}]);

    }
  }, [selectedPair, getAsset]);
  console.log("---->",priceHistory)
  // Add a refreshTradeAggregation function to the onRefresh handler
  const onRefresh = () => {
    setRefreshing(true);
    startRotation();
    
    // Close and reconnect to event source
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    // Fetch fresh trade data if needed
    if (visibleTabs.includes('trades') || visibleTabs.includes('chart')) {
      fetchRecentTrades();
    }
    
    // Fetch fresh chart data if needed
    if (visibleTabs.includes('chart')) {
      fetchTradeAggregation();
    }
    
    // Reconnect to event source
    setTimeout(() => {
      connectEventSource();
    }, 1000);
  };


// Performance optimization - update event source handling
const connectEventSource = useCallback(() => {
  // Only connect if we need order book data (bids or asks tabs are visible)
  if (!visibleTabs.includes('bids') && !visibleTabs.includes('asks') && !visibleTabs.includes('chart')) {
    setLoading(false);
    return;
  }
  
  if (isConnectingRef.current) {
    return;
  }
  isConnectingRef.current = true;

  const eventSourceUrl = getEventSourceUrl();
  
  // Close any existing connection
  if (eventSourceRef.current) {
    eventSourceRef.current.close();
    eventSourceRef.current = null;
  }

  // Use a single setTimeout instead of nested ones
  setTimeout(() => {
    if (eventSourceRef.current) return;

    const EventSource = EventSourcePolyfill || NativeEventSource;
    eventSourceRef.current = new EventSource(eventSourceUrl, {
      heartbeatTimeout: 35000,
    });

    eventSourceRef.current.onopen = () => {
      isConnectingRef.current = false;
    };

    eventSourceRef.current.onmessage = (event) => {
      try {
        const tradeData = JSON.parse(event.data);
        
        // Use functional updates to avoid stale state
        setBids(prevBids => tradeData.bids || prevBids);
        setAsks(prevAsks => tradeData.asks || prevAsks);
        
        // Only update chart data if needed
        if (visibleTabs.includes('chart') && 
            tradeData.bids?.length > 0 && 
            tradeData.asks?.length > 0) {
          
          const newDataPoint = {
            timestamp: new Date().toLocaleTimeString(),
            askPrice: parseFloat(tradeData.asks[0].price),
            bidPrice: parseFloat(tradeData.bids[0].price),
          };
          
          // setPriceHistory(prev => [...prev, newDataPoint].slice(-10));
        }
        
        setLoading(false);
        setRefreshing(false);
      } catch (error) {
        console.log('Failed to parse order book data:', error);
      }
    };

    eventSourceRef.current.onerror = () => {
      isConnectingRef.current = false;

      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      // Use ref to prevent memory leaks
      if (!reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          connectEventSource();
          reconnectTimeoutRef.current = null;
        }, 1000);
      }
    };
  }, 500); // Reduced delay
}, [getEventSourceUrl, visibleTabs]);

  useFocusEffect(
    useCallback(() => {
      connectEventSource();
      
      // Fetch initial trade data if needed
      if (visibleTabs.includes('trades') || visibleTabs.includes('chart')) {
        fetchRecentTrades();
      }

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
    }, [connectEventSource, fetchRecentTrades, visibleTabs])
  );



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
      <Chart
      style={{ width: width - 40, height: 220 }}
      data={chartData}
      padding={{ left: 10, bottom: 30, right: 20, top: 30 }}
      xDomain={{
        min: Math.min(...chartData.map(d => d.x)),
        max: Math.max(...chartData.map(d => d.x))
      }}
      yDomain={{
        min: minY - (0.1 * (maxY - minY)), // 10% padding
        max: maxY + (0.1 * (maxY - minY))
      }}
    >
      <Line
      tooltipComponent={
        <Tooltip 
          theme={{
            formatter: handleTooltipFormat,
            shape: {
              width: 0, // Adjust tooltip size for visibility
              height: 0,
              dx: 5,
              dy: -10,
              color: 'black',
            }
          }} 
        />
      }
  
        theme={{
          stroke: { color: '#44bd32', width: 2 },
          scatter: { selected: { width: 10, height: 11, rx: 5, color: '#2F7DFF' } }
        }}
        smoothing="bezier"
      />
    </Chart>
            ) : (
              <View style={styles.noChartContainer}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.noChartText}>Collecting chart data for {selectedPair.displayName}...</Text>
              </View>
            )}

            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
              <Text style={[styles.legendText,{fontSize:20}]}>$ {points_data}</Text>
                <Text style={styles.legendText}>{points_data_time}</Text>
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
          case 'asks':
            return (
              <View style={styles.ordersContainer}>
                {/* Asks section - reversed to show highest ask at bottom */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.headerText, { flex: 2 }]}>Price ({selectedPair.counter.code})</Text>
                  <Text style={[styles.headerText, { flex: 2 }]}>Amount ({selectedPair.base.code})</Text>
                  <Text style={[styles.headerText, { flex: 1 }]}>Total</Text>
                </View>
                
                {asks.length > 0 ? (
                  [...asks].reverse().map((ask, index) => {
                    const amount = parseFloat(ask.amount);
                    const price = parseFloat(ask.price);
                    const total = (amount * price).toFixed(7);
                    const depth = (index / asks.length) * 100;
                    
                    return (
                      <View key={`ask-${index}`} style={styles.orderRow}>
                        <LinearGradient
                          colors={['rgba(255, 59, 59, 0.15)', 'rgba(255, 59, 59, 0)']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[styles.depthIndicator, { width: `${depth}%` }]}
                        />
                        <Text style={[styles.priceText, styles.askText]}>
                          {selectedPair.counter.code === 'USDC' ? '$' : ''}{price.toFixed(7)}
                        </Text>
                        <Text style={styles.amountText}>{amount.toFixed(7)}</Text>
                        <Text numberOfLines={1} style={styles.totalText}>{total}</Text>
                      </View>
                    );
                  })
                ) : (
                  <View style={styles.noOrdersContainer}>
                    <Text style={styles.noOrdersText}>No asks found</Text>
                  </View>
                )}
                
                {/* Spread indicator */}
                <View style={styles.spreadContainer}>
                  <Text style={styles.spreadLabel}>Spread:</Text>
                  <Text style={styles.spreadValue}>
                    {asks.length > 0 && bids.length > 0 ? 
                      `${(parseFloat(asks[0].price) - parseFloat(bids[0].price)).toFixed(7)} (${
                        ((parseFloat(asks[0].price) - parseFloat(bids[0].price)) / parseFloat(asks[0].price) * 100).toFixed(2)
                      }%)` : 
                      '...'}
                  </Text>
                </View>
                
                {/* Bids section */}
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
                      <View key={`bid-${index}`} style={styles.orderRow}>
                        <LinearGradient
                          colors={['rgba(76, 217, 100, 0.15)', 'rgba(76, 217, 100, 0)']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[styles.depthIndicator, { width: `${depth}%` }]}
                        />
                        <Text style={[styles.priceText, styles.bidText]}>
                          {selectedPair.counter.code === 'USDC' ? '$' : ''}{price.toFixed(7)}
                        </Text>
                        <Text style={styles.amountText}>{amount.toFixed(7)}</Text>
                        <Text numberOfLines={1} style={styles.totalText}>{total}</Text>
                      </View>
                    );
                  })
                ) : (
                  <View style={styles.noOrdersContainer}>
                    <Text style={styles.noOrdersText}>No bids found</Text>
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
              `${selectedPair.counter.code === 'USDC' ? '$' : '$'}${parseFloat(asks[0].price).toFixed(6)}` : 
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
      
      {/* {availableTabs.length > 0 && (
        <View style={styles.tabContainer}>
          {availableTabs.map((tab) => (
            <TouchableOpacity 
              key={tab.id}
              style={[
                styles.tab, 
                activeTab === tab.id && styles.activeTab,
                { flex: 1 / availableTabs.length }
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>

              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )} */}
      
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
    flexDirection: "column",
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
    fontSize: 14,
    fontWeight:"800"
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
    width:"100%",
    height:"100%",
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
  },
  orderBookTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 15,
  },
  spreadContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#2E2E3A',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    marginVertical: 10,
  },
  spreadLabel: {
    color: '#8A8A8F',
    fontSize: 14,
    marginRight: 5,
  },
  spreadValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  noOrdersContainer: {
    padding: 15,
    alignItems: 'center',
  },
  noOrdersText: {
    color: '#8A8A8F',
    fontSize: 14,
  }
});
export default CustomOrderBook;
