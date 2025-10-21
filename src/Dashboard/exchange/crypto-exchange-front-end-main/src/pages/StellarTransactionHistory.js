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
import * as StellarSdk from '@stellar/stellar-sdk';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { STELLAR_URL } from '../../../../constants';
import { useNavigation } from '@react-navigation/native';
import { authRequest, POST } from '../api';
import AllbridgeTxTrack from '../components/AllbridgeTxTrack';

const server = new StellarSdk.Horizon.Server(STELLAR_URL.URL);

const getThemeColors = (isDarkMode) => ({
  background: isDarkMode ? '#1B1B1C' : '#F5F5F5',
  cardBackground: isDarkMode ? '#242426' : '#FFFFFF',
  primaryText: isDarkMode ? '#FFFFFF' : '#333333',
  secondaryText: isDarkMode ? '#B0B0B0' : '#666666',
  tabBarBackground: isDarkMode ? '#242426' : '#FFFFFF',
  iconBackground: isDarkMode ? '#1B1B1C' : '#F5F5F5',
  divider: isDarkMode ? '#2D2D2D' : '#E0E0E0',
  shadow: isDarkMode ? '#000000' : '#000000',
  accent: '#4052D6',
  success: '#1D5F33',
  error: '#F44336',
  sent: '#FF5722',
  received: '#4CAF50',
});

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}-${month}-${year} ${hours}:${minutes}`;
}

const getTransactionType = (operation) => {
  if (operation.type === 'payment') {
      return operation.asset_code || operation.asset_type;
  }

  switch (operation.type) {
      case 'create_account':
          return 'Account Created';
      case 'change_trust':
      case 'change_trust':
          return 'Trust Line';
      case 'manage_sell_offer':
          return 'Sell Offer';
      case 'manage_buy_offer':
          return 'Buy Offer';
      case 'create_account':
          return 'Create Account';
      case 'invoke_host_function':
          return 'Chain Bridge';    
      case 'path_payment_strict_send':
          return `${operation.source_asset_code || 'XLM'}`;
      case 'path_payment_strict_receive':
          return `${operation.destination_asset_code || 'XLM'}`;
      case 'setOptions':
          return 'Settings Update';
      case 'buyCry':
          return `Buy ${operation?.cryptoName||""}`;
      case 'sellCry':
          return `Sell ${operation?.cryptoName||""}`;
      case 'create_claimable_balance':
          return `${operation?.asset?.split(":")[0]||"Claimable Asset"}`;
      default:
          return operation.type.replace(/([A-Z])/g, ' $1').trim();
  }
};



const getTransactionIcon = (type) => {
  switch (type) {
    case 'payment':
      return 'cash-multiple';
    case 'create_account':
      return 'account-plus';
    case 'change_trust':
      return 'shield-check';
    case 'manageSellOffer':
      return 'trending-down';
    case 'manageBuyOffer':
      return 'trending-up';
      case 'path_payment_strict_send':
      case 'path_payment_strict_receive':
      return 'swap-vertical';
    case 'invoke_host_function':
      return 'bridge';  
    case 'setOptions':
      return 'cog';
    case 'sellCry':
      return 'bank-transfer-in';
    case 'buyCry':
      return 'cash-fast';
    case 'create_claimable_balance':
      return 'family-tree'
    default:
      return 'bank-transfer';
  }
};

const TabBar = ({ selectedTab, onTabPress, isDarkMode }) => {
  const colors = getThemeColors(isDarkMode);
  const tabs = [
    { key: 'all', title: 'All', icon: 'history' },
    { key: 'sent', title: 'Sent', icon: 'arrow-top-right' },
    { key: 'received', title: 'Received', icon: 'arrow-bottom-left' },
    { key: 'path', title: 'Swaps', icon: 'swap-vertical' },
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
            color={selectedTab === tab.key ? colors.primaryText : colors.secondaryText}
          />
          <Text
            style={[
              styles.tabText,
              { color: colors.secondaryText },
              selectedTab === tab.key && { color: colors.primaryText }
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
  const navigation=useNavigation();
  const colors = getThemeColors(isDarkMode);
  const operation = item.operations.records[0];
  const [showTx,setshowTx]=useState(false);
  const [showTxHash,setshowTxHash]=useState([]);

console.log(operation)
 
  const isReceived = 
    operation?.to === userPublicKey ||
    operation.type === 'create_account'||operation.type === 'change_trust'||operation.type==='invoke_host_function';

 
  const transactionType =
    operation.type === 'payment' 
      ? operation.asset_type === 'native' 
        ? 'XLM'
        : operation.asset_code || operation.asset_type
      : getTransactionType(operation);

 
  let iconName = getTransactionIcon(operation.type);

 
  let amountText = '0';
  if (operation.type === 'create_claimable_balance') {
    amountText = operation.amount;
  } else if (operation.type === 'payment') {
    amountText = operation.amount;
  } else if (operation.type === 'create_account') {
    amountText = operation.starting_balance;
  }  else if (operation.type === 'invoke_host_function') {
    const resBal= operation.asset_balance_changes?.find(resObj => resObj.to === userPublicKey || resObj.from === userPublicKey && resObj.type === 'transfer') || null;
    amountText = resBal?resBal.amount:'0'
  } else if (operation.type === 'manage_sell_offer' || operation.type === 'manage_buy_offer') {
    amountText = operation.amount;
  }if (operation.type === 'buyCry'||operation.type === 'sellCry') {
    amountText = operation.amount;
  }
  const isPathPayment = operation.type === 'path_payment_strict_send' || operation.type === 'path_payment_strict_receive';

  let assetFrom = '';
  let assetTo = '';
  let amountFrom = '';
  let amountTo = '';

  if (isPathPayment) {
    assetFrom = operation.source_asset_code || (operation.source_asset_type === 'native' ? 'XLM' : operation.source_asset_type);
    assetTo = operation.asset_code || (operation.asset_type === 'native' ? 'XLM' : operation.asset_type);
    amountFrom = operation.source_amount;
    amountTo = operation.amount;
  }

  const txViewrManager = (txId, txType) => {
    console.log("txId, txType",txId, txType)
    if (txType === "invoke_host_function") {
      setshowTxHash([{ chain: "SRB", hash: txId }])
      setshowTx(true);
    }
    else{
      navigation.navigate('StellarTransactionViewer', { transactionPath: txId })
    }
  }
  
  return (
    <>

<TouchableOpacity 
      style={[
        styles.transactionCard,
        { backgroundColor: colors.cardBackground, shadowColor: colors.shadow }
      ]}
      disabled={operation.type === 'sellCry' || operation.type === 'buyCry'}
      onPress={()=>{txViewrManager(item?.operations?.records[0]?.transaction_hash,operation.type)}}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.iconBackground }]}>
        <Icon
          name={
            isReceived && operation.type === "payment"
              ? "arrow-bottom-left"
              : operation.type === "payment"
                ? "arrow-top-right"
                : iconName
          }          
          size={24}
          color={colors.primaryText}
        />
      </View>

      <View style={styles.contentContainer}>
        {!isPathPayment&&<View style={styles.transactionHeader}>
          <Text style={[
            styles.amount,
            { color: colors.primaryText }
          ]}>
            {isReceived||operation.type === 'manage_sell_offer'||operation.type === 'manage_buy_offer'||operation.type === 'sellCry' || operation.type === 'buyCry'|| operation.type === 'create_claimable_balance' ? '' : '-'}{amountText}
          </Text>
        </View>}
        {isPathPayment ? <View style={[styles.transactionDetails,{paddingVertical:5}]}>
        <View style={{marginTop:-3}}>
         <Text style={[styles.type, { color: colors.primaryText }]}>{isPathPayment ? `${assetFrom} to ${assetTo}` : transactionType}</Text>
              <Text style={[styles.date, { color: colors.secondaryText }]}>
            {item.date}
          </Text>
         </View>
          <View>
            <Text style={[styles.amount, { color: colors.primaryText }]}>-{amountFrom}</Text>
            <Text style={[styles.amount, { color: colors.primaryText }]}>+{amountTo}</Text>
          </View>
        </View> :
        <View style={styles.transactionDetails}>
          <View style={{marginTop:-33}}>
          <Text style={[styles.type, { color: colors.primaryText }]}>
            {transactionType}
          </Text>
          <Text style={[styles.date, { color: colors.secondaryText }]}>
            {item.date}
          </Text>
          </View>

          <View style={[
            styles.statusBadge,
            { backgroundColor: item.success ? colors.success : colors.error }
          ]}>
            <Text style={styles.statusText}>
              {item.success ? operation.type==="create_claimable_balance"?"Claimable":'Success' : typeof item.success === "string" ? item.success : 'Failed'}
            </Text>
          </View>
          
        </View>}

        {/* Memo (if exists) */}
        {item.memo && item.memo !== 'No memo' && (
          <Text style={[styles.memo, { color: colors.secondaryText }]} numberOfLines={1}>
            Memo: {item.memo}
          </Text>
        )}
      </View>
    </TouchableOpacity>
      <View style={styles.allBridgeTxCon}>
        <AllbridgeTxTrack txs={showTxHash} isDarkMode={true} showTx={showTx} closeTx={() => { setshowTx(false) }} />
      </View>
    </>
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
                let isReceived = false;

                if (firstOp.type === 'payment') {
                    amount = firstOp.amount;
                    isReceived = firstOp.to === publicKey;
                } else if (firstOp.type === 'create_account') {
                    amount = firstOp.starting_balance;
                    isReceived = true; 
                } else if (firstOp.type === 'invoke_host_function') {
                    const resBal = firstOp.asset_balance_changes?.find(resObj => (resObj.to === publicKey || resObj.from === publicKey) && resObj.type === 'transfer') || null;
                    if (resBal) {
                      if (resBal.to === publicKey) {
                        amount = resBal?resBal.amount:'0'
                        isReceived = true; 
                      } else if (resBal.from === publicKey) {
                        amount = resBal?resBal.amount:'0'
                        isReceived = false;
                      }
                    }
                } else if (['change_trust', 'change_trust', 'create_account','invoke_host_function'].includes(firstOp.type)) {
                    isReceived = true;
                } else if (firstOp.type === 'manage_sell_offer' || firstOp.type === 'manage_buy_offer') {
                   isReceived = false;
                    amount = firstOp.amount;
                }

                return {
                    id: tx.id,
                    date: formatDate(tx.created_at),
                    amount: amount,
                    success: tx.successful,
                    memo: tx.memo || 'No memo',
                    operations: operations,
                    isReceived: isReceived,
                };
            })
        );

// const { res,err } = await authRequest("/users/alchemyOrders", POST);
// if(err){
  setTransactions(processedTransactions);
// }
// if(res.status&&res.total>0)
// {
//   const processedAlcTrs = await Promise.all(
//     res.records.map(async (trans) => {
//       const tx = trans;
//       const type = trans.orderType==="BUY" ? "buyCry" : "sellCry";
//       const amount = trans.orderType==="BUY"? trans.requsetdPayload.amount: trans.requsetdPayload.cryptoAmount;
//       const operation = {
//         type,
//         amount,
//         cryptoName:trans.orderType==="BUY"? trans.requsetdPayload.cryptoCurrency: trans.requsetdPayload.crypto
//       };
  
//       return {
//         id: tx.orderId || '',
//         date: formatDate(tx.createdAt),
//         amount:amount,
//         success: trans.status,
//         memo: 'No memo',
//         operations: {
//           records: [operation],
//         },
//         isReceived:false,
//       };
//     })  
//   );
//    setTransactions([]);
//    const  margingBothData=[...processedTransactions,...processedAlcTrs];
//    setTransactions(margingBothData);
// }


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
          const opType = tx.operations.records[0].type;

          if (selectedTab === 'all') return true;

          if (selectedTab === 'sent') {
            return (
              !tx.isReceived &&
              opType !== 'path_payment_strict_send' &&
              opType !== 'path_payment_strict_receive' &&
              opType !== 'sellCry' && opType !== 'buyCry'
            );
          }

          if (selectedTab === 'received') {
            return (
              tx.isReceived &&
              opType !== 'path_payment_strict_send' &&
              opType !== 'path_payment_strict_receive' &&
              opType !== 'sellCry' && opType !== 'buyCry'
            );
          }

          if (selectedTab === 'path') {
            return (
              opType === 'path_payment_strict_send' ||
              opType === 'path_payment_strict_receive'
            );
          }

          return true;
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
          <Icon name="history" size={60} color={colors.primaryText} />
          <Text style={[styles.emptyText,{color:colors.primaryText}]}>No transactions found</Text>
          <Text style={[styles.emptySubText,{color:colors.secondaryText}]}>Your transactions will appear here.</Text>
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
    flexDirection: 'row',
    overflow: 'hidden'
  },
  iconContainer: {
    width: 63,
    height:63,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius:10,
    alignSelf:"center",
    marginLeft:10
  },
  contentContainer: {
    flex: 1,
    padding: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent:"flex-end",
    alignItems: 'center',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
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
  allBridgeTxCon:{
    zIndex:20,
    position:"absolute",
    width:"100%",
    maxHeight:"50%",
    bottom:25
  }
});

export default StellarTransactionHistory;