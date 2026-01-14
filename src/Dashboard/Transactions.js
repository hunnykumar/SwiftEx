import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Appearance,
  RefreshControl,
  Modal,
  Image,
  Animated,
  Clipboard,
  Alert,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { Wallet_screen_header, TransactionForStellar } from './reusables/ExchangeHeader';
import { useIsFocused, useNavigation, useRoute, useNavigationState } from '@react-navigation/native';
import StellarTransactionHistory from './exchange/crypto-exchange-front-end-main/src/pages/StellarTransactionHistory';
import { PGET, proxyRequest } from './exchange/crypto-exchange-front-end-main/src/api';
import CustomInfoProvider from './exchange/crypto-exchange-front-end-main/src/components/CustomInfoProvider';
import ShortTermStorage from '../utilities/ShortTermStorage';

const ThemeContext = React.createContext();

const themes = {
  light: {
    background: "#FFFFFF",
    cardBackground: "#F4F4F8",
    textPrimary: '#1A1A1A',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    accent: '#3B82F6',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    pending: '#F59E0B',
    border: '#E5E7EB',
    chipBg: '#F3F4F6',
    chipActive: '#3B82F6',
    skeleton: '#E5E7EB',
    divider: '#F3F4F6',
  },
  dark: {
    background: "#1B1B1C",
    cardBackground: "#242426",
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
    textTertiary: '#64748B',
    accent: '#3B82F6',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    pending: '#F59E0B',
    border: '#334155',
    chipBg: '#334155',
    chipActive: '#3B82F6',
    skeleton: '#334155',
    divider: '#1E293B',
  }
};

const ThemeProvider = ({ children }) => {
  const state = useSelector((state) => state);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    setTheme(state.THEME.THEME === true ? 'dark' : 'light');
  }, [state.THEME.THEME]);

  return (
    <ThemeContext.Provider value={{ theme, colors: themes[theme] }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => useContext(ThemeContext);

// Utility Functions
const formatNumber = (num) => {
  if (num === 0) return "0";
  if (Math.abs(num) < 0.0001) return num.toExponential(2);
  if (Math.abs(num) > 1000000) return (num / 1000000).toFixed(2) + 'M';
  return num.toLocaleString(undefined, { maximumFractionDigits: 6 });
};

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const groupTransactionsByDate = (transactions) => {
  const groups = {};
  
  transactions.forEach(tx => {
    const dateKey = formatDate(tx.timestamp);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(tx);
  });
  
  return groups;
};

const shortenAddress = (address, chars = 4) => {
  if (!address) return 'Unknown';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

// Skeleton Loader Component
const TransactionSkeleton = ({ colors }) => (
  <View style={[styles.skeletonCard, { backgroundColor: colors.cardBackground }]}>
    <View style={styles.skeletonRow}>
      <View style={[styles.skeletonCircle, { backgroundColor: colors.skeleton }]} />
      <View style={styles.skeletonContent}>
        <View style={[styles.skeletonLine, { backgroundColor: colors.skeleton, width: '60%' }]} />
        <View style={[styles.skeletonLine, { backgroundColor: colors.skeleton, width: '40%', marginTop: 8 }]} />
      </View>
    </View>
  </View>
);

// Chain Selector Component
const ChainSelector = ({ activeChain, onSelect, colors }) => {
  const [modalVisible, setModalVisible] = useState(false);
  
  const chains = [
    { 
      id: 1, 
      name: "Ethereum", 
      symbol: "ETH",
      icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png"
    },
    { 
      id: 2, 
      name: "BNB Smart Chain", 
      symbol: "BSC",
      icon: "https://tokens.pancakeswap.finance/images/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c.png"
    },
    { 
      id: 3, 
      name: "Stellar", 
      symbol: "STR",
      icon: "https://stellar.myfilebase.com/ipfs/QmSTXU2wn1USnmd5ZypA5zMze259wEPSDP3i8wivyr9qiq"
    },
  ];

  const activeChainData = chains.find(c => c.symbol === activeChain);

  return (
    <>
      <TouchableOpacity 
        style={[styles.chainSelectorButton, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
        onPress={() => setModalVisible(true)}
      >
        <Image source={{ uri: activeChainData?.icon }} style={styles.chainIconSmall} />
        <Text style={[styles.chainSelectorText, { color: colors.textPrimary }]}>
          {activeChainData?.symbol}
        </Text>
        <Icon name="chevron-down" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <Modal
        transparent
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Select Network
            </Text>
            
            {chains.map((chain) => (
              <TouchableOpacity
                key={chain.id}
                style={[
                  styles.chainOption,
                  { borderBottomColor: colors.border },
                  activeChain === chain.symbol && { backgroundColor: colors.chipBg }
                ]}
                onPress={() => {
                  onSelect(chain.symbol);
                  setModalVisible(false);
                }}
              >
                <Image source={{ uri: chain.icon }} style={styles.chainIcon} />
                <View style={styles.chainDetails}>
                  <Text style={[styles.chainName, { color: colors.textPrimary }]}>
                    {chain.name}
                  </Text>
                  <Text style={[styles.chainSymbol, { color: colors.textSecondary }]}>
                    {chain.symbol}
                  </Text>
                </View>
                {activeChain === chain.symbol && (
                  <Icon name="check-circle" size={24} color={colors.accent} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

// Filter Chips Component
const FilterChips = ({ activeFilter, onFilterChange, colors }) => {
  const filters = ['All', 'Send', 'Receive', 'Pending'];

  return (
    <View style={styles.filterContainer}>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter}
          style={[
            styles.filterChip,
            { 
              backgroundColor: activeFilter === filter ? colors.chipActive : colors.chipBg,
              borderColor: activeFilter === filter ? colors.chipActive : 'transparent',
            }
          ]}
          onPress={() => onFilterChange(filter)}
        >
          <Text style={[
            styles.filterChipText,
            { color: activeFilter === filter ? '#FFFFFF' : colors.textSecondary }
          ]}>
            {filter}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Transaction Card Component
const TransactionCard = ({ item, walletAddress, activeChain, navigation, colors }) => {
  const scaleAnim = useState(new Animated.Value(1))[0];

  const getTransactionType = (tx) => {
    if (tx.isApprove || tx.typeTx?.toLowerCase() === 'approve') return 'Approve';
    if ((tx.isPending || tx.isFailed || tx.isSuccess) && tx.typeTx) return tx.typeTx;
    if (tx.from?.toLowerCase() === walletAddress?.toLowerCase()) return 'Send';
    if (tx.to?.toLowerCase() === walletAddress?.toLowerCase()) return 'Receive';
    return 'Unknown';
  };

  const txType = getTransactionType(item);
  const isPending = item.isPending === true;
  const isFailed = item.isFailed === true;
  const isSuccess = item.isSuccess === true;
  const isApprove = item.isApprove === true || item.typeTx?.toLowerCase() === 'approve';

  const getStatusConfig = () => {
    if (isFailed) return { text: 'Failed', color: colors.error, icon: 'close-circle' };
    if (isPending) return { text: 'Pending', color: colors.pending, icon: 'clock-outline' };
    if (isApprove) return { text: 'Approved', color: colors.accent, icon: 'check-circle' };
    if (isSuccess) return { text: 'Success', color: colors.success, icon: 'check-circle' };
    if (txType === 'Send') return { text: 'Sent', color: colors.error, icon: 'arrow-up' };
    if (txType === 'Receive') return { text: 'Received', color: colors.success, icon: 'arrow-down' };
    return { text: 'Unknown', color: colors.textTertiary, icon: 'help-circle' };
  };

  const status = getStatusConfig();

  const getExplorerUrl = () => {
    const chain = item.chain || activeChain;
    switch (chain) {
      case 'ETH': return `https://etherscan.io/tx/${item.hash}`;
      case 'BSC':
      case 'BNB': return `https://bscscan.com/tx/${item.hash}`;
      default: return null;
    }
  };

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.97, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true })
    ]).start();

    const explorerUrl = getExplorerUrl();
    if (explorerUrl) {
      navigation.navigate("TxDetail", { transactionPath: explorerUrl });
    }
  };

  const copyToClipboard = (text, label) => {
    Clipboard.setString(text);
    CustomInfoProvider.show("Copied", `${label} copied to clipboard`);
  };

  const handleLongPress = () => {
    Alert.alert(
      'Transaction Options',
      'What would you like to do?',
      [
        { text: 'Copy Hash', onPress: () => copyToClipboard(item.hash, 'Transaction hash') },
        { 
          text: 'Copy Address', 
          onPress: () => {
            const address = txType === 'Send' ? item.to : item.from;
            copyToClipboard(address, 'Address');
          }
        },
        { text: 'View on Explorer', onPress: handlePress },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.transactionCard, { backgroundColor: colors.cardBackground }]}
        onPress={handlePress}
        onLongPress={handleLongPress}
        activeOpacity={0.7}
      >
        {/* Icon & Status */}
        <View style={styles.cardLeft}>
          <View style={[styles.iconCircle, { backgroundColor: status.color + '15' }]}>
            <Icon name={status.icon} size={24} color={status.color} />
          </View>
        </View>

        {/* Transaction Details */}
        <View style={styles.cardCenter}>
          <View style={styles.cardRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.assetText, { color: colors.textPrimary }]}>
                {item.asset || activeChain}
              </Text>
              {/* Show chain badge if transaction is from different chain */}
              {item.chain && item.chain !== activeChain && (
                <View style={[styles.chainBadge, { backgroundColor: colors.chipBg }]}>
                  <Text style={[styles.chainBadgeText, { color: colors.textSecondary }]}>
                    {item.chain}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <Text style={[styles.addressText, { color: colors.textSecondary }]}>
            {isPending || isFailed || isApprove || isSuccess
              ? shortenAddress(item.hash, 6)
              : txType === 'Send'
                ? `To: ${shortenAddress(item.to)}`
                : `From: ${shortenAddress(item.from)}`
            }
          </Text>

          {item.timestamp && (
            <Text style={[styles.timeText, { color: colors.textTertiary }]}>
              {new Date(item.timestamp).toLocaleString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          )}
        </View>

        {/* Amount - with txType just above */}
        <View style={styles.cardRight}>
          <View style={[styles.statusBadge, { backgroundColor: status.color + '15' }]}>
              <Text style={[styles.statusBadgeText, { color: status.color }]}>
                {status.text}
              </Text>
            </View>
          {/* Show txType just above amount */}
          {(isPending || isFailed || isApprove || isSuccess) && txType && (
            <Text style={[styles.txTypeTextRight, { color: colors.textSecondary }]}>
              {txType}
            </Text>
          )}
          
          {!isApprove && item.value !== 0 && (
            <Text style={[
              styles.amountText,
              { color: isFailed ? colors.textTertiary : status.color }
            ]}>
              {txType === 'Send' ? '-' : txType === 'Receive' ? '+' : ''}
              {formatNumber(item.value || item.formattedAmount || 0)}
            </Text>
          )}
          
          {isPending && (
            <View style={styles.pendingIndicator}>
              <ActivityIndicator size="small" color={colors.pending} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Empty State Component
const EmptyState = ({ activeFilter, colors }) => {
  const getMessage = () => {
    switch (activeFilter) {
      case 'Send': return 'No sent transactions yet';
      case 'Receive': return 'No received transactions yet';
      case 'Pending': return 'No pending transactions';
      default: return 'No transactions found';
    }
  };

  return (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIconContainer, { backgroundColor: colors.chipBg }]}>
        <Icon name="history" size={48} color={colors.textTertiary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
        {getMessage()}
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Your transaction history will appear here
      </Text>
    </View>
  );
};

// Main Component
const TransactionHistory = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { colors } = useTheme();
  const state = useSelector((state) => state);
  const walletAddress = state?.wallet?.address;

  const [activeChain, setActiveChain] = useState('ETH');
  const [activeFilter, setActiveFilter] = useState('All');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Get previous screen name from navigation state
  const previousScreen = useNavigationState(state => {
    const routes = state?.routes || [];
    const currentIndex = state?.index;
    if (currentIndex > 0) {
      return routes[currentIndex - 1]?.name;
    }
    return null;
  });

  useEffect(() => {
    // Only set initial chain on first mount or when explicitly passed via route params
    if (route?.params?.txType) {
      setActiveChain(route.params.txType);
    }
    
    // Auto-select filter based on previous screen
    if (previousScreen === 'Settings' || previousScreen === 'Setting' || previousScreen === 'TxDetail') {
      // Settings or TxDetail se aaye to 'All' select karo
      setActiveFilter('All');
    } else if (previousScreen) {
      // Baaki kisi bhi screen se aaye to 'Pending' select karo
      setActiveFilter('Pending');
    }
  }, [route?.params?.txType, previousScreen]);


  useEffect(() => {
    fetchTransactions();
  }, [activeChain]);

  // Fetch all chains' pending transactions when Pending filter is active
  useEffect(() => {
    if (activeFilter === 'Pending') {
      fetchAllChainsPendingTransactions();
    }
  }, [activeFilter]);

  const fetchAllChainsPendingTransactions = async () => {
    try {
      // Get all pending transactions from storage
      const pendingResponse = await ShortTermStorage.getWalletTx(walletAddress);
      const allPendingTxs = pendingResponse.status ? pendingResponse.data : [];

      // Filter for all chains' pending/failed/approve transactions
      const filteredPendingTxs = allPendingTxs.filter(tx => 
        tx.status?.toLowerCase() === 'pending' || 
        tx.status?.toLowerCase() === 'failed' || 
        tx.typeTx?.toLowerCase() === 'approve'
      );

      // Format pending transactions
      const formattedAllPendingTxs = filteredPendingTxs.map(tx => ({
        hash: tx.hash,
        from: tx.typeTx === 'Send' ? walletAddress : 'Unknown',
        to: tx.typeTx === 'Receive' ? walletAddress : 'Unknown',
        value: tx.amount || 0,
        asset: tx.asset || tx.chain,
        isPending: tx.status?.toLowerCase() === 'pending',
        isFailed: tx.status?.toLowerCase() === 'failed',
        isApprove: tx.typeTx?.toLowerCase() === 'approve',
        timestamp: tx.createdAt,
        typeTx: tx.typeTx,
        chain: tx.chain,
        formattedAmount: tx.amount || 0,
      }));

      // Sort by timestamp
      formattedAllPendingTxs.sort((a, b) => {
        const dateA = new Date(a.timestamp || 0);
        const dateB = new Date(b.timestamp || 0);
        return dateB - dateA;
      });

      // Merge with existing transactions (remove duplicates)
      const existingHashes = new Set(transactions.map(tx => tx.hash?.toLowerCase()));
      const newPendingTxs = formattedAllPendingTxs.filter(
        tx => !existingHashes.has(tx.hash?.toLowerCase())
      );

      if (newPendingTxs.length > 0) {
        const updatedTransactions = [...newPendingTxs, ...transactions];
        updatedTransactions.sort((a, b) => {
          const dateA = new Date(a.timestamp || 0);
          const dateB = new Date(b.timestamp || 0);
          return dateB - dateA;
        });
        setTransactions(updatedTransactions);
      }
    } catch (error) {
      console.error('Error fetching all pending transactions:', error);
    }
  };

  const fetchTransactions = async () => {
    if (activeChain === 'STR') return;

    try {
      setLoading(true);
      setError(null);

      const endpoint = activeChain === 'ETH' 
        ? `/v1/transaction-history/${walletAddress}/eth`
        : `/v1/transaction-history/${walletAddress}/bsc`;

      const { res, err } = await proxyRequest(endpoint, PGET);

      if (err?.status) {
        setError('Failed to fetch transactions');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (res) {
        // Get pending transactions
        const pendingResponse = await ShortTermStorage.getWalletTx(walletAddress);
        const pendingTxs = pendingResponse.status ? pendingResponse.data : [];

        // Remove confirmed transactions from pending
        const confirmedHashes = new Set(res.map(tx => tx.hash?.toLowerCase()));
        for (const pendingTx of pendingTxs) {
          if (pendingTx.chain === activeChain && confirmedHashes.has(pendingTx.hash?.toLowerCase())) {
            await ShortTermStorage.removeTxByHash(walletAddress, pendingTx.hash, pendingTx.chain);
          }
        }

        // Get updated pending transactions
        const updatedPendingResponse = await ShortTermStorage.getWalletTx(walletAddress);
        const updatedPendingTxs = updatedPendingResponse.status ? updatedPendingResponse.data : [];

        // Filter for current chain only
        const chainPendingTxs = updatedPendingTxs.filter(tx => 
          tx.chain === activeChain && 
          (tx.status?.toLowerCase() === 'pending' || 
           tx.status?.toLowerCase() === 'failed' || 
           tx.typeTx?.toLowerCase() === 'approve')
        );

        // Format pending transactions
        const formattedPendingTxs = chainPendingTxs.map(tx => ({
          hash: tx.hash,
          from: tx.typeTx === 'Send' ? walletAddress : 'Unknown',
          to: tx.typeTx === 'Receive' ? walletAddress : 'Unknown',
          value: tx.amount || 0,
          asset: tx.asset || tx.chain,
          isPending: tx.status?.toLowerCase() === 'pending',
          isFailed: tx.status?.toLowerCase() === 'failed',
          isApprove: tx.typeTx?.toLowerCase() === 'approve',
          timestamp: tx.createdAt,
          typeTx: tx.typeTx,
          chain: tx.chain,
          formattedAmount: tx.amount || 0,
        }));

        // Deduplicate and combine
        const uniquePendingTxs = formattedPendingTxs.filter(
          ptx => !confirmedHashes.has(ptx.hash?.toLowerCase())
        );

        const combinedTxs = [...uniquePendingTxs, ...res];
        
        // Sort by timestamp
        combinedTxs.sort((a, b) => {
          const dateA = new Date(a.timestamp || 0);
          const dateB = new Date(b.timestamp || 0);
          return dateB - dateA;
        });

        setTransactions(combinedTxs);
      }

      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Something went wrong');
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    if (activeFilter === 'All') return transactions;
    
    if (activeFilter === 'Pending') {
      // Show pending transactions from ALL chains, not just current chain
      return transactions.filter(tx => 
        tx.isPending === true || 
        tx.isFailed === true || 
        tx.isApprove === true
      );
    }

    return transactions.filter(tx => {
      if (tx.isApprove || tx.typeTx?.toLowerCase() === 'approve') return false;
      if ((tx.isPending || tx.isFailed || tx.isSuccess) && tx.typeTx) {
        return tx.typeTx === activeFilter;
      }
      if (tx.from?.toLowerCase() === walletAddress?.toLowerCase()) return activeFilter === 'Send';
      if (tx.to?.toLowerCase() === walletAddress?.toLowerCase()) return activeFilter === 'Receive';
      return false;
    });
  }, [transactions, activeFilter, walletAddress]);

  const groupedTransactions = useMemo(() => {
    return groupTransactionsByDate(filteredTransactions);
  }, [filteredTransactions]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  const renderSectionHeader = ({ section }) => (
    <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
      <Text style={[styles.sectionHeaderText, { color: colors.textSecondary }]}>
        {section.title}
      </Text>
    </View>
  );

  const renderTransaction = ({ item }) => (
    <TransactionCard 
      item={item} 
      walletAddress={walletAddress}
      activeChain={activeChain}
      navigation={navigation}
      colors={colors}
    />
  );

  // Convert grouped transactions to sections
  const sections = Object.keys(groupedTransactions).map(dateKey => ({
    title: dateKey,
    data: groupedTransactions[dateKey]
  }));

  if (activeChain === 'STR') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TransactionForStellar
          title="Transactions"
          onLeftIconPress={() => navigation.goBack()}
          activeBackgroundColor={colors.background}
          activeTxColor={colors.textPrimary}
        />
        <StellarTransactionHistory
          publicKey={state.STELLAR_PUBLICK_KEY}
          isDarkMode={state.THEME.THEME}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Wallet_screen_header 
        title="Transactions" 
        onLeftIconPress={() => navigation.goBack()} 
      />

      {/* Chain Selector & Filters */}
      <View style={styles.headerSection}>
        <ChainSelector 
          activeChain={activeChain} 
          onSelect={setActiveChain}
          colors={colors}
        />
        <FilterChips 
          activeFilter={activeFilter} 
          onFilterChange={setActiveFilter}
          colors={colors}
        />
      </View>

      {/* Loading State */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          {[1, 2, 3, 4].map((i) => (
            <TransactionSkeleton key={i} colors={colors} />
          ))}
        </View>
      ) : error ? (
        // Error State
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.textPrimary }]}>{error}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.accent }]}
            onPress={fetchTransactions}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredTransactions.length === 0 ? (
        // Empty State
        <EmptyState activeFilter={activeFilter} colors={colors} />
      ) : (
        // Transaction List
        <FlatList
          data={sections}
          keyExtractor={(item, index) => `section-${index}`}
          renderItem={({ item: section }) => (
            <View>
              {renderSectionHeader({ section })}
              {section.data.map((tx, index) => (
                <View key={`${tx.hash}-${index}`}>
                  {renderTransaction({ item: tx })}
                </View>
              ))}
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.accent]}
              tintColor={colors.accent}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  chainSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  chainIconSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  chainSelectorText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingBottom: 32,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#CBD5E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  chainOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  chainIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  chainDetails: {
    flex: 1,
  },
  chainName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  chainSymbol: {
    fontSize: 14,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionHeader: {
    paddingVertical: 8,
    marginTop: 8,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  transactionCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardLeft: {
    marginRight: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardCenter: {
    flex: 1,
    justifyContent: 'center',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  assetText: {
    fontSize: 16,
    fontWeight: '700',
  },
  chainBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  chainBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  txTypeText: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  txTypeTextRight: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
    textAlign: 'right',
  },
  addressText: {
    fontSize: 14,
    marginBottom: 2,
  },
  timeText: {
    fontSize: 12,
  },
  cardRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  pendingIndicator: {
    marginTop: 4,
  },
  skeletonCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
  },
  skeletonRow: {
    flexDirection: 'row',
  },
  skeletonCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  skeletonContent: {
    flex: 1,
    justifyContent: 'center',
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    padding: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

const Transactions = () => (
  <ThemeProvider>
    <TransactionHistory />
  </ThemeProvider>
);

export default Transactions;