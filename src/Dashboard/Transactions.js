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

const ThemeContext = React.createContext();

const themes = {
  light: {
    background: '#FFFF',
    cardBackground: '#ebe8e8',
    textPrimary: '#1A1A1A',
    textSecondary: '#666666',
    textTertiary: '#999999',
    accent: '#3b82f6',
    tabInactive: '#F0F0F0',
    tabInactiveText: '#666666',
    cardDark: '#F5F5F5',
    iconContainer: '#FFFFFF',
    divider: '#E0E0E0',
    success: '#4ECB71',
    error: '#FF6B6B',
    warning: '#FFCC00',
    cardShadow: 'rgba(0, 0, 0, 0.05)',
  },
  dark: {
    background: 'black',
    cardBackground: '#1E1E1E',
    textPrimary: '#FFFFFF',
    textSecondary: '#BBBBBB',
    textTertiary: '#888888',
    accent: '#3b82f6',
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

const formatNumber = (value, decimals = 4) => {
  if (!value) return '0';
  return parseFloat(value).toFixed(decimals);
};

const TransactionHistory = () => {
  const backData=useRoute();
  const [selectedTab,setselectedTab]=useState(null);
  const isFocusedTab=useIsFocused();
  const navigation=useNavigation();
  const { theme, colors } = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const state = useSelector((state) => state);
  const walletAddress = state?.wallet?.address;;
  const [activeChainNetwork, setactiveChainNetwork] = useState('ETH');
  const [selectChainOpen, setSelectChainOpen] = useState(false);
  const supportedChains=[
    { id: 1, name: "Ethereum", imgUrl: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",value:"ETH" },
    { id: 2, name: "Binance", imgUrl: "https://tokens.pancakeswap.finance/images/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c.png",value:"BSC" },
    { id: 2, name: "Stellar", imgUrl: "https://stellar.myfilebase.com/ipfs/QmSTXU2wn1USnmd5ZypA5zMze259wEPSDP3i8wivyr9qiq",value:"STR" },
  ];

  useEffect(()=>{
    setselectedTab(backData?.params?.txType || "ETH");
    setactiveChainNetwork("ETH");
    setSelectChainOpen(false);
  },[isFocusedTab])

  useEffect(() => {
    chainManage();
  }, []);

  useEffect(() => {
    chainManage();
  }, [activeChainNetwork]);

  useEffect(() => {
    filterTransactions();
  }, [activeTab, transactions]);

  const chainManage=()=>{
    if (activeChainNetwork === "ETH") {
      fetchAllTransactions();
    }
    if (activeChainNetwork === "BSC") {
      fetchBNBAllTransactions();
    }
    if (activeChainNetwork === "STR") {
        setselectedTab("STR")
    }
  }

  const fetchAllTransactions = async () => {
    try {
      setLoading(true);
       const {res,err} = await proxyRequest(`/v1/transaction-history/${walletAddress}/eth`, PGET);
      if (err?.status === 500) {
        console.log('Error fetching transactions:', err);
        setLoading(false);
        setRefreshing(false);
      }      
      setTransactions(res);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.log('Error fetching transactions:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchBNBAllTransactions = async () => {
    try {
      setLoading(true);
       const {res,err} = await proxyRequest(`/v1/transaction-history/${walletAddress}/bsc`, PGET);
      if (err?.status === 500) {
        console.log('Error fetching transactions:', err);
        setLoading(false);
        setRefreshing(false);
      }      
      setTransactions(res);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.log('Error fetching transactions:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getTransactionType = (tx) => {
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
      onPress={() => { setactiveChainNetwork(item.value),setSelectChainOpen(false) }}
    >
      <Image
        source={{ uri: item.imgUrl }}
        style={styles.chainIcon}
      />
      <View style={styles.chainInfo}>
        <Text style={[styles.chainSymbol,{color:colors.textPrimary}]}>{item.value}</Text>
        <Text style={[styles.chainName,{color:colors.textSecondary}]}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => {
    const txType = getTransactionType(item);
    const statusColor = txType === 'Send' ? colors.error : colors.success;

    return (
      <TouchableOpacity style={[styles.cardContainer, { backgroundColor: colors.background }]}>
        <TouchableOpacity style={[styles.card, { backgroundColor: colors.cardBackground }]}  onPress={()=>{navigation.navigate("TxDetail",{transactionPath:activeChainNetwork==="ETH"?"https://sepolia.etherscan.io/tx/"+item.hash:"https://testnet.bscscan.com/tx/"+item.hash})}}>
          <View style={styles.leftSection}>
            <View style={[styles.iconContainer, { backgroundColor: colors.iconContainer }]}>
              <Text style={{ fontSize: 25, fontWeight: "500", color: '#3b82f6' }}>{item?.asset?.charAt(0)?.toLocaleUpperCase() || "E"}</Text>
            </View>
          </View>

          <View style={styles.rightSection}>
            <View style={styles.headerRow}>
              <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                {txType === 'Send' ? `To: XXXXX${item.to.slice(-10)}` : `From: XXXXX${item.from.slice(-10)}`}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                <Text style={styles.statusText}>{txType}</Text>
              </View>
            </View>

            <View style={styles.detailsRow}>
              <Text style={[styles.assetName, { color: colors.textPrimary }]}>
                {item.asset || 'ETH'}
              </Text>
             <View style={{alignSelf:"flex-end",width:"20%"}}>
             <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
              <Text style={[styles.amountText, { color: statusColor }]}>
                {txType === 'Send' ? '-' : '+'}
                {formatNumber(item.value ||item?.formattedAmount || 0,item?.rawContract?.decimal)}
              </Text>
              </ScrollView>
             </View>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const HeaderComponent = () => (
    <>
      <View style={styles.tabContainer}>
      <TouchableOpacity style={[styles.activeChainButton,{backgroundColor:colors.cardBackground}]} onPress={()=>{setSelectChainOpen(true)}}>
        <Text style={[styles.activeChainBtnTxt,{color:colors.textPrimary}]}>{activeChainNetwork}</Text>
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

      {selectedTab==="ETH"||selectedTab==="BSC"?<>
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
              ListEmptyComponent={EmptyListComponent}
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
      </>: 
      <>
      <TransactionForStellar title="Transactions" onLeftIconPress={() => navigation.goBack()} />
      <StellarTransactionHistory publicKey={state.STELLAR_PUBLICK_KEY} isDarkMode={true}/>
      </>}
      <Modal transparent animationType="slide" visible={selectChainOpen} onRequestClose={() => { setSelectChainOpen(false) }}>
        <View style={styles.chainSelectionContainer}>
          <View style={[styles.chainSelectionSubContainer, { backgroundColor: state.THEME.THEME === false ? "#fff" : "#18181C", height: "37%" }]}>
            <View style={styles.headingCon}>
              <Text style={[styles.chainHeading,{color:colors.textPrimary}]}>Select Chain</Text>
              <Icon name="close-circle-outline" size={35} color={state.THEME.THEME === false ? "#080a0a" : "#fff"} style={{ alignSelf: "flex-end" }} onPress={() => { setSelectChainOpen(false) }} />
            </View>
            <FlatList
              data={supportedChains}
              renderItem={renderChianList}
              keyExtractor={item => item.id}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignContent:"center"
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
    alignItems:"stretch",
    justifyContent:"center",
    paddingRight:14
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
    width:69,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 15,
    alignItems:"center"
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  amountText: {
    fontSize: 17,
    fontWeight: 'bold',
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
    flexDirection:"row",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    minWidth: 90,
    justifyContent:"center",
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  activeChainBtnTxt:{
    textAlign:"center",
     fontWeight:"600"
  },
  chainSelectionContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'flex-end'
  },
  chainSelectionSubContainer:{
    bottom:0,
    borderTopLeftRadius:30,
    borderTopRightRadius:30,
    padding:10,
  },
  chainItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingLeft:10
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
    marginLeft:10,
  },
  headingCon:{
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center"
  }
});

const Transactions = () => (
  <ThemeProvider>
    <TransactionHistory />
  </ThemeProvider>
);

export default Transactions;