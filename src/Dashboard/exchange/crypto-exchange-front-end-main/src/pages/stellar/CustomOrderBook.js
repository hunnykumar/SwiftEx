import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Modal
} from 'react-native';
// import { Feather } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

const CustomOrderBook = () => {
  // Order book state
  const [selectedPair, setSelectedPair] = useState('BTC-USD');
  const [isModalVisible, setModalVisible] = useState(false);
  const assetPairs = ['BTC-USD', 'ETH-USD', 'XRP-USD', 'SOL-USD'];
  const [orderBook, setOrderBook] = useState({
    asks: [
      { id: 'a1', price: 3327.00, size: 50.0000, total: 300.0000, flash: null },
      { id: 'a2', price: 3326.00, size: 50.0000, total: 250.0000, flash: null },
      { id: 'a3', price: 3325.00, size: 50.0000, total: 200.0000, flash: null },
      { id: 'a4', price: 3324.00, size: 50.0000, total: 150.0000, flash: null },
      { id: 'a5', price: 3323.00, size: 50.0000, total: 100.0000, flash: null },
      { id: 'a6', price: 3322.01, size: 50.0000, total: 50.0000, flash: null },
    ],
    bids: [
      { id: 'b1', price: 3320.00, size: 50.0000, total: 50.0000, flash: null },
      { id: 'b2', price: 3319.00, size: 50.0000, total: 100.0000, flash: null },
      { id: 'b3', price: 3318.00, size: 50.0000, total: 150.0000, flash: null },
      { id: 'b4', price: 3317.00, size: 50.0000, total: 200.0000, flash: null },
      { id: 'b5', price: 3316.00, size: 50.0000, total: 250.0000, flash: null },
      { id: 'b6', price: 3315.00, size: 50.0000, total: 300.0000, flash: null },
    ],
    spread: 2.01,
    spreadPercentage: 0.06
  });

  const [precision, setPrecision] = useState(2);
  const [grouping, setGrouping] = useState(1);
  const maxTotal = Math.max(
    orderBook.asks[orderBook.asks.length - 1].total,
    orderBook.bids[orderBook.bids.length - 1].total
  );

  // Animation references
  const flashAnimations = useRef({
    asks: orderBook.asks.map(() => new Animated.Value(0)),
    bids: orderBook.bids.map(() => new Animated.Value(0)),
  }).current;

  // Simulate order book updates
  useEffect(() => {
    const interval = setInterval(() => {
      updateOrderBook();
    }, 750);

    return () => clearInterval(interval);
  }, []);

  // Update order book with simulated data
  const updateOrderBook = () => {
    setOrderBook(prevBook => {
      const newBook = { ...prevBook };

      // Randomly decide what to update
      const randomIndex = Math.floor(Math.random() * 6);
      const isAsk = Math.random() > 0.5;
      const sizeChange = (Math.random() > 0.7) ?
        Math.floor(Math.random() * 10) + 1 :
        -Math.floor(Math.random() * 5);

      if (isAsk) {
        const newAsks = [...newBook.asks];
        const newSize = Math.max(10, newAsks[randomIndex].size + sizeChange);
        newAsks[randomIndex] = {
          ...newAsks[randomIndex],
          size: newSize,
          flash: sizeChange > 0 ? 'up' : 'down'
        };

        // Recalculate totals
        let runningTotal = 0;
        for (let i = newAsks.length - 1; i >= 0; i--) {
          runningTotal += newAsks[i].size;
          newAsks[i].total = runningTotal;
        }

        // Trigger animation
        if (sizeChange !== 0) {
          Animated.sequence([
            Animated.timing(flashAnimations.asks[randomIndex], {
              toValue: 1,
              duration: 150,
              useNativeDriver: false,
            }),
            Animated.timing(flashAnimations.asks[randomIndex], {
              toValue: 0,
              duration: 150,
              useNativeDriver: false,
            }),
          ]).start();
        }

        newBook.asks = newAsks;
      } else {
        const newBids = [...newBook.bids];
        const newSize = Math.max(10, newBids[randomIndex].size + sizeChange);
        newBids[randomIndex] = {
          ...newBids[randomIndex],
          size: newSize,
          flash: sizeChange > 0 ? 'up' : 'down'
        };

        // Recalculate totals
        let runningTotal = 0;
        for (let i = 0; i < newBids.length; i++) {
          runningTotal += newBids[i].size;
          newBids[i].total = runningTotal;
        }

        // Trigger animation
        if (sizeChange !== 0) {
          Animated.sequence([
            Animated.timing(flashAnimations.bids[randomIndex], {
              toValue: 1,
              duration: 150,
              useNativeDriver: false,
            }),
            Animated.timing(flashAnimations.bids[randomIndex], {
              toValue: 0,
              duration: 150,
              useNativeDriver: false,
            }),
          ]).start();
        }

        newBook.bids = newBids;
      }

      // Update spread
      newBook.spread = (newBook.asks[newBook.asks.length - 1].price - newBook.bids[0].price).toFixed(2);
      newBook.spreadPercentage = ((newBook.spread / newBook.asks[newBook.asks.length - 1].price) * 100).toFixed(3);

      return newBook;
    });
  };

  // Render an ask (sell) row
  const renderAskItem = ({ item, index }) => {
    const flashBackgroundColor = flashAnimations.asks[index].interpolate({
      inputRange: [0, 1],
      outputRange: ['rgba(0, 0, 0, 0)', 'rgba(236, 64, 122, 0.15)'],
    });

    return (
      <Animated.View style={[styles.rowContainer, { backgroundColor: flashBackgroundColor }]}>

        <View
          style={[
            styles.depthVisualization,
            styles.askDepth,
            { width: `${(item.total / maxTotal) * 100}%` }
          ]}
        />


        <View style={styles.rowContent}>
          <Text style={styles.volumeText}>{item.size.toFixed(4)}</Text>
          <Text style={styles.totalText}>{item.total.toFixed(0)}</Text>
          <Text style={styles.askPriceText}>{item.price.toFixed(precision)}</Text>
        </View>
      </Animated.View>
    );
  };

  // Render a bid (buy) row
  const renderBidItem = ({ item, index }) => {
    const flashBackgroundColor = flashAnimations.bids[index].interpolate({
      inputRange: [0, 1],
      outputRange: ['rgba(0, 0, 0, 0)', 'rgba(38, 198, 218, 0.15)'],
    });

    return (
      <Animated.View style={[styles.rowContainer, { backgroundColor: flashBackgroundColor }]}>

        <View
          style={[
            styles.depthVisualization,
            styles.bidDepth,
            { width: `${(item.total / maxTotal) * 100}%` }
          ]}
        />


        <View style={styles.rowContent}>
          <Text style={styles.bidPriceText}>{item.price.toFixed(precision)}</Text>
          <Text style={styles.volumeText}>{item.size.toFixed(4)}</Text>
          <Text style={styles.totalText}>{item.total.toFixed(0)}</Text>
        </View>
      </Animated.View>
    );
  };
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };
  // Render header for the order book
  const OrderBookHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.headerSection} onPress={() => { toggleModal() }}>
          <Text style={styles.headerTitle}>{selectedPair}</Text>
          <View style={styles.priceIndicator}>

            <Text style={styles.priceChangeText}>+2.41%</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.precisionControls}>
          <TouchableOpacity
            style={[styles.precisionButton, precision === 2 && styles.activeButton]}
            onPress={() => setPrecision(2)}
          >
            <Text style={[styles.precisionButtonText, precision === 2 && styles.activeButtonText]}>0.01</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.precisionButton, precision === 1 && styles.activeButton]}
            onPress={() => setPrecision(1)}
          >
            <Text style={[styles.precisionButtonText, precision === 1 && styles.activeButtonText]}>0.1</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.precisionButton, precision === 0 && styles.activeButton]}
            onPress={() => setPrecision(0)}
          >
            <Text style={[styles.precisionButtonText, precision === 0 && styles.activeButtonText]}>1</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tableHeader}>

        <View style={styles.askHeaderRow}>
          <Text style={styles.columnHeaderText}>AMOUNT</Text>
          <Text style={styles.columnHeaderText}>TOTAL</Text>
          <Text style={styles.columnHeaderText}>PRICE</Text>
        </View>
      </View>
    </View>
  );

  // Render spread info
  const SpreadInfo = () => (
    <View style={styles.spreadContainer}>
      <View style={styles.spreadInfo}>
        <Text style={styles.spreadLabel}>Spread</Text>
        <Text style={styles.spreadValue}>{orderBook.spread}</Text>
        <Text style={styles.spreadPercentage}>({orderBook.spreadPercentage}%)</Text>
      </View>

      <View style={styles.tableHeader}>

        <View style={styles.bidHeaderRow}>
          <Text style={styles.columnHeaderText}>PRICE</Text>
          <Text style={styles.columnHeaderText}>AMOUNT</Text>
          <Text style={styles.columnHeaderText}>TOTAL</Text>
        </View>
      </View>
    </View>
  );

  // Trading controls
  const TradingControls = () => (
    <View style={styles.tradingControlsContainer}>
      <TouchableOpacity style={styles.buyButton}>
        <Text style={styles.actionButtonText}>BUY</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.sellButton}>
        <Text style={styles.actionButtonText}>SELL</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView>
      <OrderBookHeader />
      <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={toggleModal}
        >
          <View style={styles.bottomSheetContainer}>
            <View style={styles.bottomSheetContent}>
              {assetPairs.map((pair) => (
                <TouchableOpacity key={pair} onPress={() => { setSelectedPair(pair); toggleModal(); }}>
                  <Text style={styles.modalItem}>{pair}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>

      <FlatList
        data={orderBook.asks}
        renderItem={renderAskItem}
        keyExtractor={item => item.id}
        scrollEnabled={false}
        inverted
        contentContainerStyle={styles.listContent}
      />

      <SpreadInfo />


      <FlatList
        data={orderBook.bids}
        renderItem={renderBidItem}
        keyExtractor={item => item.id}
        scrollEnabled={false}
        contentContainerStyle={styles.listContent}
      />

      {/* <TradingControls /> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    backgroundColor: '#011434"',
  },
  headerContainer: {
    paddingTop: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 12,
  },
  priceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(38, 198, 218, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priceChangeText: {
    color: '#26C6DA',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  precisionControls: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    borderRadius: 4,
    overflow: 'hidden',
  },
  precisionButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  activeButton: {
    backgroundColor: '#333333',
  },
  precisionButtonText: {
    color: '#A0A0A0',
    fontSize: 11,
    fontWeight: '500',
  },
  activeButtonText: {
    color: '#FFFFFF',
  },
  tableHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1A1A1A',
  },
  askHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bidHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  }, columnHeaderText: {
    color: '#888888',
    fontSize: 10,
    fontWeight: '500',
  },
  listContent: {
    flexGrow: 0,
  },
  rowContainer: {
    height: 32,
    width: '100%',
    position: 'relative',
  },
  rowContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: '100%',
    position: 'relative',
    zIndex: 2,
  },
  depthVisualization: {
    position: 'absolute',
    height: '100%',
    zIndex: 1,
  },
  askDepth: {
    right: 0,
    backgroundColor: 'rgba(190, 6, 30, 0.3)',
  },
  bidDepth: {
    left: 0,
    backgroundColor: 'rgba(20, 202, 84, 0.1)',
  },
  volumeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  totalText: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '400',
    flex: 1,
    textAlign: 'center',
  },
  askPriceText: {
    color: '#EC407A',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  bidPriceText: {
    color: '#26C6DA',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    textAlign: 'left',
  },
  spreadContainer: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#2A2A2A',
  },
  spreadInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#1A1A1A',
  },
  spreadLabel: {
    color: '#888888',
    fontSize: 12,
    marginRight: 8,
  },
  spreadValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  spreadPercentage: {
    color: '#888888',
    fontSize: 12,
    marginLeft: 4,
  },
  tradingControlsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#1A1A1A',
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  buyButton: {
    flex: 1,
    backgroundColor: '#26C6DA',
    borderRadius: 4,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  sellButton: {
    flex: 1,
    backgroundColor: '#EC407A',
    borderRadius: 4,
    paddingVertical: 12,
    marginLeft: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  bottomSheetContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  bottomSheetContent: { backgroundColor: '#1E1E1E', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalItem: { color: '#FFFFFF', fontSize: 16, paddingVertical: 10, textAlign: 'center' }
});

export default CustomOrderBook;