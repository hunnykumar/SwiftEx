import React, { useCallback, useEffect, useState } from 'react';
import { Modal, View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, TextInput, Image, Platform, Keyboard, Alert, BackHandler, TouchableWithoutFeedback, KeyboardAvoidingView } from 'react-native';
import Icon from "../../../../../icon";
import { FlatList, useToast } from 'native-base';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { ScrollView } from 'react-native-gesture-handler';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { REACT_PROXY_HOST } from '../ExchangeConstants';
import WalletActivationComponent from '../utils/WalletActivationComponent';
import { getToken, PPOST, proxyRequest } from '../api';
import { ShowErrotoast } from '../../../../reusables/Toasts';
import { swap_prepare } from '../../../../../../All_bridge';
import { Exchange_screen_header } from '../../../../reusables/ExchangeHeader';
import { ethers } from 'ethers';
import { debounce } from 'lodash';
import { fetchBSCTokenInfo, fetchTokenInfo } from '../../../../../ethSwap/tokenUtils';
import { SwapPepare } from '../../../../../utilities/AllbridgeBscUtil';
import CustomInfoProvider from './CustomInfoProvider';
import AllbridgeTxTrack from './AllbridgeTxTrack';
import { convertMultiple } from '../utils/UsdPriceHandler';
import { colors } from '../../../../../Screens/ThemeColorsConfig';
import tokenList from "../../../../../Dashboard/tokens/tokenList.json";
import PancakeList from "../../../../../Dashboard/tokens/pancakeSwap/PancakeList.json";

const classic = ({ route }) => {
  const toast = useToast();
  const navigation = useNavigation();
  const { Asset_type } = route.params;
  const TEMPCHOSE = Asset_type === "ETH" ? "Ethereum" : Asset_type === "BNB" ? "BNB" : Asset_type;
  const state = useSelector((state) => state);

  const chooseItemList = [
    { id: 1, name: "Ethereum", url: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png" },
    { id: 2, name: "BNB", url: "https://tokens.pancakeswap.finance/images/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c.png" },
  ];

  const defaultUsdts = [
    {
      "name": "Tether USD",
      "address": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      "symbol": "USDT",
      "decimals": 6,
      "chainId": 1,
      "logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
      "extensions": {
        "bridgeInfo": {
          "10": {
            "tokenAddress": "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58"
          },
          "137": {
            "tokenAddress": "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"
          },
          "42161": {
            "tokenAddress": "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"
          }
        }
      }
    },
    {
      "name": "Binance USDT",
      "symbol": "USDT",
      "address": "0x55d398326f99059fF775485246999027B3197955",
      "chainId": 56,
      "decimals": 18,
      "logoURI": "https://tokens.pancakeswap.finance/images/0x55d398326f99059fF775485246999027B3197955.png"
    },
  ]

  const [chooseModalVisible, setChooseModalVisible] = useState(false);
  const [chooseSelectedItemId, setChooseSelectedItemId] = useState(TEMPCHOSE);
  const [selectedToken, setSelectedToken] = useState(null);
  const [amount, setamount] = useState('');
  const [chooseModalVisible_choose, setchooseModalVisible_choose] = useState(false);
  const [WALLETADDRESS, setWALLETADDRESS] = useState('');
  const [WALLETBALANCE, setWALLETBALANCE] = useState('');
  const [ACTIVATION_MODAL_PROD, setACTIVATION_MODAL_PROD] = useState(false);
  const [balanceLoading, setbalanceLoading] = useState(false);
  const [fianl_modal_text, setfianl_modal_text] = useState("Transaction Failed");
  const [fianl_modal_error, setfianl_modal_error] = useState(false);
  const [fianl_modal_loading, setfianl_modal_loading] = useState(false);
  const [resQuotes, setresQuotes] = useState(null);
  const [nonDirectQoutes, setnonDirectQoutes] = useState(null);
  const [getInfo, setgetInfo] = useState(false);
  const [payFeeType, setPayFeeType] = useState("native");
  const [errorMsg, seterrorMsg] = useState(null);
  const [showTx, setshowTx] = useState(false);
  const [showTxHash, setshowTxHash] = useState([]);
  const [tokenSearchQuery, setTokenSearchQuery] = useState('');

  const theme = state.THEME.THEME ? colors.dark : colors.light;
  const currentWalletType = chooseSelectedItemId === null ? chooseItemList[1].name : chooseSelectedItemId;
  const currentTokenList = currentWalletType === "Ethereum" ? tokenList : PancakeList;

 
  let balanceMap = {};
  let prioritySet = new Set();

  if (Array.isArray(state && state.activeWalletPortFolio && state.activeWalletPortFolio.tokens) && state && state.activeWalletPortFolio && state.activeWalletPortFolio.tokens.length > 0) {
    state && state.activeWalletPortFolio && state.activeWalletPortFolio.tokens.forEach(t => {
      const addr = t.contractAddress?.toLowerCase();
      if (!addr) return;
      prioritySet.add(addr);
      balanceMap[addr] = {
        balance: t.balance,
        balanceUSD: t.balanceUSD,
      };
    });
  }
  const filteredTokenList = currentTokenList.filter(item => {
    const name = item.name?.toLowerCase() || "";
    const symbol = item.symbol?.toLowerCase() || "";
    const query = tokenSearchQuery.toLowerCase();

    return name.includes(query) || symbol.includes(query);
  });
  const mergedList = filteredTokenList.map(item => {
    const addr = item.address?.toLowerCase() || "";

    return {
      ...item,
      ...(balanceMap[addr] || {})
    };
  });
  const sortedTokenList = mergedList.sort((a, b) => {
    if (prioritySet.size === 0) return 0;

    const aPri = prioritySet.has(a.address?.toLowerCase()) ? 1 : 0;
    const bPri = prioritySet.has(b.address?.toLowerCase()) ? 1 : 0;

    return bPri - aPri;
  });


  useEffect(() => {
    if (!selectedToken && currentTokenList.length > 0) {
      setSelectedToken(currentTokenList[0]);
    }
  }, [currentTokenList]);

  useEffect(() => {
    resetState();
    fetchUSDCBalnce(state?.wallet?.address);
    setWALLETBALANCE(state?.EthBalance);
    setWALLETADDRESS(state?.wallet?.address);
  }, []);

  useEffect(() => {
    resetState();
    fetchUSDCBalnce(state?.wallet?.address);
    setWALLETBALANCE(state?.EthBalance);
    setWALLETADDRESS(state?.wallet?.address);
  }, [state?.wallet?.address]);

  useEffect(() => {
    resetState();
    if (currentTokenList.length > 0) {
      setSelectedToken(currentTokenList[0]);
    }
    fetchUSDCBalnce(state?.wallet?.address);
    setWALLETBALANCE(state?.EthBalance);
    setWALLETADDRESS(state?.wallet?.address);
  }, [chooseSelectedItemId]);

  const resetState = () => {
    setshowTx(false);
    setshowTxHash([]);
    setresQuotes(null);
    setnonDirectQoutes(null);
    setgetInfo(false);
    setACTIVATION_MODAL_PROD(false);
    setbalanceLoading(false);
    setfianl_modal_error(false);
    setfianl_modal_loading(false);
    setamount('');
    setPayFeeType('native');
    seterrorMsg(null);
  };

  const fetchUSDCBalnce = async (activeToken=selectedToken,addresses) => {
    try {
      setbalanceLoading(true);

      if (state.STELLAR_ADDRESS_STATUS === false) {
        setACTIVATION_MODAL_PROD(true);
      }

      if (!activeToken) {
        setbalanceLoading(false);
        return;
      }

      const activeNetwork = chooseSelectedItemId === null ? chooseItemList[1].name : chooseSelectedItemId;
      const tokenAddress = activeToken?.address;

      if (activeNetwork === "Ethereum") {
        if (tokenAddress && addresses) {
          const resposeBalance = await fetchTokenInfo(tokenAddress, addresses);
          const balance = resposeBalance[0].tokenBalance;
          setWALLETBALANCE(balance);
        }
      }

      if (activeNetwork === "BNB") {
        if (tokenAddress && addresses) {
          const resposeBalance = await fetchBSCTokenInfo(tokenAddress, addresses);
          const balance = resposeBalance[0].tokenBalance;
          setWALLETBALANCE(balance);
        }
      }

      setbalanceLoading(false);
    } catch (error) {
      setWALLETBALANCE(0.00);
      setbalanceLoading(false);
      console.log("Error fetching balance:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation])
  );

  const handleUpdate = (item) => {
    setChooseSelectedItemId(item.name);
    setChooseModalVisible(false);
  };

  const handleTokenUpdate = (item) => {
    setSelectedToken(null);
    setTokenSearchQuery('')
    setSelectedToken(item);
    setchooseModalVisible_choose(false);
    fetchUSDCBalnce(item,state?.wallet?.address);
  };

  const chooseRenderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleUpdate(item)}
      style={styles.chooseItemContainer}
    >
      <Image style={styles.chooseItemImage} source={{ uri: item.url }} />
      <Text style={[styles.chooseItemText, { color: theme.headingTx }]}>{item.name}</Text>
    </TouchableOpacity>
  );

  const tokenRenderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleTokenUpdate(item)}
      style={styles.chooseItemContainer}
    >
      <Image style={styles.chooseItemImage} source={{ uri: item.logoURI }} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.chooseItemText, { color: theme.headingTx }]}>{item.name}</Text>
        <Text style={[styles.chooseItemSymbol, { color: theme.inactiveTx, fontSize: 12 }]}>{item.symbol}</Text>
      </View>
      <View style={{alignSelf:"flex-end",alignItems:"flex-end"}}>
        {item.balance ? <>
          <Text style={[styles.chooseItemText, { color: theme.headingTx }]}>{item.balance || "0.0"}</Text>
          <Text style={[styles.chooseItemSymbol, { color: theme.inactiveTx, fontSize: 12 }]}>${item.balanceUSD || "0.0"}</Text>
        </> :
          <TouchableOpacity style={[styles.buyBtnCon,{backgroundColor:"#4052D6"}]} onPress={() => {
            setchooseModalVisible_choose(false),
              setTimeout(() => {
                navigation.navigate("KycComponent", { tabName: "Buy" })
              },300)
          }
          }>
            <Text style={[styles.buyBtnTxt,{color:theme.headingTx}]}>Buy Now</Text>
          </TouchableOpacity>}
      </View>
    </TouchableOpacity>
  );

  const sendEthToContract = async (amount) => {
    try {
      const activeNetwork = chooseSelectedItemId === null ? chooseItemList[1].name : chooseSelectedItemId;
      const activeAsset = selectedToken?.symbol;
      const wallet = new ethers.Wallet(state?.wallet?.privateKey);

      if (activeNetwork === "Ethereum" && activeAsset === "USDT" || activeNetwork === "Ethereum" && activeAsset === "USDC") {
        const respoExe = await swap_prepare(
          state?.wallet?.privateKey,
          wallet.address,
          state.STELLAR_PUBLICK_KEY,
          amount,
          activeAsset,
          "USDC",
          "ETH",
          payFeeType
        );

        if (respoExe?.status_task) {
          setfianl_modal_text("Transaction Successful");
          setfianl_modal_loading(false);
          setfianl_modal_error(true);
          setshowTxHash([{ chain: "ETH", hash: respoExe.res.transferTxHash }]);
        } else {
          throw new Error("Transaction failed");
        }
      }

      if (activeNetwork === "BNB" && activeAsset === "USDT" || activeNetwork === "BNB" && activeAsset === "USDC") {
        const respoExe = await SwapPepare(
          state?.wallet?.privateKey,
          wallet.address,
          state.STELLAR_PUBLICK_KEY,
          amount,
          activeAsset,
          "USDC",
          "BNB",
          payFeeType
        );

        if (respoExe?.status_task) {
          setfianl_modal_text("Transaction Successful");
          setfianl_modal_loading(false);
          setfianl_modal_error(true);
          setshowTxHash([{ chain: "BSC", hash: respoExe.res.transferTxHash }]);
        } else {
          throw new Error("Transaction failed");
        }
      }
    } catch (error) {
      setfianl_modal_text("Transaction Failed");
      console.log("Transaction Failed", error);
      setfianl_modal_loading(false);
      setfianl_modal_error(true);
    }
  };

  const swapNonDiractToken = async (fromToken, toToken, amount, privateKey) => {
    try {
      const wallet = new ethers.Wallet(privateKey);
      const address = await wallet.getAddress();
      console.log("---toToken.symbol", fromToken.symbol)
      const payload = {
        tokenIn: fromToken,
        tokenOut: toToken,
        amount: amount,
        recipient: address,
      };
      console.log("perpare:---:payload", payload)
      const respo = await proxyRequest("/v1/eth/swap-transaction/prepare", PPOST, payload);
      console.log("perpare:", respo)
      if (respo.err?.status === 500) {
        return {
          status: false,
          message: "Swap failed",
          details: "faild to swap"
        };
      }
      const rawTxs = respo.res;
      const signedTxs = [];

      for (const tx of rawTxs) {
        if (tx.value) tx.value = BigInt(tx.value);
        if (tx.gasLimit) tx.gasLimit = BigInt(tx.gasLimit);
        if (tx.maxFeePerGas) tx.maxFeePerGas = BigInt(tx.maxFeePerGas);
        if (tx.maxPriorityFeePerGas) tx.maxPriorityFeePerGas = BigInt(tx.maxPriorityFeePerGas);
        const signedTx = await wallet.signTransaction(tx);
        signedTxs.push(signedTx);
      }
      const { res, err } = await proxyRequest("/v1/eth/swap-transaction/execute", PPOST, { txs: signedTxs });
      console.log("=====execute-----", res)
      if (err?.status === 500) {
        return {
          status: false,
          message: "Swap failed",
          details: "faild to swap"
        };
      } if (res?.[0]?.receipt.status === 1) {
        console.log("=====execute0-----", res)
        return {
          status: true,
          message: "Swap completed successfully",
          inputAmount: `${amount} ETH`,
          transactions: {
            approve: res?.[0]?.receipt.hash
          },
          swap: res?.[1]?.receipt.hash,
        }
      }
    } catch (error) {
      console.log("error onSwapETHtoUSDC: ", error)
      return {
        status: false,
        message: "Swap failed",
        details: error.message
      };
    }
  }

  const manage_swap = async () => {
    setfianl_modal_loading(true);
    const amountValue = parseFloat(amount);
    const walletBalanceValue = parseFloat(WALLETBALANCE);

    if (isNaN(amountValue) || amountValue == 0) {
      setfianl_modal_loading(false);
      ShowErrotoast(toast, "Invalid amount");
      setamount("");
    } else if (amountValue <= 0 || amountValue > walletBalanceValue) {
      setfianl_modal_loading(false);
      ShowErrotoast(toast, "Insufficient funds");
      setamount("");
    } else {
      const activeNetwork = chooseSelectedItemId === null ? chooseItemList[1].name : chooseSelectedItemId;
      const activeAsset = selectedToken?.symbol;
      if (activeNetwork === "Ethereum" && activeAsset === "USDT" || activeNetwork === "Ethereum" && activeAsset === "USDC" || activeNetwork === "BNB" && activeAsset === "USDT" || activeNetwork === "BNB" && activeAsset === "USDC") {
        sendEthToContract(amount);
      } else {
        const response = await swapNonDiractToken(selectedToken, defaultUsdts[0], amount, state?.wallet?.privateKey);
        console.log("response-++++++-", response)
        if (response.status === false) {
          setfianl_modal_text("Transaction Failed");
          setfianl_modal_loading(false);
          setfianl_modal_error(true);
          CustomInfoProvider.show("Info", "Transaction Faild.");
        }
        if (response.status === true) {
          sendEthToContract(nonDirectQoutes.outputAmount);
        }
      }
    }
  };

  const isValidNumber = (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num !== 0;
  };

  const getQuote = useCallback(
    debounce((value, chaiType, inputToken, sumbitToken) => {
      if (isValidNumber(value) && value !== "null") {
        setresQuotes(null);
        setnonDirectQoutes(null);
        setgetInfo(true);
        if (inputToken === "USDT" || inputToken === "USDC") {
          collectQuotes(value, chaiType, inputToken);
        } else {
          console.log("called-collectNonDefaultTokenQuotes")
          collectNonDefaultTokenQuotes(sumbitToken, chaiType === "BNB" ? defaultUsdts[1] : defaultUsdts[0], value, chaiType === "BNB" ? "bsc" : "eth")
        }
      }
    }, 400),
    []
  );

  const handleInputChange = (text, tokenChain, inputToken, sumbitToken) => {
    setresQuotes(null);
    setnonDirectQoutes(null);
    const numericText = text.replace(/[^0-9.]/g, '');
    setamount(numericText);
    getQuote(numericText, tokenChain === "BNB" ? "BNB" : "ETH", inputToken, sumbitToken);
  };

  const collectNonDefaultTokenQuotes = async (tokenIn, tokenOut, amountIn, type) => {
    const { res, err } = await proxyRequest(`/v1/${type}/swap-quote`, PPOST, { tokenIn: tokenIn, tokenOut: tokenOut, amount: amountIn });
    console.log(res, err)
    if (err?.status === 500) {
      setgetInfo(false);
      setresQuotes(null);
      setnonDirectQoutes(null);
    }
    else {
      console.log("--output--", res);
      setnonDirectQoutes(res);
      collectQuotes(res.outputAmount, type === "bsc" ? "BNB" : "ETH", tokenOut.symbol);
    }
  };

  const collectQuotes = async (value, typeOfchain, spendToken) => {
    const deviceToken = await getToken();
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "Bearer " + deviceToken);
    myHeaders.append("x-auth-device-token", deviceToken);

    const raw = JSON.stringify({
      "amount": value,
      "chainType": typeOfchain,
      "sourceToken": spendToken
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };

    fetch(REACT_PROXY_HOST + `/v1/bridge/swap-quotes`, requestOptions)
      .then((response) => response.json())
      .then(async (result) => {
        if (result?.quotes) {
          Keyboard.dismiss();
          const respo = await convertMultiple([
            { token: result?.quotes?.fee?.native?.symbol, amount: result?.quotes?.fee?.native?.amount },
            { token: result?.quotes?.fee?.stablecoin?.symbol, amount: result?.quotes?.fee?.stablecoin?.amount }
          ]);

          const mergedQuotes = { ...result?.quotes };
          for (const item of respo) {
            if (item.success) {
              if (item.token === mergedQuotes.fee.native.symbol) {
                mergedQuotes.fee.native = { ...mergedQuotes.fee.native, ...item };
              } else if (item.token === mergedQuotes.fee.stablecoin.symbol) {
                mergedQuotes.fee.stablecoin = { ...mergedQuotes.fee.stablecoin, ...item };
              }
            }
          }
          setresQuotes(mergedQuotes);
          setgetInfo(false);
        } else {
          console.log("unable to get qoutes: ", result)
          setgetInfo(false);
          setresQuotes(null);
          CustomInfoProvider.show("Info", result?.message === "Amount must be greater than zero"
            ? "Oops! You need to enter at least 0.01."
            : "An error occurred. Please try again later.");
        }
      })
      .catch((error) => {
        setgetInfo(false);
        setresQuotes(null);
        console.log("--->errorClasic", error);
      });
  };

  useEffect(() => {
    const init=async()=>{
      if (!resQuotes) return;

    const feeAmount = payFeeType === "native"
      ? parseFloat(resQuotes?.fee?.native?.amount || "0")
      : parseFloat(resQuotes?.fee?.stablecoin?.amount || "0");

    const minReceive = parseFloat(resQuotes?.minimumAmountOut || "0");
    const netReceive = Math.max(0, minReceive - feeAmount);

    if (netReceive <= 0 || (payFeeType === "stable" && feeAmount > parseFloat(await WALLETBALANCE)) || (payFeeType === "native" && feeAmount > parseFloat(await WALLETBALANCE))) {
      seterrorMsg("Insufficient funds to pay gas.");
    } else {
      seterrorMsg(null);
    }
    }
    init()
  }, [payFeeType, resQuotes, WALLETBALANCE]);

  const feeData = payFeeType === "native"
    ? resQuotes?.fee?.native
    : resQuotes?.fee?.stablecoin;

  return (
    <View style={{ backgroundColor: theme.bg, width: wp(100), height: hp(100) }}>
      <Exchange_screen_header
        title="Bridge"
        onLeftIconPress={() => navigation.goBack()}
        onRightIconPress={() => console.log('Pressed')}
      />

      <WalletActivationComponent
        isVisible={ACTIVATION_MODAL_PROD}
        onClose={() => setACTIVATION_MODAL_PROD(false)}
        onActivate={() => setACTIVATION_MODAL_PROD(false)}
        navigation={navigation}
        appTheme={true}
        shouldNavigateBack={true}
      />

      <ScrollView style={{ marginBottom: hp(5), paddingHorizontal: wp(3.5) }}>
        <View style={[styles.card, { backgroundColor: theme.cardBg, flexDirection: "column", paddingHorizontal: wp(3) }]}>
          <Text style={[styles.headingText, { color: theme.headingTx }]}>Deposit USDC on Trade Wallet</Text>

          <View style={[styles.exportBottomCon, { backgroundColor: theme.cardBg }]}>
            <TouchableOpacity
              style={[styles.exportCon, { backgroundColor: theme.bg }]}
              onPress={() => setChooseModalVisible(true)}
            >
              <View style={{ flexDirection: "row" }}>
                <Image
                  source={{ uri: chooseItemList.find(item => item.name === currentWalletType)?.url }}
                  style={styles.logoImg_TOP_1}
                />
                <View>
                  <Text style={styles.networkSubHeading}>Network</Text>
                  <Text style={[styles.networkHeading, { color: theme.headingTx }]}>
                    {currentWalletType}
                  </Text>
                </View>
              </View>
              <Icon name={"chevron-down"} type={"materialCommunity"} color={theme.headingTx} size={30} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.exportCon, { backgroundColor: theme.bg }]}
              onPress={() => { resetState(), setchooseModalVisible_choose(true) }}
            >
              <View style={{ flexDirection: "row" }}>
                <Image
                  source={{ uri: selectedToken?.logoURI || currentTokenList[0]?.logoURI }}
                  style={styles.logoImg_TOP_1}
                />
                <View>
                  <Text style={styles.networkSubHeading}>Assets</Text>
                  <Text style={[styles.networkHeading, { color: theme.headingTx }]} numberOfLines={1} ellipsizeMode="tail">{(selectedToken?.name || currentTokenList[0]?.name)?.slice(0, 10)}</Text>
                </View>
              </View>
              <Icon name={"chevron-down"} type={"materialCommunity"} color={theme.headingTx} size={30} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardBg, flexDirection: "column", borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }]}>
          <Text style={[styles.infoText, { color: theme.inactiveTx }]}>
            <Icon name={"information-outline"} type={"materialCommunity"} size={16} color={theme.inactiveTx} />
            {" "}Any token except (USDC/USDT) will be auto-converted to USDC on the Stellar network.
          </Text>

          <View style={[styles.rowBtnCon, { paddingVertical: hp(-0.5), backgroundColor: theme.cardBg }]}>
            <Text style={[styles.subInputText, { color: theme.inactiveTx, marginTop: hp(0) }]}>Amount</Text>
            <TouchableOpacity
              style={styles.maxCon}
              onPress={() => {
                if (parseFloat(WALLETBALANCE) > 0) {
                  handleInputChange(
                    WALLETBALANCE,
                    currentWalletType,
                    selectedToken?.symbol
                  );
                }
              }}
            >
              <Text style={styles.maxBtn}>MAX</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.modalOpen, { paddingVertical: hp(1), backgroundColor: theme.bg }]}>
            <TextInput
              maxLength={10}
              placeholder='0.0'
              placeholderTextColor={"gray"}
              keyboardType="decimal-pad"
              value={amount}
              style={[styles.textInputForCrossChain, { fontSize: 18, color: theme.headingTx }]}
              onChangeText={(value) => handleInputChange(
                value,
                currentWalletType,
                selectedToken?.symbol,
                selectedToken
              )}
              returnKeyType="done"
            />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardBg, flexDirection: "column", borderTopLeftRadius: 0, borderTopRightRadius: 0, marginTop: -9, borderTopColor: theme.smallCardBorderColor, borderTopWidth: 1 }]}>
          <View style={styles.accountDetailsCon}>
            <Text style={[styles.subInputText, { color: theme.inactiveTx }]}>Active Wallet :</Text>
            <View style={{ width: "60%" }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Text style={{ fontSize: 14, color: theme.headingTx }}>{WALLETADDRESS}</Text>
              </ScrollView>
            </View>
          </View>

          <View style={styles.accountDetailsCon}>
            <Text style={[styles.subInputText, { color: theme.inactiveTx }]}>Balance :</Text>
            <View style={{ minWidth: wp(15) }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {balanceLoading ? (
                  <ActivityIndicator color={"green"} />
                ) : (
                  <Text style={{ color: theme.headingTx, fontSize: 14 }}>
                    {WALLETBALANCE} {selectedToken?.symbol}
                  </Text>
                )}
              </ScrollView>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardBg, flexDirection: "column", borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }]}>
          <View style={{ flexDirection: "row", paddingLeft: wp(3) }}>
            <Icon name={"fire"} type={"materialCommunity"} size={25} color={"#4052D6"} />
            <Text style={[styles.subInputText, { fontSize: 16, color: theme.headingTx }]}> Relayer Fee</Text>
          </View>

          <View style={{ flexDirection: "row", marginLeft: 5 }}>
            <TouchableOpacity
              style={[styles.feePayCon, { backgroundColor: payFeeType === "native" ? "#4052D6" : theme.bg }]}
              onPress={() => setPayFeeType("native")}
            >
              <Icon name={"fire"} type={"materialCommunity"} size={25} color={payFeeType === "native" ? "#fff" : "#4052D6"} />
              <Text style={[styles.feePayTx, { color: payFeeType === "native" ? "#fff" : theme.headingTx }]}>Native</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.feePayCon, { backgroundColor: payFeeType === "stable" ? "#4052D6" : theme.bg }]}
              onPress={() => setPayFeeType("stable")}
            >
              <Icon name={"fire"} type={"materialCommunity"} size={25} color={payFeeType === "stable" ? "#fff" : "#4052D6"} />
              <Text style={[styles.feePayTx, { color: payFeeType === "stable" ? "#fff" : theme.headingTx }]}>Stable-Coin</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardBg, flexDirection: "column", borderTopLeftRadius: 0, borderTopRightRadius: 0, marginTop: -9, borderTopColor: theme.smallCardBorderColor, borderTopWidth: 1 }]}>
          <View style={styles.accountDetailsCon}>
            <View style={{ flexDirection: "row" }}>
              <Image
                source={{ uri: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png" }}
                style={styles.logoImg_TOP_1}
              />
              <View>
                <Text style={styles.networkSubHeading}>Receive</Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={[styles.networkHeading, { color: theme.headingTx }]}>USDC</Text>
                  <Text style={{ color: "gray", fontSize: 13 }}> (centre.io)</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {getInfo && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066cc" />
            <Text style={styles.loadingText}>Getting best quote...</Text>
          </View>
        )}

        {resQuotes !== null && (
          <View style={[styles.modalQoutesCon, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.quoteTitle, { color: theme.headingTx }]}>Quote Details</Text>
            {nonDirectQoutes !== null && (
              <>
                <View style={[styles.quoteDetailsContainer, { marginBottom: hp(1) }]}>
                  <View style={styles.quoteRow}>
                    <Text style={[styles.quoteLabel, { color: theme.inactiveTx }]}>Provider</Text>
                    <Text style={[styles.quoteValue, { color: theme.headingTx }]}>{currentWalletType === "Ethereum" ? "Uniswap" : "Pancake"}</Text>
                  </View>

                  <View style={styles.quoteRow}>
                    <Text style={[styles.quoteLabel, { color: theme.inactiveTx }]}>Rate</Text>
                    <Text style={[styles.quoteValue, { color: theme.headingTx }]}>
                      1 {selectedToken?.symbol} = {nonDirectQoutes.pricePerToken} USDT
                    </Text>
                  </View>

                  <View style={styles.quoteRow}>
                    <Text style={[styles.quoteLabel, { color: theme.inactiveTx }]}>Slippage</Text>
                    <Text style={[styles.quoteValue, { color: theme.headingTx }]}>
                      1 %
                    </Text>
                  </View>

                  <View style={styles.quoteRow}>
                    <Text style={[styles.quoteLabel, { color: theme.inactiveTx }]}>Minimum Received</Text>
                    <View style={{ width: wp(25), flexDirection: 'row' }}>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <Text style={[styles.quoteValue, { color: theme.headingTx }]}>{nonDirectQoutes.outputAmount}</Text>
                      </ScrollView>
                      <Text style={[styles.quoteValue, { color: theme.headingTx }]}> USDT</Text>
                    </View>
                  </View>

                  <View style={styles.quoteRow}>
                    <Text style={[styles.quoteLabel, { color: theme.inactiveTx }]}>Network Fee</Text>
                    <Text style={[styles.quoteValue, { color: theme.headingTx }]}>
                      {nonDirectQoutes?.fee}{" Gwei"}
                    </Text>
                  </View>
                </View>
              </>
            )}
            <View style={[styles.quoteDetailsContainer]}>
              <View style={styles.quoteRow}>
                <Text style={[styles.quoteLabel, { color: theme.inactiveTx }]}>Provider</Text>
                <Text style={[styles.quoteValue, { color: theme.headingTx }]}>Allbridge</Text>
              </View>

              <View style={styles.quoteRow}>
                <Text style={[styles.quoteLabel, { color: theme.inactiveTx }]}>Rate</Text>
                <Text style={[styles.quoteValue, { color: theme.headingTx }]}>
                  1 USDT = {resQuotes.conversionRate} USDC
                </Text>
              </View>

              <View style={styles.quoteRow}>
                <Text style={[styles.quoteLabel, { color: theme.inactiveTx }]}>Slippage</Text>
                <Text style={[styles.quoteValue, { color: theme.headingTx }]}>
                  {resQuotes.slippageTolerance}%
                </Text>
              </View>

              <View style={styles.quoteRow}>
                <Text style={[styles.quoteLabel, { color: theme.inactiveTx }]}>Minimum Received</Text>
                <View style={{ width: wp(25), flexDirection: 'row' }}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <Text style={[styles.quoteValue, { color: theme.headingTx }]}>{resQuotes.minimumAmountOut}</Text>
                  </ScrollView>
                  <Text style={[styles.quoteValue, { color: theme.headingTx }]}> USDC</Text>
                </View>
              </View>

              <View style={styles.quoteRow}>
                <Text style={[styles.quoteLabel, { color: theme.inactiveTx }]}>Network Fee</Text>
                <View style={{ width: wp(25), flexDirection: "row", alignItems: "center" }}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <Text style={[styles.quoteValue, { color: theme.headingTx }]}>
                      {feeData?.amount}
                    </Text>
                  </ScrollView>
                  <Text style={[styles.quoteValue, { color: theme.headingTx }]}>
                    {" " + feeData?.symbol}
                  </Text>
                </View>
              </View>

              <View style={styles.quoteRow}>
                <Text style={[styles.quoteLabel, { color: theme.inactiveTx }]}>Network Fee (USD)</Text>
                <Text style={[styles.quoteValue, { color: theme.headingTx, textAlign: "right" }]}>
                  {feeData?.formattedUSD || `$${Number(feeData?.usdValue || 0).toFixed(2)}`}
                </Text>
              </View>

              <View style={styles.quoteRow}>
                <Text style={[styles.quoteLabel, { color: theme.inactiveTx }]}>Estimated time</Text>
                <Text style={[styles.quoteValue, { color: theme.headingTx }]}>
                  {resQuotes.completionTime ? (resQuotes.completionTime / (1000 * 60) + " Min") : "getting.."}
                </Text>
              </View>
            </View>

            <View style={[styles.quoteTextCon, { borderColor: theme.inactiveTx }]}>
              <Text style={[styles.quoteText, { color: theme.headingTx }]}>≈</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Text style={[styles.quoteText, { color: theme.headingTx }]}>
                  {Math.max(
                    0,
                    parseFloat(resQuotes.minimumAmountOut || "0") -
                    parseFloat(
                      payFeeType === "native"
                        ? resQuotes?.fee?.native?.amount || "0"
                        : resQuotes?.fee?.stablecoin?.amount || "0"
                    )
                  ).toFixed(6)}
                </Text>
              </ScrollView>
              <Text style={[styles.quoteText, { color: theme.headingTx }]}>USDC</Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: !amount || balanceLoading || getInfo || errorMsg !== null ? "gray" : '#4052D6' }]}
          disabled={!amount || fianl_modal_loading || balanceLoading || getInfo || errorMsg !== null}
          onPress={() => { Keyboard.dismiss(); manage_swap(); }}
        >
          {fianl_modal_loading || getInfo ? (
            <ActivityIndicator color={"white"} />
          ) : (
            <Text style={styles.nextButtonText}>{errorMsg !== null ? errorMsg : "Confirm Transaction"}</Text>
          )}
        </TouchableOpacity>

        <Modal animationType="slide" transparent={true} visible={chooseModalVisible}>
          <TouchableOpacity style={styles.chooseModalContainer} onPress={() => setChooseModalVisible(false)}>
            <View style={[styles.chooseModalContent, { backgroundColor: theme.cardBg }]}>
              <Text style={{ fontSize: 20, fontWeight: "bold", marginVertical: hp(1), color: theme.headingTx }}>Select Network</Text>
              <FlatList
                data={chooseItemList}
                renderItem={chooseRenderItem}
                keyExtractor={(item) => item.id.toString()}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        <Modal animationType="slide" transparent={true} visible={chooseModalVisible_choose}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <TouchableOpacity
              style={styles.chooseModalContainer}
              activeOpacity={1}
              onPress={() => {
                Keyboard.dismiss();
              }}
            >
              <TouchableWithoutFeedback>
                <View style={[styles.chooseModalContent, { backgroundColor: theme.cardBg }]}>
                  <View style={styles.modalHeader}>
                    <Text style={{ fontSize: 20, fontWeight: "bold", color: theme.headingTx }}>
                      Choose Asset
                    </Text>
                    <TouchableOpacity onPress={() => {
                      setchooseModalVisible_choose(false);
                      setTokenSearchQuery('');
                      Keyboard.dismiss();
                    }}>
                      <Icon name={"close"} type={"materialCommunity"} color={theme.headingTx} size={24} />
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.searchContainer, { backgroundColor: theme.bg }]}>
                    <Icon name={"magnify"} type={"materialCommunity"} color={theme.inactiveTx} size={20} />
                    <TextInput
                      placeholder="Search token..."
                      placeholderTextColor={theme.inactiveTx}
                      value={tokenSearchQuery}
                      onChangeText={setTokenSearchQuery}
                      style={[styles.searchInput, { color: theme.headingTx }]}
                    />
                    {tokenSearchQuery.length > 0 && (
                      <TouchableOpacity onPress={() => setTokenSearchQuery('')}>
                        <Icon name={"close-circle"} type={"materialCommunity"} color={theme.inactiveTx} size={20} />
                      </TouchableOpacity>
                    )}
                  </View>

                  <FlatList
                    data={sortedTokenList}
                    renderItem={tokenRenderItem}
                    keyExtractor={(item, index) => item.address || `${item.symbol}-${index}`}
                    keyboardShouldPersistTaps="handled"
                    ListEmptyComponent={
                      <Text style={[styles.emptyText, { color: theme.inactiveTx }]}>
                        No tokens found
                      </Text>
                    }
                  />
                </View>
              </TouchableWithoutFeedback>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </Modal>

        <Modal animationType="fade" transparent={true} visible={fianl_modal_error}>
          <View style={styles.modalContainer}>
            <View style={{
              backgroundColor: 'rgba(33, 43, 83, 1)',
              padding: 20,
              borderRadius: 10,
              alignItems: 'center',
              width: "90%",
              height: "30%",
            }}>
              <Icon
                name={fianl_modal_text === "Transaction Failed" ? "alert-circle-outline" : "check-circle-outline"}
                type={"materialCommunity"}
                size={60}
                color={fianl_modal_text === "Transaction Failed" ? "red" : "green"}
                style={{ marginTop: 19 }}
              />
              <Text style={{ fontSize: 20, fontWeight: "bold", marginVertical: 19, color: "#fff" }}>{fianl_modal_text}</Text>
              <TouchableOpacity
                style={styles.alertBtn}
                onPress={() => {
                  if (fianl_modal_text === "Transaction Failed") {
                    setfianl_modal_error(false);
                  } else {
                    setfianl_modal_error(false);
                    setshowTx(true);
                  }
                }}
              >
                <Text style={styles.alertBtnText}>Ok</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>

      <View style={styles.allBridgeTxCon}>
        <AllbridgeTxTrack txs={showTxHash} isDarkMode={state?.THEME?.THEME} showTx={showTx} closeTx={() => setshowTx(false)} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  headingText: {
    fontSize: 18,
    fontWeight: "400",
    marginBottom: 12,
  },
  exportBottomCon: {
    gap: 5,
    flexDirection: "row"
  },
  exportCon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 8,
    width: wp(43)
  },
  logoImg_TOP_1: {
    width: 35,
    height: 35,
    borderRadius: 20,
    marginRight: 3,
  },
  networkSubHeading: {
    fontSize: 12,
    color: 'gray',
  },
  networkHeading: {
    fontSize: 15,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 13,
    marginBottom: 12,
  },
  rowBtnCon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subInputText: {
    fontSize: 14,
  },
  maxCon: {
    backgroundColor: '#4052D6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  maxBtn: {
    color: 'white',
    fontWeight: '600',
  },
  modalOpen: {
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  textInputForCrossChain: {
    width: '100%',
  },
  accountDetailsCon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  feePayCon: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    marginTop: 8,
  },
  feePayTx: {
    marginLeft: 8,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#0066cc',
  },
  modalQoutesCon: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  quoteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  quoteDetailsContainer: {
    gap: 12,
  },
  quoteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quoteLabel: {
    fontSize: 14,
  },
  quoteValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  quoteTextCon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    gap: 8,
  },
  quoteText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 16,
    marginBottom:hp(5)
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  chooseModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  chooseItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  chooseItemImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  chooseItemText: {
    fontSize: 16,
    fontWeight: '600',
  },
  chooseItemSymbol: {
    fontSize: 12,
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  alertBtn: {
    backgroundColor: '#4052D6',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  alertBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  allBridgeTxCon: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  chooseModalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? hp(4) : hp(2),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    fontSize: 14,
  },
  buyBtnCon: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 10,

  },
  buyBtnTxt:{
    color:"#fff",
    fontSize:16,
    fontWeight:"600",
    textAlign:"center"
  }
});

export default classic