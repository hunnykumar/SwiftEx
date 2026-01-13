import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  useColorScheme as _useColorScheme,
  Appearance,
  SafeAreaView,
  RefreshControl,
  ScrollView,
  Modal,
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { TransactionForStellar, Wallet_screen_header } from './reusables/ExchangeHeader';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import StellarTransactionHistory from './exchange/crypto-exchange-front-end-main/src/pages/StellarTransactionHistory';
import { PGET, PPOST, proxyRequest } from './exchange/crypto-exchange-front-end-main/src/api';
import CustomInfoProvider from './exchange/crypto-exchange-front-end-main/src/components/CustomInfoProvider';
import ShortTermStorage from '../utilities/ShortTermStorage';

const ThemeContext = React.createContext();

const themes = {
  light: {
    background: '#FFFFFF',
    cardBackground: '#F4F4F8',
    textPrimary: '#1A1A1A',
    textSecondary: '#666666',
    textTertiary: '#999999',
    accent: '#5B65E1',
    tabInactive: '#F0F0F0',
    tabInactiveText: '#666666',
    cardDark: '#F4F4F8',
    iconContainer: '#FFFFFF',
    divider: '#E0E0E0',
    success: '#4ECB71',
    error: '#FF6B6B',
    warning: '#ffc400c5',
    cardShadow: 'rgba(0, 0, 0, 0.05)',
  },
  dark: {
    background: '#1B1B1C',
    cardBackground: '#242426',
    textPrimary: '#FFFFFF',
    textSecondary: '#BBBBBB',
    textTertiary: '#888888',
    accent: '#5B65E1',
    tabInactive: '#333333',
    tabInactiveText: '#BBBBBB',
    cardDark: '#252525',
    iconContainer: '#2C2C2C',
    divider: '#333333',
    success: '#4ECB71',
    error: '#FF6B6B',
    warning: '#FFCC00',
    cardShadow: 'rgba(0, 0, 0, 0.2)',
  }
};

const ThemeProvider = ({ children }) => {
  const state = useSelector((state) => state);
  const deviceTheme = Appearance.getColorScheme();
  const [theme, setTheme] = useState(deviceTheme === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    setTheme(state.THEME.THEME === true ? 'dark' : 'light');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, colors: themes[theme] }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => useContext(ThemeContext);

const formatNumber = (num) => {
  if (num === 0) return "0";
  if (Math.abs(num) < 0.0001 || Math.abs(num) > 1000000) {
    return num.toExponential(2);
  }
  return num.toLocaleString(undefined, { maximumSignificantDigits: 6 });
};

const TransactionHistory = () => {
  const backData = useRoute();
  const [selectedTab, setselectedTab] = useState(null);
  const isFocusedTab = useIsFocused();
  const navigation = useNavigation();
  const { theme, colors } = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const state = useSelector((state) => state);
  const walletAddress = state?.wallet?.address;
  const [activeChainNetwork, setactiveChainNetwork] = useState('ETH');
  const [selectChainOpen, setSelectChainOpen] = useState(false);

  const supportedChains = [
    { id: 1, name: "Ethereum", imgUrl: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png", value: "ETH" },
    { id: 2, name: "Binance", imgUrl: "https://tokens.pancakeswap.finance/images/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c.png", value: "BSC" },
    { id: 3, name: "Stellar", imgUrl: "https://stellar.myfilebase.com/ipfs/QmSTXU2wn1USnmd5ZypA5zMze259wEPSDP3i8wivyr9qiq", value: "STR" },
  ];

  useEffect(() => {
    setselectedTab(backData?.params?.txType || "ETH");
    setactiveChainNetwork("ETH");
    setSelectChainOpen(false);
  }, [isFocusedTab]);

  useEffect(() => {
    chainManage();
  }, []);

  useEffect(() => {
    chainManage();
  }, [activeChainNetwork]);

  useEffect(() => {
    filterTransactions();
  }, [activeTab, transactions]);

  const chainManage = () => {
    if (activeChainNetwork === "ETH") {
      fetchAllTransactions();
    }
    if (activeChainNetwork === "BSC") {
      fetchBNBAllTransactions();
    }
    if (activeChainNetwork === "STR") {
      setselectedTab("STR");
    }
  };

  const fetchAllTransactions = async () => {
    try {
      setLoading(true);
      const { res, err } = await proxyRequest(`/v1/transaction-history/${walletAddress}/eth`, PGET);

      if (err?.status) {
        CustomInfoProvider.show("Info", "Oops! Something went wrong while fetching wallet transaction history.");
        console.log('Error fetching transactions:', err);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (res) {
        const pendingResponse = await ShortTermStorage.getWalletTx(walletAddress);
        const pendingTxs = pendingResponse.status ? pendingResponse.data : [];

        const confirmedEthHashes = new Set(res.map(tx => tx.hash?.toLowerCase()));
        for (const pendingTx of pendingTxs) {
          if (pendingTx.chain === 'ETH' && confirmedEthHashes.has(pendingTx.hash?.toLowerCase())) {
            await ShortTermStorage.removeTxByHash(
              walletAddress,
              pendingTx.hash,
              pendingTx.chain
            );
          }
        }

        const updatedPendingResponse = await ShortTermStorage.getWalletTx(walletAddress);
        const updatedPendingTxs = updatedPendingResponse.status ? updatedPendingResponse.data : [];

        const allChainPendingTxs = updatedPendingTxs.filter(tx => {
          const status = tx.status?.toLowerCase();
          return status === 'pending' || status === 'failed' || status === 'success' || tx.typeTx === 'Approve';
        });

        const formattedPendingTxs = allChainPendingTxs.map(tx => {
          const status = tx.status?.toLowerCase();
          return {
            hash: tx.hash,
            from: tx.typeTx === 'Send' ? walletAddress : 'Unknown',
            to: tx.typeTx === 'Receive' ? walletAddress : 'Unknown',
            value: tx.amount || 0,
            asset: tx.asset || tx.chain,
            isPending: status === 'pending',
            isFailed: status === 'failed',
            isSuccess: status === 'success',
            isApprove: tx.typeTx === 'Approve',
            timestamp: tx.createdAt,
            typeTx: tx.typeTx,
            chain: tx.chain,
            formattedAmount: tx.amount || 0,
          };
        });

        const combinedTxs = [...formattedPendingTxs, ...res];

        setTransactions(combinedTxs);
        setLoading(false);
        setRefreshing(false);
      }
    } catch (error) {
      console.log('Error fetching transactions:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchBNBAllTransactions = async () => {
    try {
      setLoading(true);
      const { res, err } = await proxyRequest(`/v1/transaction-history/${walletAddress}/bsc`, PGET);

      if (err?.status) {
        CustomInfoProvider.show("Info", "Oops! Something went wrong while fetching wallet transaction history.");
        console.log('Error fetching transactions:', err);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (res) {
        const pendingResponse = await ShortTermStorage.getWalletTx(walletAddress);
        console.debug("pendingResponseBSC", pendingResponse);
        const pendingTxs = pendingResponse.status ? pendingResponse.data : [];

        const confirmedBscHashes = new Set(res.map(tx => tx.hash?.toLowerCase()));

        for (const pendingTx of pendingTxs) {
          if (pendingTx.chain === 'BSC' && confirmedBscHashes.has(pendingTx.hash?.toLowerCase())) {
            await ShortTermStorage.removeTxByHash(
              walletAddress,
              pendingTx.hash,
              pendingTx.chain
            );
          }
        }

        const updatedPendingResponse = await ShortTermStorage.getWalletTx(walletAddress);
        const updatedPendingTxs = updatedPendingResponse.status ? updatedPendingResponse.data : [];

        const allChainPendingTxs = updatedPendingTxs.filter(tx => {
          const status = tx.status?.toLowerCase();
          return status === 'pending' || status === 'failed' || status === 'success' || tx.typeTx === 'Approve';
        });

        const formattedPendingTxs = allChainPendingTxs.map(tx => {
          const status = tx.status?.toLowerCase();
          return {
            hash: tx.hash,
            from: tx.typeTx === 'Send' ? walletAddress : 'Unknown',
            to: tx.typeTx === 'Receive' ? walletAddress : 'Unknown',
            value: tx.amount || 0,
            asset: tx.asset || tx.chain,
            isPending: status === 'pending',
            isFailed: status === 'failed',
            isSuccess: status === 'success',
            isApprove: tx.typeTx === 'Approve',
            timestamp: tx.createdAt,
            typeTx: tx.typeTx,
            chain: tx.chain,
            formattedAmount: tx.amount || 0,
          };
        });

        const combinedTxs = [...formattedPendingTxs, ...res];

        setTransactions(combinedTxs);
        setLoading(false);
        setRefreshing(false);
      }
    } catch (error) {
      console.log('Error fetching transactions:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getTransactionType = (tx) => {
  if (tx.isApprove || tx.typeTx === 'Approve') {
    return 'Approve';
  }
  
  if ((tx.isPending || tx.isFailed || tx.isSuccess) && tx.typeTx) {
    return tx.typeTx;
  }

  if (tx.from?.toLowerCase() === walletAddress.toLowerCase()) return 'Send';
  if (tx.to?.toLowerCase() === walletAddress.toLowerCase()) return 'Receive';
  return 'UNKNOWN';
};

  const filterTransactions = () => {
    if (activeTab === 'All') {
      setFilteredTransactions(transactions);
    } else {
      setFilteredTransactions(
        transactions.filter(tx => getTransactionType(tx) === activeTab)
      );
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    chainManage();
  };

  const TabButton = ({ title, isActive }) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        { backgroundColor: isActive ? colors.accent : colors.tabInactive },
        isActive && styles.activeTabButton
      ]}
      onPress={() => setActiveTab(title)}
    >
      <Text style={[
        styles.tabButtonText,
        { color: isActive ? '#FFFFFF' : colors.tabInactiveText }
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <Icon name="history" size={60} color={colors.textTertiary} />
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        No transactions found
      </Text>
      <Text style={[styles.emptySubText, { color: colors.textTertiary }]}>
        Transactions will appear here when you send or receive assets
      </Text>
    </View>
  );

  const renderChianList = ({ item }) => (
    <TouchableOpacity
      style={styles.chainItem}
      onPress={() => { setactiveChainNetwork(item.value), setSelectChainOpen(false) }}
    >
      <Image
        source={{ uri: item.imgUrl }}
        style={styles.chainIcon}
      />
      <View style={styles.chainInfo}>
        <Text style={[styles.chainSymbol, { color: colors.textPrimary }]}>{item.value}</Text>
        <Text style={[styles.chainName, { color: colors.textSecondary }]}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );
  const getExplorerUrl = (item) => {
    const chain = item.chain || activeChainNetwork;

    switch (chain) {
      case 'ETH':
        return `https://etherscan.io/tx/${item.hash}`;
      case 'BSC':
      case 'BNB':
        return `https://bscscan.com/tx/${item.hash}`;
    }
  }

  const renderItem = ({ item }) => {
    const txType = getTransactionType(item);
    const statusColor = txType === 'Send' ? colors.error : colors.success;
    const isPending = item.isPending === true;
    const isFailed = item.isFailed === true;
    const isSuccess = item.isSuccess === true;
    const isApprove = item.isApprove === true || item.typeTx === 'Approve';

    let statusText = txType;
    let badgeColor = statusColor;

    if (isFailed) {
      statusText = 'Failed';
      badgeColor = colors.error;
    } else if (isPending) {
      statusText = 'Pending';
      badgeColor = colors.warning;
    } else if (isApprove) {
      statusText = 'Approve';
      badgeColor = colors.accent;
    } else if (isSuccess) {
      statusText = 'Success';
      badgeColor = colors.success;
    }

    return (
      <TouchableOpacity style={[styles.cardContainer, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[
            styles.card,
            { backgroundColor: colors.cardBackground },
          ]}
          onPress={() => {
            navigation.navigate("TxDetail", {
              transactionPath: getExplorerUrl(item)
            });
          }}
        >
          <View style={styles.leftSection}>
            <View style={[styles.iconContainer, { backgroundColor: colors.iconContainer }]}>
              <Text style={{ fontSize: 25, fontWeight: "500", color: '#3b82f6' }}>
                {item?.asset?.charAt(0)?.toLocaleUpperCase() || "E"}
              </Text>
            </View>
          </View>

          <View style={styles.rightSection}>
            <View style={styles.headerRow}>
              <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                {isPending || isFailed || isApprove || isSuccess
                  ? `XXXXX${item?.hash?.slice(-13)}`
                  : txType === 'Send'
                    ? `To: XXXXX${item.to?.slice(-10) || 'Unknown'}`
                    : `From: XXXXX${item.from?.slice(-10) || 'Unknown'}`}
              </Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: badgeColor }
              ]}>
                <Text style={styles.statusText}>
                  {statusText}
                </Text>
              </View>
            </View>

            <View style={styles.detailsRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.assetName, { color: colors.textPrimary }]}>
                  {item.asset || 'ETH'}
                </Text>
              </View>
              <Text numberOfLines={1} style={[
                styles.amountText,
                {
                  color: isFailed ? colors.textTertiary
                    : isPending ? colors.textSecondary
                      : isApprove ? colors.accent
                        : isSuccess ? colors.success
                          : statusColor
                }
              ]}>
                {(isPending || isFailed || isApprove || isSuccess) && item.value === 0 ? '' : (
                  `${txType === 'Send' ? '-' : txType === 'Approve' ? '' : '+'}${formatNumber(item.value || item?.formattedAmount || 0)}`
                )}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const HeaderComponent = () => (
    <>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.activeChainButton, { backgroundColor: colors.cardBackground }]}
          onPress={() => { setSelectChainOpen(true) }}
        >
          <Text style={[styles.activeChainBtnTxt, { color: colors.textPrimary }]}>
            {activeChainNetwork}
          </Text>
          <Icon name="menu-down" size={19} color={colors.textPrimary} />
        </TouchableOpacity>
        <TabButton title="All" isActive={activeTab === 'All'} />
        <TabButton title="Send" isActive={activeTab === 'Send'} />
        <TabButton title="Receive" isActive={activeTab === 'Receive'} />
      </View>
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {selectedTab === "ETH" || selectedTab === "BSC" ? (
        <>
          <Wallet_screen_header title="Transactions" onLeftIconPress={() => navigation.goBack()} />
          <HeaderComponent />
          {loading && !refreshing ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={[styles.loaderText, { color: colors.textSecondary }]}>
                Loading transactions...
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredTransactions}
              keyExtractor={(item, index) => `${item.hash || ''}-${index}`}
              renderItem={renderItem}
              contentContainerStyle={[
                styles.listContent,
                filteredTransactions.length === 0 && styles.emptyList
              ]}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={EmptyListComponent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={["#3b82f6"]}
                  tintColor="#3b82f6"
                  title="Updating..."
                  titleColor="#3b82f6"
                />
              }
            />
          )}
        </>
      ) : (
        <>
          <TransactionForStellar
            title="Transactions"
            onLeftIconPress={() => navigation.goBack()}
            activeBackgroundColor={state.THEME.THEME === false ? "#FFFFFF" : "#1B1B1C"}
            activeTxColor={state.THEME.THEME === false ? "#1B1B1C" : "#FFFFFF"}
          />
          <StellarTransactionHistory
            publicKey={state.STELLAR_PUBLICK_KEY}
            isDarkMode={state.THEME.THEME}
          />
        </>
      )}

      <Modal
        transparent
        animationType="slide"
        visible={selectChainOpen}
        onRequestClose={() => { setSelectChainOpen(false) }}
      >
        <View style={styles.chainSelectionContainer}>
          <View style={[
            styles.chainSelectionSubContainer,
            { backgroundColor: state.THEME.THEME === false ? "#fff" : "#18181C", height: "37%" }
          ]}>
            <View style={styles.headingCon}>
              <Text style={[styles.chainHeading, { color: colors.textPrimary }]}>
                Select Chain
              </Text>
              <Icon
                name="close-circle-outline"
                size={35}
                color={state.THEME.THEME === false ? "#080a0a" : "#fff"}
                style={{ alignSelf: "flex-end" }}
                onPress={() => { setSelectChainOpen(false) }}
              />
            </View>
            <FlatList
              data={supportedChains}
              renderItem={renderChianList}
              keyExtractor={item => item.id.toString()}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  themeToggle: {
    padding: 8,
    borderRadius: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    minWidth: 90,
    alignItems: 'center',
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    alignContent: "center"
  },
  leftSection: {
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: "stretch",
    justifyContent: "center",
    paddingRight: 14
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 13,
    fontWeight: '500',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  assetName: {
    fontSize: 17,
    fontWeight: '600',
  },
  statusBadge: {
    width: 75,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 15,
    alignItems: "center"
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  amountText: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: "right",
    maxWidth: "35%"
  },
  addressRow: {
    marginTop: 4,
  },
  addressText: {
    fontSize: 13,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
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
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginHorizontal: 20,
  },
  activeChainButton: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    minWidth: 90,
    justifyContent: "center",
    alignItems: 'center',
  },
  activeChainBtnTxt: {
    textAlign: "center",
    fontWeight: "600"
  },
  chainSelectionContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'flex-end'
  },
  chainSelectionSubContainer: {
    bottom: 0,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 10,
  },
  chainItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingLeft: 10
  },
  chainIcon: {
    width: 35,
    height: 35,
    borderRadius: 16,
  },
  chainInfo: {
    flex: 1,
    marginLeft: 12,
  },
  chainSymbol: {
    fontSize: 16,
    fontWeight: '500',
  },
  chainName: {
    fontSize: 14,
  },
  chainHeading: {
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 10,
  },
  headingCon: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  pendingInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  pendingInfoText: {
    fontSize: 11,
    marginLeft: 4,
    fontStyle: 'italic',
  },
});

const Transactions = () => (
  <ThemeProvider>
    <TransactionHistory />
  </ThemeProvider>
);

export default Transactions;