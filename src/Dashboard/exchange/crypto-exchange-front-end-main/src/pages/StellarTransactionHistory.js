import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import StellarSdk from 'stellar-sdk';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { STELLAR_URL } from '../../../../constants';

const server = new StellarSdk.Server(STELLAR_URL.URL);

const getThemeColors = (isDarkMode) => ({
  background: isDarkMode ? '#011434' : '#F5F5F5',
  cardBackground: isDarkMode ? '#1E1E1E' : '#FFFFFF',
  primaryText: isDarkMode ? '#FFFFFF' : '#333333',
  secondaryText: isDarkMode ? '#B0B0B0' : '#666666',
  tabBarBackground: isDarkMode ? '#011434' : '#FFFFFF',
  iconBackground: isDarkMode ? '#2D2D2D' : '#F5F5F5',
  divider: isDarkMode ? '#2D2D2D' : '#E0E0E0',
  shadow: isDarkMode ? '#000000' : '#000000',
  accent: '#2196F3',
  success: '#4CAF50',
  error: '#F44336',
  sent: '#FF5722',
  received: '#4CAF50',
});

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}-${month}-${year} ${hours}:${minutes}`;
}

const getTransactionType = (operation) => {
  switch (operation.type) {
    case 'payment':
      return 'Payment';
    case 'createAccount':
      return 'Account Created';
    case 'changeTrust':
      return 'Trust Line';
    case 'manage_sell_offer':
      return `Sell offer`;
    case 'manage_buy_offer':
      return `Buy offer`;
    case 'change_trust':
      return `Change trust`;
    case 'create_account':
      return `Create account`;
    case 'pathPaymentStrictSend':
      return `Path Payment (Send ${operation.source_asset_code || 'XLM'})`;
    case 'setOptions':
      return 'Settings Update';
    default:
      return operation.type.replace(/([A-Z])/g, ' $1').trim();
  }
};


const getTransactionIcon = (type) => {
  switch (type) {
    case 'payment':
      return 'cash-multiple';
    case 'createAccount':
      return 'account-plus';
    case 'changeTrust':
      return 'shield-check';
    case 'manageSellOffer':
      return 'trending-down';
    case 'manageBuyOffer':
      return 'trending-up';
    case 'pathPaymentStrictSend':
      return 'routes';
    case 'setOptions':
      return 'cog';
    default:
      return 'bank-transfer';
  }
};

const TabBar = ({ selectedTab, onTabPress, isDarkMode }) => {
  const colors = getThemeColors(isDarkMode);
  const tabs = [
    { key: 'all', title: 'All', icon: 'bank-transfer' },
    { key: 'sent', title: 'Sent', icon: 'arrow-top-right' },
    { key: 'received', title: 'Received', icon: 'arrow-bottom-left' },
  ];

  return (
    <View style={[styles.tabBar, { backgroundColor: colors.tabBarBackground }]}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tab,
            selectedTab === tab.key && styles.selectedTab,
            selectedTab === tab.key && { borderBottomColor: colors.accent }
          ]}
          onPress={() => onTabPress(tab.key)}
        >
          <Icon
            name={tab.icon}
            size={24}
            color={selectedTab === tab.key ? colors.accent : colors.secondaryText}
          />
          <Text
            style={[
              styles.tabText,
              { color: colors.secondaryText },
              selectedTab === tab.key && { color: colors.accent }
            ]}
          >
            {tab.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const TransactionCard = ({ item, userPublicKey, isDarkMode }) => {
  const colors = getThemeColors(isDarkMode);
  const operation = item.operations.records[0];
  const isReceived = operation?.to === userPublicKey;
  const transactionType = getTransactionType(operation);
  
  let iconName = getTransactionIcon(operation.type);
  let amountText = item.amount;

  if (operation.type === 'manageSellOffer') {
    amountText = `${operation.amount} ${operation.selling.asset_code || 'XLM'}`;
  } else if (operation.type === 'manageBuyOffer') {
    amountText = `${operation.amount} ${operation.buying.asset_code || 'XLM'}`;
  }
  
  return (
    <TouchableOpacity 
      style={[
        styles.transactionCard,
        { 
          backgroundColor: colors.cardBackground,
          shadowColor: colors.shadow,
        }
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.iconBackground }]}>
        <Icon
          name={iconName}
          size={24}
          color={isReceived ? colors.received : colors.sent}
          style={[styles.directionIcon, { backgroundColor: colors.cardBackground }]}
        />
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.transactionHeader}>
          <Text style={[styles.date, { color: colors.secondaryText }]}>
            {item.date}
          </Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: item.success ? colors.success : colors.error }
          ]}>
            <Text style={styles.statusText}>
              {item.success ? 'Success' : 'Failed'}
            </Text>
          </View>
        </View>
        
        <View style={styles.transactionDetails}>
          <Text style={[styles.type, { color: colors.primaryText }]}>
            {transactionType}
          </Text>
          {(operation.type === 'manageSellOffer' || operation.type === 'manageBuyOffer') && (
            <Text style={[styles.memo, { color: colors.secondaryText }]}>
              Trade Pair: {operation.selling.asset_code || 'XLM'} / {operation.buying.asset_code || 'XLM'}
            </Text>
          )}

          <Text style={[
            styles.amount,
            { color: isReceived ? colors.received : colors.sent }
          ]}>
            {isReceived ? '+' : '-'}{amountText}
          </Text>
        </View>
        
        {(operation.type === 'manageSellOffer' || operation.type === 'manageBuyOffer') && (
          <Text style={[styles.exchangeRate, { color: colors.secondaryText }]}>
            Rate: 1 {operation.selling.asset_code || 'XLM'} = {
              (parseFloat(operation.price) || 0).toFixed(7)
            } {operation.buying.asset_code || 'XLM'}
          </Text>
        )}
        
        {item.memo && item.memo !== 'No memo' && (
          <Text style={[styles.memo, { color: colors.secondaryText }]} numberOfLines={1}>
            Memo: {item.memo}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const StellarTransactionHistory = ({ publicKey, isDarkMode }) => {
  const colors = getThemeColors(isDarkMode);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');

  const fetchTransactions = async () => {
    try {
      const transactionsData = await server
      .transactions()
      .forAccount(publicKey)
      .order('desc')
      .limit(200)
      .call();
      
      const processedTransactions = await Promise.all(
        transactionsData.records.map(async (tx) => {
          const operations = await tx.operations();
          const firstOp = operations.records[0];
          let amount = '0';
          
          if (firstOp.type === 'payment') {
            amount = firstOp.amount;
          } else if (firstOp.type === 'createAccount') {
            amount = firstOp.startingBalance;
          } else if (firstOp.type === 'manageSellOffer' || firstOp.type === 'manageBuyOffer') {
            amount = firstOp.amount;
          }

          return {
            id: tx.id,
            date: formatDate(tx.created_at),
            amount: amount,
            success: tx.successful,
            memo: tx.memo || 'No memo',
            operations: operations,
          };
        })
      );

      setTransactions(processedTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [publicKey]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }
  return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
          <TabBar
              selectedTab={selectedTab}
              onTabPress={setSelectedTab}
              isDarkMode={isDarkMode}
          />

          <FlatList
              data={transactions.filter(tx => {
                  if (selectedTab === 'all') return true;
                  const isReceived = tx.operations.records[0]?.to === publicKey;
                  return selectedTab === 'received' ? isReceived : !isReceived;
              })}
              renderItem={({ item }) => (
                  <TransactionCard
                      item={item}
                      userPublicKey={publicKey}
                      isDarkMode={isDarkMode}
                  />
              )}
              keyExtractor={item => item.id}
              refreshControl={
                  <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                      tintColor={colors.accent}
                  />
              }
              contentContainerStyle={[
                  styles.listContent,
                  transactions.length === 0 && { flex: 1, justifyContent: 'center', alignItems: 'center' }
              ]}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                      <Icon name="history" size={60} color={"#fff"} />
                      <Text style={styles.emptyText}>No transactions found</Text>
                      <Text style={styles.emptySubText}>Your transactions will appear here.</Text>
                  </View>
              }
          />

      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  selectedTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
  },
  transactionCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  iconContainer: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    padding: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  type: {
    fontSize: 16,
    fontWeight: '500',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  memo: {
    fontSize: 14,
  },
  directionIcon: {
    padding: 8,
    borderRadius: 20,
  },
  exchangeRate: {
    fontSize: 12,
    marginBottom: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    color:"#fff"
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginHorizontal: 20,
    color:"#fff"
  },
});

export default StellarTransactionHistory;