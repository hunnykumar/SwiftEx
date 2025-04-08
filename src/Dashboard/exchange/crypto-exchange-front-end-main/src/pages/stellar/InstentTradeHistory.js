import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Modal,
  RefreshControl,
  Alert
} from 'react-native';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';

// API Functions
function getCanonicalAsset(code, issuer) {
  return code === 'XLM' ? 'native' : `${code}:${issuer}`;
}

function toIST(utcTime) {
  if (!utcTime) return "";
  
  try {
    const date = new Date(utcTime);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return {
      res:`${day}/${month}/${year}`,
      res1:`${hours}:${minutes}:${seconds}`
    };
  } catch (error) {
    return "Error formatting date";
  }
}

async function getLiquidityPoolTradeHistory(codeA, issuerA, codeB, issuerB) {
  try {
    const assetA = getCanonicalAsset(codeA, issuerA);
    const assetB = getCanonicalAsset(codeB, issuerB);
    const [res1, res2] = [assetA, assetB].sort();

    // 1. Get Liquidity Pool ID
    const lpUrl = `https://horizon.stellar.org/liquidity_pools?reserves=${res1},${res2}`;
    const { data: lpData } = await axios.get(lpUrl);
    const pool = lpData._embedded.records[0];

    if (!pool) {
      console.error('❌ Liquidity pool not found.');
      return;
    }

    const poolId = pool.id;

    // 2. Get liquidity_pool_trade effects
    const tradesUrl = `https://horizon.stellar.org/liquidity_pools/${poolId}/effects?limit=60&order=desc`;
    const { data: tradeData } = await axios.get(tradesUrl);
    const trades = tradeData._embedded.records
    .filter(trade => trade.type === 'liquidity_pool_trade')
    .map(trade => {
        const soldAsset = trade.sold.asset === 'native' ? 'XLM' : trade.sold.asset.split(':')[0];
        const boughtAsset = trade.bought.asset === 'native' ? 'XLM' : trade.bought.asset.split(':')[0];

        const soldAmount = parseFloat(trade.sold.amount).toFixed(3)

        const boughtAmount = parseFloat(trade.bought.amount).toFixed(3)

        const accountShort = trade.account.slice(0, 4) + '...' + trade.account.slice(-4);
        const timestamp = toIST(trade.created_at);

        return {
          soldAmount: `${soldAmount}`,
          boughtAmount: `${boughtAmount}`,
          account: accountShort,
          date: timestamp?.res,
          time: timestamp?.res1
        };
      });
    return trades;

  } catch (error) {
    console.error('❌ Error fetching trades:', error.response?.data || error.message);
  }
}

// Components
const Header = ({ title, onSelectPair }) => (
    <TouchableOpacity style={styles.header} onPress={onSelectPair}>
      <Text style={styles.headerTitle}>{title} </Text>
       <Ionicons name="chevron-down" size={25} color="#8A8A8F" />
    </TouchableOpacity>
);

const TableHeader = () => (
  <View style={styles.tableHeader}>
    <Text style={styles.tableHeaderCell}>Sold</Text>
    <Text style={styles.tableHeaderCell}>Bought</Text>
    <Text style={styles.tableHeaderCell}>Account</Text>
    <Text style={styles.tableHeaderCell}>Time</Text>
  </View>
);

const TradeRow = ({ item }) => (
  <View style={styles.tableRow}>
    <Text style={[styles.tableCell,{flex:0.3}]}>{item.soldAmount}</Text>
    <Text style={[styles.tableCell,{flex:0.3}]}>{item.boughtAmount}</Text>
    <Text style={[styles.tableCell,{flex:0.5}]}>{item.account}</Text>
    <View>
    <Text style={[styles.tableCell,{flex:0.3}]}>{item.time}</Text>
    <Text style={[styles.tableCell,{ fontSize:12,flex:0.3 }]}>{item.date}</Text>
    </View>
  </View>
);

const EmptyState = () => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyStateText}>No trades found for this pair</Text>
  </View>
);

const PairSelectionModal = ({ visible, onClose, onSelectPair, currentPair }) => {
  // Predefined pairs - could be expanded
  const availablePairs = [
    { assetA: { code: 'USDC', issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN' }, assetB: { code: 'BTC', issuer: 'GDPJALI4AZKUU2W426U5WKMAT6CN3AJRPIIRYR2YM54TL2GDWO5O2MZM' } },
    { assetA: { code: 'XLM', issuer: '' }, assetB: { code: 'USDC', issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN' } },
    { assetA: { code: 'XLM', issuer: '' }, assetB: { code: 'yXLM', issuer: 'GARDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55' } },
    { assetA: { code: 'XLM', issuer: '' }, assetB: { code: 'AQUA', issuer: 'GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA' } },
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Pair</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={availablePairs}
            keyExtractor={(item, index) => `pair-${index}`}
            renderItem={({ item }) => {
              const pairName = `${item.assetA.code}/${item.assetB.code}`;
              const isSelected = currentPair && 
                currentPair.assetA.code === item.assetA.code && 
                currentPair.assetB.code === item.assetB.code;
              
              return (
                <TouchableOpacity 
                  style={[styles.pairItem, isSelected && styles.selectedPair]} 
                  onPress={() => {
                    onSelectPair(item);
                    onClose();
                  }}
                >
                  <Text style={[styles.pairItemText, isSelected && styles.selectedPairText]}>
                    {pairName}
                  </Text>
                  {isSelected && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

// Main App Component
const InstentTradeHistory = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Default pair
  const [currentPair, setCurrentPair] = useState({
    assetA: { code: 'USDC', issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN' }, assetB: { code: 'BTC', issuer: 'GDPJALI4AZKUU2W426U5WKMAT6CN3AJRPIIRYR2YM54TL2GDWO5O2MZM' }
  });
  
  const fetchData = async () => {
    try {
      setError(null);
      const resTrades = await getLiquidityPoolTradeHistory(
        currentPair.assetA.code, currentPair.assetA.issuer,
        currentPair.assetB.code, currentPair.assetB.issuer
      );
      setTrades(resTrades);
    } catch (err) {
      setError(err.message);
      Alert.alert(
        'Error',
        `Failed to fetch trade data: ${err.message}`,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };
  
  useEffect(() => {
    fetchData();
  }, [currentPair]);
  
  const handleSelectPair = (pair) => {
    setCurrentPair(pair);
    setLoading(true);
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3873F0" />
        <Text style={styles.loadingText}>Loading Transaction history...</Text>
      </View>
    );
  }
  
  const pairName = `${currentPair.assetA.code}/${currentPair.assetB.code}`;
  
  return (
    <View style={styles.container}>
      <Header 
        title={`${pairName}`} 
        onSelectPair={() => setModalVisible(true)} 
      />
      
      <TableHeader />
      
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={trades}
          renderItem={({ item }) => <TradeRow item={item} />}
          keyExtractor={(item,index) => {index}}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<EmptyState />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#3873F0']}
            />
          }
        />
      )}
      
      <PairSelectionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelectPair={handleSelectPair}
        currentPair={currentPair}
      />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#011434',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#011434',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#555',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "flex-start",
    paddingHorizontal: "6%",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEDF0',
    backgroundColor: '#011434',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 1,
    paddingVertical: 12,
    backgroundColor: '#011434',
    borderBottomWidth: 1,
    borderBottomColor: '#D1D9E6',
    justifyContent:"space-around"
  },
  tableHeaderCell: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5A6277',
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEDF0',
    backgroundColor: '#011434',
    justifyContent:'space-between',
    alignItems:"center"
  },
  tableCell: {
    fontSize: 14,
    color: '#fff',
    textAlign:"center",
  },
  listContent: {
    flexGrow: 1,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#E74C3C',
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#3873F0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#13131A',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    fontSize: 20,
    color: '#999',
    padding: 4,
  },
  pairItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  selectedPair: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  pairItemText: {
    fontSize: 16,
    color: '#fff',
  },
  selectedPairText: {
    fontWeight: '600',
    color: '#3873F0',
  },
  checkmark: {
    color: '#3873F0',
    fontSize: 18,
    fontWeight: 'bold',
  }
});

export default InstentTradeHistory;