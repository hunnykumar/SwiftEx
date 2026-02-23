import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Image,
  FlatList,
  ActivityIndicator,
  Keyboard,
} from 'react-native';

import { useSelector } from 'react-redux';
import { colors } from '../../../../../Screens/ThemeColorsConfig';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { Exchange_screen_header } from '../../../../reusables/ExchangeHeader';
import { useNavigation } from '@react-navigation/native';
import Icon from '../../../../../icon';
import { getTokenBalancesUsingAddress } from '../utils/getWalletInfo/EtherWalletService';
import { GetStellarAvilabelBalance, GetStellarUSDCAvilabelBalance, stellarWalletStatus } from '../../../../../utilities/StellarUtils';
import { getChainTokenData, swapPepare } from '../../../../../utilities/AllbridgeUtil';
import { alert } from '../../../../reusables/Toasts';
import { debounce } from 'lodash';
import LocalTxManager from '../../../../../utilities/LocalTxManager';
import CustomInfoProvider from './CustomInfoProvider';
import WalletActivationComponent from '../utils/WalletActivationComponent';
import { swap_prepare } from '../../../../../../All_bridge';
import { SwapPepare } from '../../../../../utilities/AllbridgeBscUtil';

const classic = ({ props }) => {
  const navigation = useNavigation();
  const state = useSelector((state) => state);
  const theme = state.THEME.THEME ? colors.dark : colors.light;
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.bg,
    },
    scrollView: {
      flex: 1,
    },
    card: {
      paddingHorizontal: wp(3),
      paddingVertical: hp(2)
    },
    section: {
      marginBottom: hp(1),
      paddingHorizontal: wp(3),
      paddingVertical: hp(2),
      borderRadius: 13,
      backgroundColor: theme.cardBg
    },
    toSection: {
      marginTop: 8,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    networkHeader: {
      flexDirection: 'column',
      alignItems: "flex-start",
      width:wp(50)
    },
    labelText: {
      color: theme.headingTx,
      fontSize: 14,
      fontWeight: '500',
      textAlign: "center"
    },
    networkSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.bg,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 9,
      gap: 8,
      borderWidth: 1,
      borderColor: theme.inactiveTx,
    },
    networkIcon: {
      width: 25,
      height: 25,
      borderRadius: 12,
    },
    networkName: {
      color: theme.headingTx,
      fontSize: 16,
      fontWeight: '600',
    },
    balanceText: {
      color: theme.inactiveTx,
      fontSize: 13,
      marginBottom: 16,
      marginTop: -10
    },
    balanceAmount: {
      color: theme.headingTx,
    },
    assetContainer: {
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: "space-between",
      borderColor: theme.inactiveTx,
      borderWidth: 1,
      marginTop: hp(1.4),
      paddingHorizontal: wp(1),
      backgroundColor: theme.bg
    },
    assetSelector: {
      width: wp(40),
      flexDirection: 'row',
      alignItems: 'center',
      borderTopLeftRadius: 12,
      paddingHorizontal: wp(2),
      paddingVertical: hp(0.8),
      gap: 10,
    },
    assetIconLarge: {
      width: wp(9),
      height: hp(4),
      borderRadius: 20,
    },
    assetInfo: {
      flex: 1,
    },
    assetLabel: {
      color: theme.inactiveTx,
      fontSize: 12,
    },
    assetName: {
      color: theme.headingTx,
      fontSize: 18,
      fontWeight: '600',
    },
    addButton: {
      padding: 4,
    },
    amountContainer: {
      backgroundColor: theme.bg,
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12,
      padding: 16,
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between"
    },
    amountInput: {
      color: theme.headingTx,
      fontSize: 20,
    },
    availableContainer: {
      alignItems: 'flex-end',
      gap: 8,
      width:wp(30)
    },
    availableLabel: {
      color: theme.headingTx,
      fontSize: 14,
    },
    availableAmount: {
      color: theme.headingTx,
      fontSize: 14,
      fontWeight: '500',
    },
    walletAddress: {
      fontSize: 14,
      color: theme.headingTx,
    },
    usdcContainer: {
      marginTop: hp(2),
      flexDirection: "row",
      alignItems: "center",
    },
    toAssetSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.bg,
      padding: 11,
      borderRadius: 12,
      gap: 8,
      borderWidth: 1,
      borderColor: theme.inactiveTx,
      width: wp(38)
    },
    usdcIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
    },
    toAssetInfo: {
      flex: 1,
    },
    usdcName: {
      color: theme.headingTx,
      fontSize: 18,
      fontWeight: '600',
    },
    usdcSource: {
      color: theme.inactiveTx,
      fontSize: 12,
    },
    relayerFeeContainer: {
      marginLeft: wp(2)
    },
    relayerFeeLabel: {
      color: theme.headingTx,
      fontSize: 15,
      marginTop: hp(-1),
      marginVertical: hp(0.5)
    },
    feeButtons: {
      flexDirection: 'row',
    },
    feeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.bg,
      paddingVertical: 9,
      paddingHorizontal: wp(3.3)
    },
    gasFeeNativeCon: {
      borderTopLeftRadius: 10,
      borderBottomLeftRadius: 10
    },
    gasFeeStableCon: {
      borderTopRightRadius: 10,
      borderBottomRightRadius: 10,
    },
    feeButtonActive: {
      backgroundColor: '#4F46E5',
      borderColor: '#4F46E5',
    },
    feeButtonText: {
      color: theme.inactiveTx,
      fontSize: 14,
      fontWeight: '600',
    },
    feeButtonTextActive: {
      color: "#fff",
    },
    feeIconSmall: {
      width: 25,
      height: 25,
      borderRadius: 15,
    },
    toAmountContainer: {
      marginTop: hp(1.3),
      borderRadius: 10,
      paddingVertical: hp(2),
      paddingHorizontal: wp(2.4),
      backgroundColor: theme.bg,
      flexDirection: "row"
    },
    toAmount: {
      color: theme.inactiveTx,
      fontSize: 20,
      fontWeight: '400',
    },
    toAmountUsd: {
      color: theme.inactiveTx,
      fontSize: 14,
      fontWeight: '400',
      marginTop: hp(1)
    },
    toAmountSubContainer: {
      flexDirection: "row",
      justifyContent: "space-between"
    },
    minAmount: {
      color: theme.inactiveTx,
      fontSize: 13,
      textAlign: 'right',
    },
    confirmButton: {
      paddingVertical: 18,
      borderRadius: 16,
      alignItems: 'center',
      marginTop: 12,
    },
    confirmButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: '600',
    },


    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      justifyContent: 'flex-end',
    },
    modalContainer: {
      backgroundColor: theme.bg,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '70%',
      borderWidth: 1,
      borderColor: theme.bg,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.bg,
    },
    modalTitle: {
      color: theme.headingTx,
      fontSize: 18,
      fontWeight: '600',
    },
    modalList: {
      padding: 16,
    },
    modalItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.bg,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.inactiveTx,
    },
    modalItemIcon: {
      width: wp(10),
      height: hp(4.5),
      borderRadius: 20,
      marginRight: 12,
    },
    modalItemInfo: {
      flex: 1,
    },
    modalItemText: {
      color: theme.headingTx,
      fontSize: 14,
      fontWeight: '600',
    },
    modalItemSubtext: {
      color: theme.inactiveTx,
      fontSize: 12,
      marginTop: 2,
    },
    optionCon: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      width: wp(36)
    },
    optioBtn: {
      backgroundColor: "#4052D6",
      height: hp(4),
      width: wp(16),
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 10
    },
    quoteRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    quoteLabel: {
      fontSize: 14,
      color: theme.inactiveTx,
      fontWeight: "500"
    },
    quoteValue: {
      color: theme.headingTx,
      fontSize: 14,
      fontWeight: '500',
    },
    quoteHeading: {
      color: theme.headingTx,
      fontSize: 19,
      fontWeight: '500',
      marginBottom: hp(1)
    },
    quotesLoadingCon: {
      flexDirection: "row",
      justifyContent: "center",
      alignContent: "center",
      paddingHorizontal: wp(3),
      paddingVertical: hp(2),
      borderRadius: 13,
      backgroundColor: theme.cardBg
    },
    quotesLoadingConTxt: {
      color: "#4F46E5",
      fontSize: 20,
      fontWeight: '500',
    }
  });
  const chooseItemList = [
    { id: 1, chainName: "ETH", subName: "ETH", name: "Ethereum", url: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png", walletAddress: state?.wallet?.address },
    { id: 2, chainName: "BSC", subName: "BNB", name: "BNB", url: "https://tokens.pancakeswap.finance/images/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c.png", walletAddress: state?.wallet?.address },
    { id: 3, chainName: "SRB", subName: "STR", name: "Stellar", url: "https://stellar.myfilebase.com/ipfs/QmSTXU2wn1USnmd5ZypA5zMze259wEPSDP3i8wivyr9qiq", walletAddress: state?.STELLAR_PUBLICK_KEY },
  ];

  const bscSupportTokens = [
    {
      "name": "Binance USDT",
      "symbol": "USDT",
      "address": "0x55d398326f99059fF775485246999027B3197955",
      "chainId": 56,
      "decimals": 18,
      "logoURI": "https://tokens.pancakeswap.finance/images/0x55d398326f99059fF775485246999027B3197955.png"
    },
    {
      "name": "Binance USDC",
      "symbol": "USDC",
      "address": "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
      "chainId": 56,
      "decimals": 18,
      "logoURI": "https://tokens.pancakeswap.finance/images/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d.png"
    }
  ];

  const ethSupportTokens = [
    {
      "name": "Tether USD",
      "address": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      "symbol": "USDT",
      "decimals": 6,
      "chainId": 1,
      "logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png"
    },
    {
      "name": "USDCoin",
      "address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "symbol": "USDC",
      "decimals": 6,
      "chainId": 1,
      "logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"
    }
  ];

  const stellarSupportTokens = [
    {
      name: "USDC (Centre)",
      symbol: "USDC",
      address: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
      decimals: 6,
      logoURI: "https://tokens.pancakeswap.finance/images/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d.png"
    }
  ];

  const [fromAmount, setFromAmount] = useState(0.0);
  const [selectedRelayerFee, setSelectedRelayerFee] = useState('native');
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [showFromAssetModal, setShowFromAssetModal] = useState(false);
  const [showToAssetModal, setShowToAssetModal] = useState(false);
  const [modalType, setModalType] = useState('from');
  const [selectedFromNetwork, setSelectedFromNetwork] = useState(chooseItemList[1]);
  const [selectedToNetwork, setSelectedToNetwork] = useState(chooseItemList[2]);
  const [selectedFromAsset, setSelectedFromAsset] = useState(bscSupportTokens[0]);
  const [selectedToAsset, setSelectedToAsset] = useState(stellarSupportTokens[0]);
  const [showOption, setShowOption] = useState(false);
  const [balanceLoading, setbalanceLoading] = useState(false);
  const [fromBalance, setFromBalance] = useState(0.0);
  const [pairQuotes, setPairQuotes] = useState(null);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [swapLoading,setSwapLoading] = useState(false);
  const [showWalletActivation,setShowWalletActivation] = useState(false);
  const [walletActivationWarning,setWalletActivationWarning] = useState(false);

  const getFromNetworkTokens = () => {
    if (selectedFromNetwork.subName === 'BNB') {
      return bscSupportTokens;
    } else if (selectedFromNetwork.subName === 'ETH') {
      return ethSupportTokens;
    } else if (selectedFromNetwork.subName === 'STR') {
      return stellarSupportTokens;
    }
    return [];
  };


  const getToNetworkTokens = () => {
    if (selectedToNetwork.subName === 'BNB') {
      return bscSupportTokens;
    } else if (selectedToNetwork.subName === 'ETH') {
      return ethSupportTokens;
    } else if (selectedToNetwork.subName === 'STR') {
      return stellarSupportTokens;
    }
    return [];
  };


  useEffect(() => {
    let toAsset = null;
    if (selectedToNetwork.subName === 'BNB') {
      toAsset = bscSupportTokens[0];
    } else if (selectedToNetwork.subName === 'ETH') {
      toAsset = ethSupportTokens[0];
    } else if (selectedToNetwork.subName === 'STR') {
      toAsset = stellarSupportTokens[0];
    }
    setSelectedToAsset(toAsset);
  }, [selectedToNetwork]);

  useEffect(() => {
    const initService = async () => {
      if (fromAmount) {
        setQuotesLoading(true);
        await fetchPairQuotes(selectedFromNetwork.chainName, selectedToNetwork.chainName, selectedFromAsset.symbol, selectedToAsset.symbol, fromAmount);
      }
      await fetchSelectedTokenBalance()
    }
    initService();
  }, [selectedFromAsset, selectedFromNetwork,selectedToAsset,selectedToNetwork]);

  useEffect(() => {
    const init = async () => {
      const walletStatus = await stellarWalletStatus(state?.STELLAR_PUBLICK_KEY);
      setShowWalletActivation(walletStatus);
    }
    init()
  }, [])

  const handleNetworkSelect = (network) => {
    if (modalType === 'from') {
      setSelectedFromNetwork(network);
      if (network.subName === 'BNB') {
        setSelectedFromAsset(bscSupportTokens[0]);
      } else if (network.subName === 'ETH') {
        setSelectedFromAsset(ethSupportTokens[0]);
      } else if (network.subName === 'STR') {
        setSelectedFromAsset(stellarSupportTokens[0]);
      }
    } else {
      setSelectedToNetwork(network);
    }
    setShowNetworkModal(false);
  };

  const handleFromAssetSelect = (asset) => {
    setSelectedFromAsset(asset);
    setShowFromAssetModal(false);
  };

  const handleToAssetSelect = (asset) => {
    setSelectedToAsset(asset);
    setShowToAssetModal(false);
  };

  const openNetworkModal = (type) => {
    setModalType(type);
    setShowNetworkModal(true);
  };

  const fetchSelectedTokenBalance = async () => {
    try {
      setbalanceLoading(true);
      switch (selectedFromNetwork.subName) {
        case "ETH":
        case "BNB":
          const evmBalance = await getTokenBalancesUsingAddress(selectedFromAsset.address, selectedFromNetwork.walletAddress, selectedFromNetwork.subName === "ETH" ? selectedFromNetwork.subName : "BSC");
          setFromBalance(evmBalance.status ? evmBalance.tokenInfo[0] : 0.0);
          setbalanceLoading(false);
          break;
        case "STR":
          const nativeBalance = await GetStellarAvilabelBalance(selectedFromNetwork.walletAddress);
          const tokenBalance = await GetStellarUSDCAvilabelBalance(selectedFromNetwork.walletAddress, selectedFromAsset.symbol, selectedFromAsset.address);
          if (nativeBalance.availableBalance && tokenBalance.availableBalance) {
            setFromBalance({
              walletBalance: nativeBalance.availableBalance ? parseFloat(nativeBalance.availableBalance) : 0.0,
              tokenBalance: tokenBalance.availableBalance ? parseFloat(tokenBalance.availableBalance) : 0.0
            });
          }
          setbalanceLoading(false);
          break;
        default:
          setFromBalance(0.0);
          setbalanceLoading(false);
          break;
      }
    } catch (error) {
      setbalanceLoading(false);
      console.error("Error fetching balance:", error);
    }
  };

  const handleInputChange = async (value) => {
    const replaceComma = value.replace(',', '.');
    const cleanValue = replaceComma.replace(/[^0-9.]/g, '');
    setFromAmount(cleanValue)
    if (parseFloat(cleanValue) === 0 || !cleanValue) {
      return;
    }
    setQuotesLoading(true);
    fetchPairQuotes(selectedFromNetwork.chainName, selectedToNetwork.chainName, selectedFromAsset.symbol, selectedToAsset.symbol, cleanValue);
  }
  const fetchPairQuotes = useCallback(
    debounce(async (sourceChainName, destChainName, sourceTokenSymbol, destTokenSymbol, qouteValue) => {
      const qoutesRep = await getChainTokenData(sourceChainName, destChainName, sourceTokenSymbol, destTokenSymbol, qouteValue);
      if (qoutesRep.success) {
        setPairQuotes(qoutesRep.info);
        setQuotesLoading(false);
        Keyboard.dismiss();
      } else {
        setQuotesLoading(false);
        setPairQuotes(null);
        Keyboard.dismiss();
        alert("error", qoutesRep.error)
      }
    }, 500),
    []
  );

  const nextStep=()=>{
    setSwapLoading(false);
    navigation.navigate("StellarTransactions");
  }

  const swapManager = async () => {
    Keyboard.dismiss();
    if(selectedFromNetwork.chainName!==selectedToNetwork.chainName){
      if (parseFloat(fromAmount) <= 0) {
        CustomInfoProvider.show("error","Please enter a valid amount.");
      } else {
        if (selectedFromNetwork.subName === "STR") {
          await executeNonEvmSwap();
        } else {
          await executeSwap();
        }
      }
    }else{
      CustomInfoProvider.show("error","The source and destination networks cannot be the same.");
    }
  }

  const executeNonEvmSwap=async()=>{
    console.debug("executeNonEvmSwap");
    setSwapLoading(true);
     try {
      const stellarWallet = {
        publicKey: state && state.STELLAR_PUBLICK_KEY
      };
      const result = await swapPepare(
        selectedFromNetwork.chainName,
        selectedToNetwork.chainName,
        selectedFromAsset.symbol,
        selectedToAsset.symbol,
        fromAmount,
        selectedToNetwork.walletAddress,
        stellarWallet,
        selectedRelayerFee
      );
      console.debug("swap-result->", result)
      if (result.success) {
        setSwapLoading(false);
        CustomInfoProvider.show("success", "Bridge Successfull.", [
          { text: "Okay", onPress: nextStep },
        ]);
      } else {
        setSwapLoading(false);
        CustomInfoProvider.show("error", result.error||"Bridge Faild.");
        console.debug("Bridge Faild:-", result);
      }
    } catch (error) {
      setSwapLoading(false);
      console.error("error in Bridge swap execute:", error)
      CustomInfoProvider.show("error","Bridge Faild.");
    }
  }

  const executeSwap = async () => {
    console.debug("executeSwap");
    setSwapLoading(true);
    try {
      const resultOfBidirectional = selectedFromNetwork.chainName === "ETH" ? await swap_prepare(
        state?.wallet?.address,
        selectedFromNetwork.walletAddress,
        selectedToNetwork.walletAddress,
        fromAmount.toString(),
        selectedFromAsset.symbol,
        selectedToAsset.symbol,
        selectedFromNetwork.chainName === "BSC" ? "BNB" : selectedFromNetwork.chainName,
        selectedRelayerFee,
        selectedToNetwork.chainName === "BSC" ? "BNB" : selectedToNetwork.chainName,
      ) : await SwapPepare(
        state?.wallet?.address,
        state?.wallet?.address,
        selectedToNetwork.walletAddress,
        fromAmount.toString(),
        selectedFromAsset.symbol,
        selectedToAsset.symbol,
        selectedFromNetwork.chainName === "BSC" ? "BNB" : selectedFromNetwork.chainName,
        selectedRelayerFee,
        selectedToNetwork.chainName === "BSC" ? "BNB" : selectedToNetwork.chainName,
      );
      console.debug("swap bidirectional response:", resultOfBidirectional);
      if (resultOfBidirectional?.status_task) {
        const { res } = resultOfBidirectional;
        const txHashes = [];
        if (res.approvalTxHash) {
          await LocalTxManager.saveTx(
            state && state.wallet && state.wallet.address,
            {
              chain: selectedFromNetwork.chainName,
              hash: res.approvalTxHash,
              status: "pending",
              statusColor: "#eec14fff",
              type: "approval",
              timestamp: Date.now()
            }
          );
          txHashes.push({
            chain: selectedFromNetwork.chainName,
            hash: res.approvalTxHash,
            type: "Approval"
          });
        }
        await LocalTxManager.saveTx(
          state && state.wallet && state.wallet.address,
          {
            chain: selectedFromNetwork.chainName,
            hash: res.transferTxHash,
            status: "pending",
            statusColor: "#eec14fff",
            type: "transfer",
            timestamp: Date.now()
          }
        );
        txHashes.push({
          chain: selectedFromNetwork.chainName,
          hash: res.transferTxHash,
          type: "Transfer"
        });
        CustomInfoProvider.show("success", "Bridge Successfull.", [
          { text: "Okay", onPress: nextStep },
        ]);
      } else {
        setSwapLoading(false);
        console.error("Transaction failed:", resultOfBidirectional?.res);
        CustomInfoProvider.show("error", resultOfBidirectional?.res||"Bridge Faild.");
      }
    } catch (error) {
      setSwapLoading(false);
      console.error("Transaction error:", error);
      CustomInfoProvider.show("error", "Bridge Faild.");
    }
  }

  return (
    <View style={styles.container}>
      <WalletActivationComponent
       isVisible={showWalletActivation}
       onClose={() => {setWalletActivationWarning(true),setShowWalletActivation(false)}}
       onActivate={()=>{setWalletActivationWarning(true),setShowWalletActivation(false)}}
       navigation={navigation}
       appTheme={state.THEME.THEME}
       shouldNavigateBack={true}
      />
      <Exchange_screen_header
        title="Bridge"
        onLeftIconPress={() => navigation.goBack()}
        onRightIconPress={() => {
          console.log("Right icon pressed");
        }}
      />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.section}>
            <View style={styles.headerRow}>
              <View style={styles.networkHeader}>
                <Text style={styles.labelText}>From Network</Text>
                {balanceLoading ? <ActivityIndicator size={"small"} color={"green"} /> : 
                <View style={{flexDirection:"row"}}>
                <Text style={styles.balanceAmount}>{selectedFromNetwork.subName} Balance : </Text>
                 <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                   <Text style={styles.balanceAmount}>
                   {fromBalance ? parseFloat(fromBalance?.walletBalance) : "0.000"}
                   </Text>
                   </ScrollView>
                </View>
                }
              </View>
              <TouchableOpacity
                style={styles.networkSelector}
                onPress={() => openNetworkModal('from')}
              >
                <Image
                  source={{ uri: selectedFromNetwork.url }}
                  style={styles.networkIcon}
                />
                <Text style={styles.networkName}>{selectedFromNetwork.subName}</Text>
                <Icon type="ionicon" name="chevron-down" size={20} color={theme.headingTx} />
              </TouchableOpacity>
            </View>

            <View style={styles.assetContainer}>
              <TouchableOpacity
                style={styles.assetSelector}
                onPress={() => setShowFromAssetModal(true)}
              >
                <Image
                  source={{ uri: selectedFromAsset.logoURI }}
                  style={styles.assetIconLarge}
                />
                <View style={styles.assetInfo}>
                  <Text style={styles.assetLabel}>Assets</Text>
                  <Text style={styles.assetName}>{selectedFromAsset.symbol}</Text>
                </View>
                <Icon type="ionicon" name="chevron-down" size={20} color={theme.headingTx} />
              </TouchableOpacity>
              {showOption && <View style={styles.optionCon}>
                <TouchableOpacity style={styles.optioBtn} onPress={() => { navigation.navigate("EthSwap", { activeNetwork: selectedFromNetwork.subName, activeAsset: selectedFromAsset }) }}>
                  <Text style={[styles.amountInput, { color: "#fff" }]}>Swap</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.optioBtn, { backgroundColor: "#fff" }]} onPress={() => { navigation.navigate("KycComponent", { cryptoRequest: selectedFromAsset.symbol, cryptoRequestChain: selectedFromNetwork.subName }) }}>
                  <Text style={[styles.amountInput, { color: "#4052D6" }]}>Buy</Text>
                </TouchableOpacity>
              </View>}
              <TouchableOpacity style={styles.addButton} onPress={() => { setShowOption(!showOption ? true : false) }}>
                <Icon type="ionicon" name={showOption ? "close-circle-outline" : "add-circle-outline"} size={28} color={theme.headingTx} />
              </TouchableOpacity>
            </View>

            <View style={styles.amountContainer}>
              <TextInput
                style={styles.amountInput}
                placeholder={`Enter ${selectedFromAsset.symbol} amount`}
                placeholderTextColor={theme.inactiveTx}
                value={fromAmount}
                onChangeText={(value) => { handleInputChange(value) }}
                keyboardType="numeric"
                returnKeyType="done"
              />
              <View style={styles.availableContainer}>
                <TouchableOpacity style={{ flexDirection: "row" }} onPress={async () => { await fetchSelectedTokenBalance() }}>
                  <Text style={styles.availableLabel}>Available</Text>
                  <Icon type="ionicon" name="refresh" size={16} color={theme.headingTx} />
                </TouchableOpacity>
                {balanceLoading ? <ActivityIndicator size={"small"} color={"green"} /> :
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <Text style={styles.availableAmount}>{fromBalance ? parseFloat(fromBalance?.tokenBalance) : "0.000"}</Text>
                  </ScrollView>}
              </View>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Text style={styles.walletAddress} numberOfLines={1}>Active Wallet : </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: wp(70) }}>
                <Text style={styles.walletAddress} numberOfLines={1}>{selectedFromAsset.chainId===56||selectedFromAsset.chainId===1?state && state.wallet && state.wallet.address:state && state.STELLAR_PUBLICK_KEY}</Text>
              </ScrollView>
            </View>
          </View>

          <View style={[styles.section, styles.toSection]}>
            <View style={styles.headerRow}>
              <View style={[styles.networkHeader, { marginTop: hp(-1.5) }]}>
                <Text style={styles.labelText}>To Network</Text>

              </View>
              <TouchableOpacity
                style={styles.networkSelector}
                onPress={() => openNetworkModal('to')}
                disabled={true}
              >
                <Image
                  source={{ uri: selectedToNetwork.url }}
                  style={styles.networkIcon}
                />
                <Text style={styles.networkName}>Stellar</Text>
              </TouchableOpacity>
            </View>

            {selectedToAsset && (
              <View style={styles.usdcContainer}>
                <TouchableOpacity
                  style={[styles.toAssetSelector,{borderWidth: 0}]}
                  onPress={() => setShowToAssetModal(true)}
                  disabled={true}
                >
                  <Image
                    source={{ uri: selectedToAsset.logoURI }}
                    style={styles.assetIconLarge}
                  />
                  <View style={styles.toAssetInfo}>
                    <Text style={styles.assetLabel}>Assets</Text>
                    <Text style={styles.usdcName}>{selectedToAsset.symbol}</Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.relayerFeeContainer}>
                  <Text style={styles.relayerFeeLabel}>Relayer Fee <Icon name={"gas-station"} type={"materialCommunity"} size={16} color={theme.headingTx} /></Text>
                  <View style={styles.feeButtons}>
                    <TouchableOpacity
                      style={[
                        styles.feeButton,
                        selectedRelayerFee === 'native' && styles.feeButtonActive,
                        styles.gasFeeNativeCon
                      ]}
                      onPress={() => setSelectedRelayerFee('native')}
                    >
                      <Image
                        source={{ uri: selectedFromNetwork.url }}
                        style={styles.feeIconSmall}
                      />
                      <Text style={[
                        styles.feeButtonText,
                        selectedRelayerFee === 'native' && styles.feeButtonTextActive
                      ]}> Native</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.feeButton,
                        selectedRelayerFee === 'stablecoin' && styles.feeButtonActive,
                        styles.gasFeeStableCon
                      ]}
                      onPress={() => setSelectedRelayerFee('stablecoin')}
                    >
                      <Image
                        source={{ uri: selectedFromAsset.logoURI }}
                        style={styles.feeIconSmall}
                      />
                      <Text style={[
                        styles.feeButtonText,
                        selectedRelayerFee === 'stablecoin' && styles.feeButtonTextActive
                      ]}> {selectedFromAsset.symbol}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.toAmountContainer}>
              <Text style={styles.toAmount}>≈ </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Text style={styles.toAmount}>{pairQuotes ? selectedRelayerFee === "native" ? pairQuotes?.minimumAmountOut : Math.max(0,parseFloat(pairQuotes?.minimumAmountOut || "0") - parseFloat(pairQuotes?.fee[selectedRelayerFee].amount)) : `${selectedToAsset.symbol} will be recived`}</Text>
              </ScrollView>
              <Text style={styles.toAmount}>{selectedToAsset.symbol}</Text>
            </View>
          </View>

          {quotesLoading && <View style={styles.quotesLoadingCon}>
            <ActivityIndicator color={"#4F46E5"} size={"small"} />
            <Text style={styles.quotesLoadingConTxt}> Please wait...</Text>
          </View>}

          {pairQuotes && !quotesLoading && <View style={[styles.section, styles.toSection]}>
            <Text style={styles.quoteHeading}>Quote Details</Text>
            <View style={styles.quoteRow}>
              <Text style={[styles.quoteLabel, { color: theme.inactiveTx }]}>Provider</Text>
              <Text style={[styles.quoteValue, { color: theme.headingTx }]}>Allbridge</Text>
            </View>
            <View style={styles.quoteRow}>
              <Text style={[styles.quoteLabel, { color: theme.inactiveTx }]}>Conversion Rate</Text>
              <Text style={[styles.quoteValue, { color: theme.headingTx }]}>1 {selectedFromAsset.symbol} = {pairQuotes.conversionRate} {selectedToAsset.symbol}</Text>
            </View>
            <View style={styles.quoteRow}>
              <Text style={[styles.quoteLabel, { color: theme.inactiveTx }]}>Slippage</Text>
              <Text style={[styles.quoteValue, { color: theme.headingTx }]}>1%</Text>
            </View>
            <View style={styles.quoteRow}>
              <Text style={[styles.quoteLabel, { color: theme.inactiveTx }]}>Minimum Received</Text>
              <Text style={[styles.quoteValue, { color: theme.headingTx }]}>{parseFloat(pairQuotes.minimumAmountOut).toFixed(5)} {selectedToAsset.symbol}</Text>
            </View>
            <View style={styles.quoteRow}>
              <Text style={[styles.quoteLabel, { color: theme.inactiveTx }]}>Network Fee</Text>
              <Text style={[styles.quoteValue, { color: theme.headingTx }]}>{parseFloat(pairQuotes.fee[selectedRelayerFee].amount).toFixed(5)} {pairQuotes.fee[selectedRelayerFee].symbol}</Text>
            </View>
            <View style={styles.quoteRow}>
              <Text style={[styles.quoteLabel, { color: theme.inactiveTx }]}>Estimated time</Text>
              <Text style={[styles.quoteValue, { color: theme.headingTx }]}>{pairQuotes.completionTime}</Text>
            </View>
          </View>}

          <TouchableOpacity style={[styles.confirmButton, { backgroundColor: walletActivationWarning||quotesLoading||swapLoading||parseFloat(fromAmount) <= 0 || parseFloat(fromAmount) > (selectedRelayerFee==="native"?parseFloat(fromBalance?.walletBalance):parseFloat(fromBalance?.tokenBalance)) ? theme.inactiveTx : "#4F46E5" }]} disabled={walletActivationWarning||quotesLoading||swapLoading||parseFloat(fromAmount) <= 0 || parseFloat(fromAmount) > (selectedRelayerFee==="native"?parseFloat(fromBalance?.walletBalance):parseFloat(fromBalance?.tokenBalance))} onPress={()=>{swapManager()}}>
            <Text style={styles.confirmButtonText}>
              {walletActivationWarning ? "Stellar wallet Activation Required" :
                swapLoading ? "Wait transaction under process..." :
                  parseFloat(fromAmount) +
                    parseFloat(pairQuotes?.fee?.native?.amount || 0) +
                    0.0015 >
                    parseFloat(selectedRelayerFee === "native" ?
                      fromBalance?.walletBalance :
                      fromBalance?.tokenBalance
                    ) ? "Insufficient Balance" : "Confirm Transaction"
              }
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showNetworkModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNetworkModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select {modalType === 'from' ? 'From' : 'To'} Network
              </Text>
              <TouchableOpacity onPress={() => setShowNetworkModal(false)}>
                <Icon type="ionicon" name="close" size={24} color={theme.headingTx} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={chooseItemList.slice(0,2)}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleNetworkSelect(item)}
                >
                  <Image source={{ uri: item.url }} style={styles.modalItemIcon} />
                  <Text style={styles.modalItemText}>{item.name}</Text>
                  {((modalType === 'from' && selectedFromNetwork.id === item.id) ||
                    (modalType === 'to' && selectedToNetwork.id === item.id)) && (
                      <Icon type="ionicon" name="checkmark-circle" size={24} color="#4F46E5" />
                    )}
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.modalList}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={showFromAssetModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFromAssetModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select From Asset</Text>
              <TouchableOpacity onPress={() => setShowFromAssetModal(false)}>
                <Icon type="ionicon" name="close" size={24} color={theme.headingTx} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={getFromNetworkTokens()}
              keyExtractor={(item) => item.address}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleFromAssetSelect(item)}
                >
                  <Image source={{ uri: item.logoURI }} style={styles.modalItemIcon} />
                  <View style={styles.modalItemInfo}>
                    <Text style={styles.modalItemText}>{item.symbol}</Text>
                    <Text style={styles.modalItemSubtext}>{item.name}</Text>
                  </View>
                  {selectedFromAsset.address === item.address && (
                    <Icon type="ionicon" name="checkmark-circle" size={24} color="#4F46E5" />
                  )}
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.modalList}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={showToAssetModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowToAssetModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select To Asset</Text>
              <TouchableOpacity onPress={() => setShowToAssetModal(false)}>
                <Icon type="ionicon" name="close" size={24} color={theme.headingTx} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={getToNetworkTokens()}
              keyExtractor={(item) => item.address}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleToAssetSelect(item)}
                >
                  <Image source={{ uri: item.logoURI }} style={styles.modalItemIcon} />
                  <View style={styles.modalItemInfo}>
                    <Text style={styles.modalItemText}>{item.symbol}</Text>
                    <Text style={styles.modalItemSubtext}>{item.name}</Text>
                  </View>
                  {selectedToAsset.address === item.address && (
                    <Icon type="ionicon" name="checkmark-circle" size={24} color="#4F46E5" />
                  )}
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.modalList}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default classic;