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
import LocalTxManager from '../../../../../utilities/LocalTxManager';
import RecentCrossChainTx from '../../../../reusables/RecentCrossChainTx';
import { getWalletBalance } from '../utils/getWalletInfo/EtherWalletService';

const CrossChainTx = ({ route="ETH" }) => {
  const toast = useToast();
  const navigation = useNavigation();
  const { Asset_type } = route;
  const TEMPCHOSE = Asset_type === "ETH" ? "Ethereum" : Asset_type === "BNB" ? "BNB" : "Ethereum";
  const state = useSelector((state) => state);

  const chooseItemList = [
    { id: 1, name: "Ethereum", url: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png" },
    { id: 2, name: "BNB", url: "https://tokens.pancakeswap.finance/images/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c.png" },
  ];
  const reciverAsset = {
        imageUrl: "https://tokens.pancakeswap.finance/images/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d.png",
        assetNetwork: "Stellar",
        assetName: "USDC"
    }
    const feeAsset = {
        imageUrl: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
        assetNetwork: "Stellar",
        assetName: "USDC"
    }
  
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
      "name": "USDCoin",
      "address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "symbol": "USDC",
      "decimals": 6,
      "chainId": 1,
      "logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
      "extensions": {
        "bridgeInfo": {
          "10": {
            "tokenAddress": "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85"
          },
          "56": {
            "tokenAddress": "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d"
          },
          "130": {
            "tokenAddress": "0x078D782b760474a361dDA0AF3839290b0EF57AD6"
          },
          "137": {
            "tokenAddress": "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"
          },
          "143": {
            "tokenAddress": "0x754704Bc059F8C67012fEd69BC8A327a5aafb603"
          },
          "1868": {
            "tokenAddress": "0xbA9986D2381edf1DA03B0B9c1f8b00dc4AacC369"
          },
          "42161": {
            "tokenAddress": "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"
          },
          "42220": {
            "tokenAddress": "0xcebA9300f2b948710d2653dD7B07f33A8B32118C"
          },
          "43114": {
            "tokenAddress": "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E"
          }
        }
      }
    }
  ]

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
  const [networkBalance,setNetworkBalance]=useState(0.0);
  const [showExpandCon,setShowExpandCon]=useState(false);

  const theme = state.THEME.THEME ? colors.dark : colors.light;
  const currentWalletType = chooseSelectedItemId === null ? chooseItemList[1].name : chooseSelectedItemId;
  const currentTokenList = currentWalletType === "Ethereum" ? ethSupportTokens : bscSupportTokens;

 
  // let balanceMap = {};
  // let prioritySet = new Set();

  // if (
  //   Array.isArray(state?.activeWalletPortFolio?.tokens) &&
  //   state.activeWalletPortFolio.tokens.length > 0
  // ) {
  //   state.activeWalletPortFolio.tokens.forEach(t => {
  //     let addr = t.contractAddress?.toLowerCase();
  //     if (!addr) return;

  //     if (addr === "native") {
  //       addr = "0x0000000000000000000000000000000000000000";
  //     }

  //     prioritySet.add(addr);
  //     balanceMap[addr] = {
  //       balance: t.balance,
  //       balanceUSD: t.balanceUSD,
  //       decimals: t.decimals,
  //       address: addr,
  //       name: t.name,
  //       symbol: t.symbol
  //     };
  //   });
  // }

  // const hasAnyWalletMatch = currentTokenList.some(item =>
  //   prioritySet.has(item.address?.toLowerCase())
  // );

  // const filteredTokenList = currentTokenList.filter(item => {
  //   const addr = item.address?.toLowerCase();
  //   if (!addr) return false;
  //   const name = item.name?.toLowerCase() || "";
  //   const symbol = item.symbol?.toLowerCase() || "";
  //   const query = tokenSearchQuery.toLowerCase();

  //   const matchesSearch = name.includes(query) || symbol.includes(query);
  //   if (hasAnyWalletMatch) {
  //     return prioritySet.has(addr) && matchesSearch;
  //   }
  //   return matchesSearch;
  // });

  // const finalTokenList = filteredTokenList.map(item => {
  //   const addr = item.address?.toLowerCase();

  //   return {
  //     ...item,
  //     ...(balanceMap[addr] || {}),
  //     address: addr,
  //     decimals: item.decimals ?? balanceMap[addr]?.decimals
  //   };
  // });

  // const sortedTokenList = finalTokenList.sort((a, b) => {
  //   const aPri = prioritySet.has(a.address?.toLowerCase()) ? 1 : 0;
  //   const bPri = prioritySet.has(b.address?.toLowerCase()) ? 1 : 0;
  //   return bPri - aPri;
  // });

  useEffect(() => {
    if (!selectedToken && currentTokenList.length > 0) {
      setSelectedToken(currentTokenList[0]);
    }
  }, [currentTokenList]);

  useEffect(() => {
    resetState();
    if (selectedToken && state?.wallet?.address) {
      fetchUSDCBalnce(selectedToken, state?.wallet?.address);
    }
    setWALLETBALANCE(state?.EthBalance);
    setWALLETADDRESS(state?.wallet?.address);
  }, []);

  useEffect(() => {
    resetState();
    if (selectedToken && state?.wallet?.address) {
      fetchUSDCBalnce(selectedToken, state?.wallet?.address);
    }
    setWALLETBALANCE(state?.EthBalance);
    setWALLETADDRESS(state?.wallet?.address);
  }, [state?.wallet?.address]);

  useEffect(() => {
    resetState();
    if (currentTokenList.length > 0 && state?.wallet?.address) {
      const newToken = currentTokenList[0];
      setSelectedToken(newToken);
      fetchUSDCBalnce(newToken, state?.wallet?.address);
    }
    setWALLETADDRESS(state?.wallet?.address);
  }, [chooseSelectedItemId]);

  const resetState = () => {
    setShowExpandCon(false);
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
          const nativeBalance = await getWalletBalance(addresses,"ETH");
          setNetworkBalance(nativeBalance.status?nativeBalance.balance:0.0);
        }
      }

      if (activeNetwork === "BNB") {
        if (tokenAddress && addresses) {
          const resposeBalance = await fetchBSCTokenInfo(tokenAddress, addresses);
          const balance = resposeBalance[0].tokenBalance;
          setWALLETBALANCE(balance);
          const nativeBalance = await getWalletBalance(addresses,"BSC");
          setNetworkBalance(nativeBalance.status?nativeBalance.balance:0.0);
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
        <Text style={[styles.chooseItemText, { color: theme.headingTx }]}>{item.symbol}</Text>
          {/* <Text style={[styles.chooseItemText, { color: theme.headingTx }]}>{item.balance || "0.0"}</Text> */}
      </View>
      <View style={{alignSelf:"flex-end",alignItems:"flex-end"}}>
          <TouchableOpacity style={[styles.buyBtnCon,{backgroundColor:"#4052D6"}]} onPress={() => {
            setchooseModalVisible_choose(false),
              setTimeout(() => {
                navigation.navigate("KycComponent", { tabName: "Buy" })
              },300)
          }
          }>
            <Text style={[styles.buyBtnTxt,{color:"#fff"}]}>Buy Now</Text>
          </TouchableOpacity>
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

        console.log("Bridge swap response:", respoExe);

        if (respoExe?.status_task) {
          const { res } = respoExe;
          const txHashes = [];

          if (res.approvalTxHash) {
            console.log("Approval transaction:", res.approvalTxHash);

            await LocalTxManager.saveTx(
              state && state.wallet && state.wallet.address,
              {
                chain: "ETH",
                hash: res.approvalTxHash,
                status: "pending",
                statusColor: "#eec14fff",
                type: "approval",
                timestamp: Date.now()
              }
            );

            txHashes.push({
              chain: "ETH",
              hash: res.approvalTxHash,
              type: "Approval"
            });
          }

          console.log("Transfer transaction:", res.transferTxHash);

          await LocalTxManager.saveTx(
            state && state.wallet && state.wallet.address,
            {
              chain: "ETH",
              hash: res.transferTxHash,
              status: "pending",
              statusColor: "#eec14fff",
              type: "transfer",
              timestamp: Date.now()
            }
          );

          txHashes.push({
            chain: "ETH",
            hash: res.transferTxHash,
            type: "Transfer"
          });

          setfianl_modal_text("Transaction Successful");
          setfianl_modal_loading(false);
          setfianl_modal_error(true);
          setshowTxHash(txHashes);

        } else {
          console.log("Transaction failed:", respoExe?.res);
          setfianl_modal_text("Transaction Failed");
          setfianl_modal_loading(false);
          setfianl_modal_error(true);
          throw new Error(respoExe?.res || "Transaction failed");
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
        console.log("respoExe-=-=BNB-=",respoExe);
        if (respoExe?.status_task) {
           const { res } = respoExe;
          const txHashes = [];

          if (res.approvalTxHash) {
            console.log("Approval transaction:", res.approvalTxHash);

            await LocalTxManager.saveTx(
              state && state.wallet && state.wallet.address,
              {
                chain: "BSC",
                hash: res.approvalTxHash,
                status: "pending",
                statusColor: "#eec14fff",
                type: "approval",
                timestamp: Date.now()
              }
            );

            txHashes.push({
              chain: "BSC",
              hash: res.approvalTxHash,
              type: "Approval"
            });
          }

          console.log("Transfer transaction:", res.transferTxHash);

          await LocalTxManager.saveTx(
            state && state.wallet && state.wallet.address,
            {
              chain: "BSC",
              hash: res.transferTxHash,
              status: "pending",
              statusColor: "#eec14fff",
              type: "transfer",
              timestamp: Date.now()
            }
          );

          txHashes.push({
            chain: "BSC",
            hash: res.transferTxHash,
            type: "Transfer"
          });

          setfianl_modal_text("Transaction Successful");
          setfianl_modal_loading(false);
          setfianl_modal_error(true);
          setshowTxHash(txHashes);
          // setfianl_modal_text("Transaction Successful");
          // await LocalTxManager.saveTx(state && state.wallet && state.wallet.address,{ chain: "BSC", hash: respoExe.res.transferTxHash, status:"pending",statusColor:"#eec14fff"  });
          // setfianl_modal_loading(false);
          // setfianl_modal_error(true);
          // setshowTxHash([{ chain: "BSC", hash: respoExe.res.transferTxHash }]);
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
      if (respo.err?.status) {
        return {
          status: false,
          message: respo.err.message||"Swap failed",
          details: respo.err.message||"faild to swap"
        };
      }
      const rawTxs = respo.res;
      const signedTxs = [];

     for (let i = 0; i < rawTxs.length; i++) {
        const tx = rawTxs[i];
        if (tx.value) tx.value = BigInt(tx.value);
        if (tx.gasLimit) tx.gasLimit = BigInt(tx.gasLimit);
        if (tx.maxFeePerGas) tx.maxFeePerGas = BigInt(tx.maxFeePerGas);
        if (tx.maxPriorityFeePerGas) tx.maxPriorityFeePerGas = BigInt(tx.maxPriorityFeePerGas);
        if (tx.chainId) tx.chainId = BigInt(tx.chainId);
        if (tx.nonce) tx.nonce = BigInt(tx.nonce);

        console.log(`Signing transaction ${i + 1}/${rawTxs.length}:`, tx);

        try {
          const signedTx = await wallet.signTransaction(tx);
          signedTxs.push(signedTx);
          console.log(`Transaction ${i + 1} signed successfully`);
        } catch (signError) {
          console.error(`Failed to sign transaction ${i + 1}:`, signError);
          return {
            status: false,
            message: "Transaction signing failed",
            details: signError.message || "User rejected transaction"
          };
        }
      }
       console.log("All transactions signed. Broadcasting...");
      const { res, err } = await proxyRequest("/v1/eth/swap-transaction/execute", PPOST, { txs: signedTxs });
      console.log("=====execute-----", res)
      if (err?.status) {
        return {
          status: false,
          message: err.message||"Swap failed",
          details: err.message||"faild to swap"
        };
      } if (res?.[0]?.txResponse?.hash) {
        console.log("=====execute0-----", res)
        return {
          status: true,
          message: "Swap completed successfully"
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
    if (err?.status) {
      CustomInfoProvider.show("error",err?.message||"Unable to get swap quotes");
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
            ? "Oops! Invalid amount."
            : result.message||"An error occurred. Please try again later.");
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
    <View style={{ backgroundColor: theme.bg, width: wp(100), height: hp(150) }}>
   
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
          <View style={[styles.exportBottomCon, { backgroundColor: theme.cardBg }]}>
           <View style={{width:wp(50)}}>
            <View style={styles.fromCon}>
             <Text style={[styles.networkHeading, { color: theme.headingTx }]}>From Network </Text>
              <Icon name={"information-outline"} type={"materialCommunity"} color={theme.headingTx} size={17} />
            </View>
             <View style={styles.fromCon}>
            <Text style={[styles.subInputText, { color: theme.inactiveTx }]}>{currentWalletType==="BNB"?"BNB":"ETH"} Balance : </Text>
             {balanceLoading ? (
                    <ActivityIndicator color={"green"} />
                  ):<View style={{ width: wp(15)}}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Text style={{ fontSize: 14, color: theme.headingTx }}>{networkBalance}</Text>
              </ScrollView>
            </View>}
            </View>
           </View>

            <TouchableOpacity
              style={[styles.FromSelectionCon, { backgroundColor: theme.bg}]}
              onPress={() => setChooseModalVisible(true)}
              disabled={balanceLoading}
            >
              <View style={{ flexDirection: "row",alignItems:"center" }}>
                <Image
                  source={{ uri: chooseItemList.find(item => item.name === currentWalletType)?.url }}
                  style={styles.fromConImg}
                />
                  <Text style={[styles.networkHeading, { color: theme.headingTx }]}>
                    {currentWalletType}
                  </Text>
              </View>
              <Icon name={"chevron-down"} type={"materialCommunity"} color={theme.headingTx} size={30} />
            </TouchableOpacity>

          </View>
          <View  style={[styles.card, { backgroundColor: theme.bg, flexDirection: "column", paddingVertical: 0,paddingHorizontal:0 }]}>
            <View style={[styles.card, { backgroundColor: theme.bg, flexDirection: "row", paddingVertical: 0, justifyContent: "space-between", borderColor: theme.inactiveTx, borderWidth: 0.4,marginTop:0,borderBottomLeftRadius:0,borderBottomRightRadius:0 }]}>
              <TouchableOpacity
                style={[styles.exportCon, { backgroundColor: theme.bg }]}
                onPress={() => { resetState(), setchooseModalVisible_choose(true) }}
                disabled={balanceLoading}
              >
                <View style={{ flexDirection: "row" }}>
                  <Image
                    source={{ uri: selectedToken?.logoURI || currentTokenList[0]?.logoURI }}
                    style={styles.logoImg_TOP_1}
                  />
                  <View>
                    <Text style={styles.networkSubHeading}>Assets</Text>
                    <Text style={[styles.networkHeading, { color: theme.headingTx }]} numberOfLines={1} ellipsizeMode="tail">{(selectedToken?.symbol || currentTokenList[0]?.symbol)?.slice(0, 10)}</Text>
                  </View>
                </View>
                <Icon name={"chevron-down"} type={"materialCommunity"} color={theme.headingTx} size={30} />
              </TouchableOpacity>
              <View style={[styles.InsufficientActionsCon, { backgroundColor: theme.cardBg }]}>
                <TouchableOpacity style={[styles.InsufficientActionsBtn, { backgroundColor: "#4052D6" }]} onPress={() => { navigation.navigate("EthSwap", { activeNetwork: chooseSelectedItemId === null ? chooseItemList[1].name : chooseSelectedItemId, activeAsset: selectedToken }) }}>
                  <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>Swap</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.InsufficientActionsBtn, { backgroundColor: "#fff" }]} onPress={() => { navigation.navigate("KycComponent", { tabName: "Buy" }) }}>
                  <Text style={{ color: "#4052D6", fontSize: 16, fontWeight: "600" }}>Buy</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={[styles.modalOpen, { paddingVertical: hp(1), backgroundColor: theme.bg }]}>
              <TextInput
                maxLength={50}
                placeholder={`Enter ${selectedToken?.symbol} amount`}
                placeholderTextColor={"gray"}
                keyboardType="decimal-pad"
                value={amount}
                style={[styles.textInputForCrossChain, { fontSize: 20, color: theme.headingTx }]}
                onChangeText={(value) => handleInputChange(
                  value,
                  currentWalletType,
                  selectedToken?.symbol,
                  selectedToken
                )}
                returnKeyType="done"
              />
               <View style={styles.formBalanceCon}>
              <Text style={[styles.subInputText, { color: theme.inactiveTx,fontSize:16 }]}>Available <TouchableOpacity onPress={async()=>{await fetchUSDCBalnce(selectedToken || currentTokenList[0],state?.wallet?.address)}} style={{marginTop:-2,marginRight:8}}>
                <Icon name={"refresh"} type={"materialCommunity"} size={20} color={theme.headingTx} />
              </TouchableOpacity></Text>
              <View style={{ width: wp(17) }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {balanceLoading ? (
                    <ActivityIndicator color={"green"} />
                  ) : (
                    <Text style={{ color: theme.headingTx, fontSize: 14 }}>
                      {WALLETBALANCE}
                    </Text>
                  )}
                </ScrollView>
              </View>
            </View>
            </View>
          </View>
          <View style={[styles.accountDetailsCon,{marginTop:hp(0.3)}]}>
            <Text style={[styles.subInputText, { color: theme.inactiveTx }]}>Active Wallet :</Text>
            <View style={{ width: "72%" }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Text style={{ fontSize: 14, color: theme.headingTx }}>{WALLETADDRESS}</Text>
              </ScrollView>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <View style={[styles.exportBottomCon, { backgroundColor: theme.cardBg }]}>
           <View style={{width:wp(59)}}>
            <View style={styles.fromCon}>
             <Text style={[styles.networkHeading, { color: theme.headingTx }]}>To Network </Text>
              <Icon name={"information-outline"} type={"materialCommunity"} color={theme.headingTx} size={17} />
            </View>
           </View>

            <TouchableOpacity
              style={[styles.FromSelectionCon, { backgroundColor: theme.bg,padding:6, width: wp(25)}]}
            >
              <View style={{ flexDirection: "row",alignItems:"center" }}>
                <Image
                  source={{ uri: "https://stellar.myfilebase.com/ipfs/QmSTXU2wn1USnmd5ZypA5zMze259wEPSDP3i8wivyr9qiq" }}
                  style={styles.fromConImg}
                />
                  <Text style={[styles.networkHeading, { color: theme.headingTx }]}>
                    Stellar
                  </Text>
              </View>
            </TouchableOpacity>
          </View>
        <View style={[{ backgroundColor: theme.cardBg, flexDirection: "row",marginTop:hp(2) }]}>

          <View style={[styles.receiveAssetCon, { backgroundColor: theme.bg }]}>
            <Image
              source={{ uri: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png" }}
              style={styles.receiveAssetImg}
            />
            <View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={[styles.networkHeading, { color: theme.headingTx }]}>USDC</Text>
              </View>
              <Text style={{ color: "gray", fontSize: 13 }}>(centre.io)</Text>
            </View>
          </View>
          <View style={{ flexDirection: "column" }}>
            <View style={{ flexDirection: "row",marginTop:-6 }}>
              <Text style={[styles.subInputText, { fontSize: 15, color: theme.headingTx }]}>Relayer Fee </Text>
              <Icon name={"gas-station"} type={"materialCommunity"} size={18} color={theme.headingTx} />
            </View>
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                style={[styles.feePayCon, { backgroundColor: payFeeType === "native" ? "#4052D6" : theme.bg,borderTopRightRadius:0,borderBottomRightRadius:0}]}
                onPress={() => setPayFeeType("native")}
              >
                <Image
                  source={{ uri: chooseItemList.find(item => item.name === currentWalletType)?.url }}
                  style={[styles.fromConImg,{marginRight:wp(0),marginLeft:hp(0)}]}
                />
                <Text style={[styles.feePayTx, { color: payFeeType === "native" ? "#fff" : theme.headingTx }]}>Native</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.feePayCon, { backgroundColor: payFeeType === "stable" ? "#4052D6" : theme.bg,borderTopLeftRadius:0,borderBottomLeftRadius:0}]}
                onPress={() => setPayFeeType("stable")}
              >
                <Image source={{ uri: selectedToken?.symbol === "USDC" ? reciverAsset.imageUrl : feeAsset.imageUrl }} style={styles.feeImage} />
                <Text style={[styles.feePayTx, { color: payFeeType === "stable" ? "#fff" : theme.headingTx }]}>{selectedToken?.symbol === "USDC" ? "USDC" : "USDT"}</Text>
              </TouchableOpacity>
            </View>
            </View>
          </View>
          
          <View style={[styles.receiveAmountCon, { backgroundColor: theme.smallCardBg }]}>
            <TextInput
              maxLength={100}
              placeholder={"0.00"}
              placeholderTextColor={"gray"}
              value={resQuotes?Math.max(
                    0,
                    parseFloat(resQuotes.minimumAmountOut || "0") -
                    parseFloat(
                      payFeeType === "native"
                        ? resQuotes?.fee?.native?.amount || "0"
                        : resQuotes?.fee?.stablecoin?.amount || "0"
                    )
                  ).toFixed(6):"0.00"}
              style={[styles.textInputForCrossChain, { fontSize: 20, color: theme.inactiveTx }]}
              editable={false}
            />
            <View style={[styles.accountDetailsCon,{marginTop:hp(0.3)}]}>
            <Text style={[styles.subInputText, { color: theme.inactiveTx }]}>≈ {feeData?.formattedUSD || `$${Number(feeData?.usdValue || 0).toFixed(2)}`}</Text>
            <Text style={[styles.subInputText, { color: theme.inactiveTx }]}>Min {resQuotes?resQuotes.minimumAmountOut:"0.00"} USDC</Text>
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
                <Text style={[styles.quoteLabel, { color: theme.inactiveTx }]}>Estimated time</Text>
                <Text style={[styles.quoteValue, { color: theme.headingTx }]}>
                  {resQuotes.completionTime ? (resQuotes.completionTime / (1000 * 60) + " Min") : "getting.."}
                </Text>
              </View>
                {payFeeType === "stable"&&<Text style={[styles.quoteLabel, { color: "orange",fontStyle:"italic" }]}>Note: The amount you enter includes the network fee, which will be deducted automatically.</Text>}
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
            <Text style={styles.nextButtonText}>{errorMsg !== null ? errorMsg : parseFloat(WALLETBALANCE) <= 0?"Insufficient Balance":"Confirm Transaction"}</Text>
          )}
        </TouchableOpacity>
        <RecentCrossChainTx activeWalletPublicKey={state && state.wallet && state.wallet.address} theme={state?.THEME?.THEME}/>

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

                  {/* <View style={[styles.searchContainer, { backgroundColor: theme.bg }]}>
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
                  </View> */}

                  <FlatList
                    data={currentTokenList}
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
                    // setshowTx(true);
                    navigation.navigate("StellarTransactions")
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
    paddingVertical: 10,
    borderRadius: 8,
    width: wp(34)
  },
  logoImg_TOP_1: {
    width: 33,
    height: 33,
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
    paddingHorizontal: 19,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems:"center",
    justifyContent:"center"
  },
  maxBtn: {
    color: 'white',
    fontWeight: '600',
  },
  modalOpen: {
    borderRadius: 8,
    paddingHorizontal: 8,
    flexDirection:"row"
  },
  textInputForCrossChain: {
    width: wp(61),
    paddingVertical:hp(0.5),
    marginLeft:wp(1)
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
    paddingVertical:hp(0.9),
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 2,
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
  },
  feeImage: {
    width: 25,
    height: 25,
    borderRadius: 20,
    marginRight: 3,
  },
  swapSuggestCon:{
    marginTop:hp(1),
    justifyContent:"space-between"
  },
  swapSuggestTex:{
    fontSize:16,
    color:"#fff",
    textAlign:"center"
  },
  swapSuggestBtn:{
    borderRadius:10,
    paddingHorizontal:wp(6),
    paddingVertical:hp(1.5),
    backgroundColor:"#4052D6"
  },
  InsufficientActionsCon:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-evenly",
    width:wp(48.6),
    borderTopRightRadius:10,
    borderBottomRightRadius:10,
    paddingVertical:10,
    borderLeftWidth:0.5,
    borderLeftColor:"gray"
  },
  InsufficientActionsBtn:{
    borderRadius:8,
    width:wp(20),
    paddingVertical:hp(1.1),
    alignItems:"center"
  },
  dismissCon:{
    position:"absolute",
    alignSelf:"flex-end",
    right:wp(1.5),
    top:hp(0.6)
  },
  fromCon: {
    width: wp(30),
    flexDirection: "row",
    marginLeft:wp(1)
  },
  fromConImg: {
    width: 25,
    height: 25,
    borderRadius: 20,
    marginRight:hp(0.5),
    marginLeft:hp(0.5),    
  },
  FromSelectionCon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    width: wp(35),
    padding:5,
    marginTop:-2,
    borderColor:"gray",
    borderWidth:0.6
  },
  formBalanceCon: {
    justifyContent: 'space-between',
    alignContent: 'center',
    paddingVertical: 4,
    width:wp(39),
    alignSelf:"flex-end",
    marginBottom:hp(1)
  },
  receiveAssetCon:{
    flexDirection: "row",
    width:wp(36),
    alignItems:"center",
    justifyContent:"center",
    borderRadius:13,
    marginRight:wp(3),
    marginVertical:-3
  },
  receiveAssetImg:{
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight:wp(2)
  },
  receiveAmountCon: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: hp(1),
    marginTop:hp(1.3)
  },
});

export default CrossChainTx;