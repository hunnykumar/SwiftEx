import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  NativeModules
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { ethers } from 'ethers';
import { Wallet_screen_header } from '../Dashboard/reusables/ExchangeHeader';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import Icon from "react-native-vector-icons/Ionicons";
import { useSelector } from 'react-redux';
import ErrorComponet from '../utilities/ErrorComponet';
import { fetchBSCTokenInfo, fetchTokenInfo } from './tokenUtils';
import Snackbar from 'react-native-snackbar';
import { PGET, PPOST, proxyRequest } from '../Dashboard/exchange/crypto-exchange-front-end-main/src/api';
import EtherTokens from "../Dashboard/tokens/tokenList.json";
import BNBTokens from "../Dashboard/tokens/pancakeSwap/PancakeList.json";
import { getTokenBalancesUsingAddress, getWalletBalance } from '../Dashboard/exchange/crypto-exchange-front-end-main/src/utils/getWalletInfo/EtherWalletService';
import ShortTermStorage from '../utilities/ShortTermStorage';

const NETWORK = [
  {
    symbol: 'ETH',
    logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
  },
  {
    symbol: 'BNB',
    logoURI:'https://tokens.pancakeswap.finance/images/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c.png'
  }
];

const EthSwap = () => {
  const navigation = useNavigation();
  const routeParam=useRoute();
  const FOCUSED = useIsFocused();
  const state = useSelector((state) => state);
  
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fromToken, setFromToken] = useState(EtherTokens[0]);
  const [toToken, setToToken] = useState(EtherTokens[1]);
  const [amount, setAmount] = useState('');
  const [quoteInfo, setQuoteInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showTokenList, setShowTokenList] = useState(false);
  const [selectingFor, setSelectingFor] = useState('from');
  const [fromTokenBalance, setFromTokenBalance] = useState('0.00');
  const [toTokenBalance, setToTokenBalance] = useState('0.00');
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [btnMessage, setbtnMessage] = useState("Swap");
  const [btnDisable, setbtnDisable] = useState(true);
  const [swapExecuting, setSwapExecuting] = useState(false);
  const [currentNetwork, setCurrentNetwork] = useState(0);

  const getSwapQuote = useCallback(async (tokenIn, tokenOut, amountIn, type) => {
    try {
      const { res, err } = await proxyRequest(
        `/v1/${type}/swap-quote`, 
        PPOST, 
        { 
          tokenIn: tokenIn, 
          tokenOut: tokenOut, 
          amount: amountIn 
        }
      );
      
      if (err?.status) {
        setErrorMessage(err.message || 'Failed to get quote. Please try again.');
        setErrorVisible(true);
        return null;
      }
      
      return res;
    } catch (error) {
      console.error('Quote error:', error);
      setErrorMessage('Network error. Please check your connection.');
      setErrorVisible(true);
      return null;
    }
  }, []);

  const getTokesBalance = useCallback(async (token0, token1) => {
    try {
      setBalanceLoading(true);
      const addresses = [token0, token1];
      const walletAddress = state?.wallet?.address;
      
      const responseBalance = await fetchTokenInfo(addresses, walletAddress);
      
      const balance0 = parseFloat(responseBalance[0]?.balance || 0);
      const balance1 = parseFloat(responseBalance[1]?.balance || 0);
      const decimals0 = Number(responseBalance[0]?.decimals || 18);
      const decimals1 = Number(responseBalance[1]?.decimals || 18);
      
      setFromTokenBalance(balance0.toFixed(balance0 === 0 ? 3 : Math.min(decimals0, 6)));
      setToTokenBalance(balance1.toFixed(balance1 === 0 ? 3 : Math.min(decimals1, 6)));
    } catch (error) {
      console.error("Error fetching token balance:", error);
      Snackbar.show({
        text: "Unable to fetch balance",
        duration: Snackbar.LENGTH_SHORT,
        backgroundColor: '#ff6b6b',
      });
    } finally {
      setBalanceLoading(false);
    }
  }, [state?.wallet?.address]);

  const getBSCTokenBalance = useCallback(async (token0, token1) => {
    try {
      setBalanceLoading(true);
      const addresses = [token0, token1];
      const walletAddress = state?.wallet?.address;
      
      const responseBalance = await fetchBSCTokenInfo(addresses, walletAddress);
      
      const balance0 = parseFloat(responseBalance[0]?.balance || 0);
      const balance1 = parseFloat(responseBalance[1]?.balance || 0);
      const decimals0 = Number(responseBalance[0]?.decimals || 18);
      const decimals1 = Number(responseBalance[1]?.decimals || 18);
      
      setFromTokenBalance(balance0.toFixed(balance0 === 0 ? 3 : Math.min(decimals0, 6)));
      setToTokenBalance(balance1.toFixed(balance1 === 0 ? 3 : Math.min(decimals1, 6)));
    } catch (error) {
      console.error("Error fetching BSC token balance:", error);
      Snackbar.show({
        text: "Unable to fetch balance",
        duration: Snackbar.LENGTH_SHORT,
        backgroundColor: '#ff6b6b',
      });
    } finally {
      setBalanceLoading(false);
    }
  }, [state?.wallet?.address]);

  // Update quote when amount changes
  useEffect(() => {
    let timeoutId;

    const updateQuote = async () => {
      if (!amount || parseFloat(amount) === 0) {
        setQuoteInfo(null);
        setbtnDisable(true);
        setbtnMessage("Enter amount");
        return;
      }

      setLoading(true);
      
      try {
        const type = currentNetwork === 0 ? "eth" : "bsc";
        const quote = await getSwapQuote(fromToken, toToken, amount, type);
        
        if (quote) {
          setQuoteInfo(quote);
          
          // Validate balance
          const amountNum = parseFloat(amount);
          const balanceNum = parseFloat(fromTokenBalance);
          
          if (amountNum > balanceNum) {
            setbtnDisable(true);
            setbtnMessage("Insufficient Balance");
          } else {
            setbtnDisable(false);
            setbtnMessage("Swap");
          }
        } else {
          setbtnDisable(true);
          setbtnMessage("No route found");
        }
      } catch (error) {
        console.error('Update quote error:', error);
        setQuoteInfo(null);
        setbtnDisable(true);
        setbtnMessage("Quote failed");
      } finally {
        setLoading(false);
      }
    };

    // Debounce quote updates
    timeoutId = setTimeout(() => {
      updateQuote();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [amount, fromToken, toToken, currentNetwork, fromTokenBalance]);

  // Fetch balances when tokens change
  useEffect(() => {
    const fetchBalances = async () => {
      if (currentNetwork === 0) {
        await getTokesBalance(fromToken.address, toToken.address);
      } else {
        await getBSCTokenBalance(fromToken.address, toToken.address);
      }
    };

    fetchBalances();
  }, [fromToken, toToken, currentNetwork]);

  // Network change handler
  useEffect(() => {
    setAmount('');
    setQuoteInfo(null);

    const initByNetwork = async () => {
      if (currentNetwork === 0) {
        const from = EtherTokens[0];
        const to =
          routeParam.params?.activeNetwork === "Ethereum" &&
            routeParam.params?.activeAsset
            ? routeParam.params.activeAsset
            : EtherTokens[1];

        setFromToken(from);
        setToToken(to);

        await getTokesBalance(from.address, to.address);
      }
      if (currentNetwork === 1) {
        const from = BNBTokens[0];

        const to =
          routeParam.params?.activeNetwork === "BNB" &&
            routeParam.params?.activeAsset
            ? routeParam.params.activeAsset
            : BNBTokens[1];

        setFromToken(from);
        setToToken(to);

        await getBSCTokenBalance(from.address, to.address);
      }
    };

    initByNetwork();
  }, [currentNetwork]);

  // Focus handler
  useEffect(() => {
    if (!FOCUSED) return;
    if (routeParam.params?.activeNetwork === "BNB") {
      setCurrentNetwork(1);
      return;
    }
    if (routeParam.params?.activeNetwork === "Ethereum") {
      setCurrentNetwork(0);
      return;
    }
    setCurrentNetwork(0);
  }, [FOCUSED]);


  // Token selector component
  const TokenSelector = ({ token, onPress, balance }) => (
    <TouchableOpacity 
      disabled={loading} 
      style={[
        styles.tokenSelector,
        { backgroundColor: state?.THEME?.THEME === false ? "#FFFFFF" : "#1B1B1C" }
      ]} 
      onPress={onPress}
    >
      <View style={[styles.tokenContainer, { width: wp(40) }]}>
        <Image source={{ uri: token.logoURI }} style={[styles.logoImage, { marginRight: 5 }]} />
        <Text style={[styles.tokenSymbol, { color: state?.THEME?.THEME === false ? "black" : "#fff" }]}>
          {token.symbol}
        </Text>
      </View>
      {balanceLoading ? (
        <ActivityIndicator size="small" color="#4052D6" />
      ) : (
        <Text style={styles.tokenBalance} numberOfLines={1}>
          Balance: {balance}
        </Text>
      )}
    </TouchableOpacity>
  );

  // Token list modal
  const TokenListModal = () => {
    const [searchQuery, setSearchQuery] = useState('');
    
    const filteredTokens = useMemo(() => {
      const tokens = NETWORK[currentNetwork].symbol === "ETH" ? EtherTokens : BNBTokens;
      
      if (!searchQuery.trim()) {
        return tokens;
      }
      
      const query = searchQuery.toLowerCase().trim();
      
      return tokens.filter(token => {
        const symbolMatch = token.symbol?.toLowerCase().includes(query);
        const nameMatch = token.name?.toLowerCase().includes(query);
        const addressMatch = token.address?.toLowerCase().includes(query);
        return symbolMatch || nameMatch || addressMatch;
      });
    }, [searchQuery, currentNetwork]);

    return (
      <Modal
        visible={showTokenList}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTokenList(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowTokenList(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={[
                styles.modalContent, 
                { backgroundColor: state?.THEME?.THEME === false ? "#F4F4F8" : "#242426" }
              ]}>
                <Text style={[
                  styles.modalTitle, 
                  { color: state?.THEME?.THEME === false ? "black" : "#fff" }
                ]}>
                  Select Token
                </Text>
                
                <View style={[styles.searchContainer, {
                  backgroundColor: state?.THEME?.THEME === false ? "#f8f9fa" : "#2a2a2a",
                  borderColor: state?.THEME?.THEME === false ? "#e9ecef" : "#404040"
                }]}>
                  <TextInput
                    style={[styles.searchInput, {
                      color: state?.THEME?.THEME === false ? "black" : "#fff"
                    }]}
                    placeholder="Search by name, symbol, or address..."
                    placeholderTextColor={state?.THEME?.THEME === false ? "#6c757d" : "#888"}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                      <Text style={[styles.clearButtonText, {
                        color: state?.THEME?.THEME === false ? "#6c757d" : "#888"
                      }]}>×</Text>
                    </TouchableOpacity>
                  )}
                </View>
                
                {searchQuery.trim() && (
                  <Text style={[styles.resultsText, {
                    color: state?.THEME?.THEME === false ? "#6c757d" : "#888"
                  }]}>
                    {filteredTokens.length} token{filteredTokens.length !== 1 ? 's' : ''} found
                  </Text>
                )}
                
                <FlatList
                  data={filteredTokens}
                  keyExtractor={(item) => item.address}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.tokenListItem}
                      onPress={() => {
                        if (selectingFor === 'from') {
                          if (item.address === toToken.address) {
                            Snackbar.show({
                              text: "Cannot select same token",
                              duration: Snackbar.LENGTH_SHORT,
                              backgroundColor: '#ff6b6b',
                            });
                            return;
                          }
                          setFromToken(item);
                        } else {
                          if (item.address === fromToken.address) {
                            Snackbar.show({
                              text: "Cannot select same token",
                              duration: Snackbar.LENGTH_SHORT,
                              backgroundColor: '#ff6b6b',
                            });
                            return;
                          }
                          setToToken(item);
                        }
                        setShowTokenList(false);
                        setSearchQuery('');
                      }}
                    >
                      <View style={styles.tokenContainer}>
                        <Image source={{ uri: item.logoURI }} style={styles.logoImage} />
                        <View style={styles.tokenDetaisContainer}>
                          <Text style={[
                            styles.tokenListSymbol, 
                            { color: state?.THEME?.THEME === false ? "black" : "#fff" }
                          ]}>
                            {item.symbol}
                          </Text>
                          <Text style={[
                            styles.tokenListName, 
                            { color: state?.THEME?.THEME === false ? "#666" : "#888" }
                          ]}>
                            {item.name}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                      <Text style={[styles.emptyText, {
                        color: state?.THEME?.THEME === false ? "#6c757d" : "#888"
                      }]}>
                        No tokens found matching "{searchQuery}"
                      </Text>
                    </View>
                  )}
                />
                
                <TouchableOpacity
                  style={[
                    styles.closeButton, 
                    { backgroundColor: state?.THEME?.THEME === false ? "#f8f9fa" : "#080a0a" }
                  ]}
                  onPress={() => {
                    setShowTokenList(false);
                    setSearchQuery('');
                  }}
                >
                  <Text style={[
                    styles.closeButtonText, 
                    { color: state?.THEME?.THEME === false ? "black" : "#fff" }
                  ]}>
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  // Handle amount input
  const handleChange = (text, decimals) => {
    const regex = new RegExp(`^\\d*(\\.\\d{0,${decimals}})?$`);
    if (regex.test(text) || text === '') {
      setAmount(text);
    }
  };

  // Swap tokens
  const tokenHandle = () => {
    setAmount('');
    setFromToken(toToken);
    setToToken(fromToken);
    setFromTokenBalance(toTokenBalance);
    setToTokenBalance(fromTokenBalance);
  };

  // Execute swap
  const handleSwap = async () => {
    Keyboard.dismiss();
    
    if (!amount || parseFloat(amount) === 0) {
      Snackbar.show({
        text: "Please enter a valid amount",
        duration: Snackbar.LENGTH_SHORT,
        backgroundColor: '#ff6b6b',
      });
      return;
    }

    if (parseFloat(amount) > parseFloat(fromTokenBalance)) {
      Snackbar.show({
        text: "Insufficient balance",
        duration: Snackbar.LENGTH_SHORT,
        backgroundColor: '#ff6b6b',
      });
      return;
    }

    setSwapExecuting(true);

    try {
      // const result = await swapForEth(amount, state?.wallet?.privateKey);
      const result = currentNetwork === 0 ? await swapForEth(amount, state?.wallet?.privateKey): await swapBnb(amount, state?.wallet?.privateKey);
      console.log("swap result",result)
      if (result.status) {
        Snackbar.show({
          text: "Swap successful!",
          duration: Snackbar.LENGTH_LONG,
          backgroundColor: '#51cf66',
        });
        
        // Reset form
        setAmount('');
        setQuoteInfo(null);
        
        // Refresh balances
        if (currentNetwork === 0) {
          await getTokesBalance(fromToken.address, toToken.address);
        } else {
          await getBSCTokenBalance(fromToken.address, toToken.address);
        }
        
        // Navigate after short delay
        setTimeout(() => {
          navigation.navigate("Transactions");
        }, 1000);
      } else {
        Snackbar.show({
          text: result.message || "Swap failed",
          duration: Snackbar.LENGTH_LONG,
          backgroundColor: '#ff6b6b',
        });
      }
    } catch (error) {
      console.error('Swap error:', error);
      Snackbar.show({
        text: error.message || "Swap failed. Please try again",
        duration: Snackbar.LENGTH_LONG,
        backgroundColor: '#ff6b6b',
      });
    } finally {
      setSwapExecuting(false);
    }
  };

  // Swap execution function
  const swapForEth = async (amount, privateKey) => {
    try {
      const wallet = new ethers.Wallet(privateKey);
      const address = await wallet.getAddress();

      const payload = {
        tokenIn: fromToken,
        tokenOut: toToken,
        amount: amount,
        recipient: address,
      };

      console.log("Preparing swap:", payload);

      const respo = await proxyRequest("/v1/eth/swap-transaction/prepare", PPOST, payload);

      if (respo.err?.status) {
        return {
          status: false,
          message: respo.err.message || "Failed to prepare swap",
        };
      }

      const rawTxs = respo.res;
      
      if (!rawTxs || rawTxs.length === 0) {
        return {
          status: false,
          message: "No transactions to sign",
        };
      }

      const signedTxs = [];

      for (let i = 0; i < rawTxs.length; i++) {
        const tx = rawTxs[i];
        
        try {
          let transaction;
          let chainId = tx.chainId ? Number(tx.chainId) : 1;
          const isEIP1559 = tx.maxFeePerGas !== undefined && tx.maxPriorityFeePerGas !== undefined;
          
          if (isEIP1559) {
            const gasPrice = tx.maxFeePerGas;
            transaction = {
              nonce: ethers.utils.hexlify(tx.nonce || 0),
              gasPrice: ethers.utils.hexlify(ethers.BigNumber.from(gasPrice.toString())),
              gasLimit: ethers.utils.hexlify(ethers.BigNumber.from(tx.gasLimit?.toString() || "21000")),
              to: tx.to,
              value: ethers.utils.hexlify(ethers.BigNumber.from(tx.value?.toString() || "0")),
              data: tx.data || "0x",
            };
          } else {
            transaction = {
              nonce: ethers.utils.hexlify(tx.nonce || 0),
              gasPrice: ethers.utils.hexlify(ethers.BigNumber.from(tx.gasPrice?.toString() || "0")),
              gasLimit: ethers.utils.hexlify(ethers.BigNumber.from(tx.gasLimit?.toString() || "21000")),
              to: tx.to,
              value: ethers.utils.hexlify(ethers.BigNumber.from(tx.value?.toString() || "0")),
              data: tx.data || "0x",
            };
          }
          const signedTx = await NativeModules.TransactionSigner.signTransaction(
            "eth",
            address,
            JSON.stringify(transaction),
            chainId
          );

          let rawTransaction = signedTx.signedTx;
          if (rawTransaction.startsWith("0x0x")) {
            rawTransaction = rawTransaction.replace(/^0x/, "");
          }
          signedTxs.push(rawTransaction);
          console.log(`Transaction ${i + 1}/${rawTxs.length} signed`);
        } catch (signError) {
          console.error(`Sign error:`, signError);
          return {
            status: false,
            message: "Transaction signing failed",
          };
        }
      }

      console.log("Broadcasting transactions...");
      
      const { res, err } = await proxyRequest("/v1/eth/swap-transaction/execute", PPOST, { txs: signedTxs });

      if (err?.status) {
        return {
          status: false,
          message: err.message || "Broadcast failed",
        };
      }

      if (Array.isArray(res) && res.length > 0) {
        const validTxs = res.filter(item => item?.txResponse?.hash);
        
        for (const tx of validTxs) {
          await ShortTermStorage.saveTx(state?.wallet?.address, {
            chain: "ETH",
            typeTx: "Swap",
            status: "Pending",
            hash: tx.txResponse.hash,
          });
        }

        return {
          status: true,
          message: "Swap completed successfully",
        };
      }

      return {
        status: false,
        message: "No transaction hash received",
      };
    } catch (error) {
      console.error("Swap execution error:", error);
      return {
        status: false,
        message: error.message || "Swap failed",
      };
    }
  };

  // Bnb Swap execution function
  const swapBnb = async (amount, privateKey) => {
    try {
      const wallet = new ethers.Wallet(privateKey);
      const address = await wallet.getAddress();

      const payload = {
        tokenIn: fromToken,
        tokenOut: toToken,
        amount: amount,
        recipient: address,
        slippage: 1,
      };

      console.log("Preparing BSC swap:", payload);

      const respo = await proxyRequest("/v1/bsc/swap-transaction/prepare", PPOST, payload);

      if (respo.err?.status) {
        return {
          status: false,
          message: respo.err.message || "Failed to prepare swap",
        };
      }

      const rawTxs = respo.res;

      if (!rawTxs || rawTxs.length === 0) {
        return {
          status: false,
          message: "No transactions to sign",
        };
      }

      console.log(`Signing ${rawTxs.length} transaction(s)...`);
      const signedTxs = [];

      for (let i = 0; i < rawTxs.length; i++) {
        const tx = rawTxs[i];

        const formattedTx = {
          chainId: parseInt(tx.chainId) || 56,
          to: tx.to,
          nonce: ethers.utils.hexlify(Number(tx.nonce)),
          gasPrice: ethers.utils.hexlify(Number(tx.gasPrice)),
          gasLimit: ethers.utils.hexlify(Number(tx.gasLimit)),  // 🔧 MAIN FIX
          value: ethers.utils.hexlify(ethers.BigNumber.from(tx.value || 0)),
          data: tx.data?.startsWith("0x") ? tx.data : "0x" + (tx.data || ""),
        };

        console.log(`Signing tx ${i + 1}:`, {
          to: formattedTx.to,
          nonce: formattedTx.nonce,
          gasLimit: formattedTx.gasLimit.toString(),
          gasPrice: formattedTx.gasPrice.toString(),
          value: formattedTx.value.toString(),
        });

        try {
        const signedTx = await NativeModules.TransactionSigner.signTransaction(
            "bsc",
            address,
            JSON.stringify(formattedTx),
            56
          );

          let rawTx = signedTx.signedTx;
          if (rawTx.startsWith("0x0x")) {
            rawTx = rawTx.replace(/^0x/, "");
          }
          signedTxs.push(rawTx);
          console.log(`Transaction ${i + 1}/${rawTxs.length} signed`);
        } catch (signError) {
          console.log(`Sign error for tx ${i}:`, signError);
          return {
            status: false,
            message: `Transaction ${i + 1} signing failed: ${signError.shortMessage || signError.message}`,
          };
        }
      }

      console.log("Broadcasting BSC transactions...");
      const broadcastPayload = signedTxs.length === 1
        ? { signedTx: signedTxs[0] }
        : { signedTransactions: signedTxs };

      const { res, err } = await proxyRequest(
        "/v1/bsc/transaction/broadcast",
        PPOST,
        broadcastPayload
      );

      if (err?.status) {
        return {
          status: false,
          message: err.message || "Broadcast failed",
        };
      }

      console.log("Broadcast response:", res);

      if (res?.txHash) {
        await ShortTermStorage.saveTx(state?.wallet?.address, {
          chain: "BNB",
          typeTx: "Swap",
          status: "Pending",
          hash: res.txHash,
        });

        return {
          status: true,
          message: "Swap completed successfully",
          txHash: res.txHash,
        };
      }

      if (res?.success && res?.results && Array.isArray(res.results)) {
        console.log(`Saving ${res.results.length} transactions...`);

        for (let i = 0; i < res.results.length; i++) {
          const result = res.results[i];

          console.log(`Saving transaction ${i + 1}:`, {
            hash: result.transactionHash,
            type: result.type,
            status: result.status,
          });

          try {
            await ShortTermStorage.saveTx(state?.wallet?.address, {
              chain: "BNB",
              typeTx: result.type === 'approve' ? 'Approve' : 'Swap',
              status: "Pending",
              hash: result.transactionHash,
            });

            console.log(`Transaction ${i + 1} saved successfully`);
          } catch (saveError) {
            console.log(`Failed to save transaction ${i + 1}:`, saveError);
          }
        }

        console.log('All transactions saved');

        return {
          status: true,
          message: "Swap completed successfully",
          txCount: res.totalTransactions,
          results: res.results,
        };
      }

      return {
        status: false,
        message: "No transaction hash received",
      };
    } catch (error) {
      console.error("BSC swap execution error:", error);
      return {
        status: false,
        message: error.message || "BSC swap failed",
      };
    }
  };

  return (
    <View style={{ backgroundColor: state?.THEME?.THEME === false ? "#FFF" : "#1B1B1C", flex: 1 }}>
      <Wallet_screen_header title="Swap" onLeftIconPress={() => navigation.goBack()} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <ErrorComponet
          isVisible={errorVisible}
          onClose={() => setErrorVisible(false)}
          message={errorMessage}
        />

        <View style={[styles.container, { backgroundColor: state?.THEME?.THEME === false ? "#FFF" : "#1B1B1C" }]}>
          {/* Network Selector */}
          <View style={[styles.card, { backgroundColor: state?.THEME?.THEME === false ? "#F4F4F8" : "#242426" }]}>
            <View style={styles.networkCon}>
              <Text style={styles.label}>Network</Text>
            </View>
            <TouchableOpacity 
              style={[styles.headerCard, { backgroundColor: state?.THEME?.THEME === false ? "#FFFFFF" : "#1B1B1C" }]} 
              onPress={() => setCurrentNetwork(currentNetwork === 0 ? 1 : 0)}
            >
              <View style={styles.assetInfo}>
                <Image source={{ uri: NETWORK[currentNetwork].logoURI }} style={styles.assetIcon} />
                <View>
                  <Text style={[styles.assetName, { color: state?.THEME?.THEME ? "#FFF" : "#000" }]}>
                    {NETWORK[currentNetwork].symbol}
                  </Text>
                  <Text style={[styles.assetSymbol, { color: state?.THEME?.THEME ? "#8B8B99" : "#666" }]}>
                    Active Network
                  </Text>
                </View>
              </View>
              <Icon name="arrow-down" size={30} color="#666" />
            </TouchableOpacity>
          </View>

          {/* From Token */}
          <View style={[styles.card, { backgroundColor: state?.THEME?.THEME === false ? "#F4F4F8" : "#242426", marginTop: hp(1) }]}>
            <View style={styles.networkCon}>
              <Text style={styles.label}>From</Text>
            </View>
            <TokenSelector
              token={fromToken}
              onPress={() => {
                setSelectingFor('from');
                setShowTokenList(true);
              }}
              balance={fromTokenBalance}
            />
            <TextInput
              maxLength={30}
              returnKeyType="done"
              style={[
                styles.input,
                { 
                  backgroundColor: state?.THEME?.THEME === false ? "#FFFFFF" : "#1B1B1C",
                  color: state?.THEME?.THEME === false ? "black" : "#fff" 
                }
              ]}
              value={amount}
              onChangeText={(text) => handleChange(text, fromToken.decimals)}
              placeholder="0.0"
              keyboardType="decimal-pad"
              placeholderTextColor="#666"
            />
          </View>

          {/* Swap Button */}
          <TouchableOpacity 
            style={[styles.swapButton, { backgroundColor: state?.THEME?.THEME === false ? "#FFFFFF" : "#1B1B1C" }]} 
            onPress={tokenHandle}
          >
            <Icon name="swap-vertical" size={24} color="#4052D6" />
          </TouchableOpacity>

          {/* To Token */}
          <View style={[styles.card, { backgroundColor: state?.THEME?.THEME === false ? "#F4F4F8" : "#242426", marginTop: -2 }]}>
            <View style={styles.networkCon}>
              <Text style={styles.label}>To</Text>
            </View>
            <TokenSelector
              token={toToken}
              onPress={() => {
                setSelectingFor('to');
                setShowTokenList(true);
              }}
              balance={toTokenBalance}
            />
            {quoteInfo && (
              <View style={[
                styles.quoteTextCon,
                { backgroundColor: state?.THEME?.THEME === false ? "#fff" : "#1B1B1C" }
              ]}>
                <Text style={[styles.quoteText, { color: state?.THEME?.THEME === false ? "black" : "#fff" }]}>
                  ≈
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <Text style={[styles.quoteText, { color: state?.THEME?.THEME === false ? "black" : "#fff" }]}>
                    {quoteInfo.outputAmount}
                  </Text>
                </ScrollView>
                <Text style={[styles.quoteText, { color: state?.THEME?.THEME === false ? "black" : "#fff" }]}>
                  {quoteInfo.outputToken}
                </Text>
              </View>
            )}
          </View>

          {/* Quote Details */}
          {quoteInfo && (
            <View style={[
              styles.quoteDetailsContainer,
              { backgroundColor: state?.THEME?.THEME === false ? "#F4F4F8" : "#242426" }
            ]}>
              <Text style={[styles.quoteTitle, { color: state?.THEME?.THEME === false ? "black" : "#fff" }]}>
                Quote Details
              </Text>
              
              <View style={styles.quoteRow}>
                <Text style={styles.quoteLabel}>Rate</Text>
                <Text style={[styles.quoteValue, { color: state?.THEME?.THEME === false ? "black" : "#fff" }]}>
                  1 {quoteInfo.inputToken} = {parseFloat(quoteInfo.pricePerToken).toFixed(6)} {quoteInfo.outputToken}
                </Text>
              </View>

              <View style={styles.quoteRow}>
                <Text style={styles.quoteLabel}>Fee Tier</Text>
                <Text style={[styles.quoteValue, { color: state?.THEME?.THEME === false ? "black" : "#fff" }]}>
                  {quoteInfo.fee.includes(',') ? 'Multi-hop' : `${parseFloat(quoteInfo.fee) / 10000}%`}
                </Text>
              </View>

              {quoteInfo.route && quoteInfo.route !== 'direct' && (
                <View style={styles.quoteRow}>
                  <Text style={styles.quoteLabel}>Route</Text>
                  <Text style={[styles.quoteValue, { color: state?.THEME?.THEME === false ? "black" : "#fff" }]}>
                    {quoteInfo.route}
                  </Text>
                </View>
              )}

              <View style={styles.quoteRow}>
                <Text style={styles.quoteLabel}>Minimum Received</Text>
                <View style={{ width: wp(25), flexDirection: "row" }}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <Text style={[styles.quoteValue, { color: state?.THEME?.THEME === false ? "black" : "#fff" }]}>
                      {parseFloat(quoteInfo.outputAmount).toFixed(6)}
                    </Text>
                  </ScrollView>
                  <Text style={[styles.quoteValue, { color: state?.THEME?.THEME === false ? "black" : "#fff" }]}>
                    {' '}{quoteInfo.outputToken}
                  </Text>
                </View>
              </View>
              
              <Text style={[styles.disclaimerText, { color: state?.THEME?.THEME === false ? "#666" : "#888" }]}>
                * This transaction may include extra fees if it involves multiple hops.
              </Text>
            </View>
          )}

          {/* Loading */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4052D6" />
              <Text style={styles.loadingText}>Getting best quote...</Text>
            </View>
          )}

          {/* Swap Button */}
          <TouchableOpacity 
            style={[
              styles.swapButtonCon,
              { backgroundColor: btnDisable || swapExecuting ? "#666" : "#4052D6" }
            ]} 
            disabled={btnDisable || swapExecuting} 
            onPress={handleSwap}
          >
            {swapExecuting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.swapButtonConText}>{btnMessage}</Text>
            )}
          </TouchableOpacity>
        </View>

        <TokenListModal />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    alignSelf: "center",
    width: "100%",
    minHeight: hp(80),
  },
  card: {
    backgroundColor: '#F4F4F8',
    borderRadius: 16,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(3),
  },
  swapButton: {
    borderColor: "#4052D6",
    borderWidth: 1,
    borderRadius: 100,
    padding: 10,
    alignSelf: 'center',
    marginVertical: -16,
    zIndex: 1,
    position: "relative",
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  tokenSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  tokenSymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: "black"
  },
  tokenBalance: {
    fontSize: 14,
    color: '#666',
    width: wp(40),
    textAlign: "right"
  },
  input: {
    fontSize: 24,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    color: '#000',
  },
  quoteTextCon: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  quoteText: {
    fontSize: 24,
    borderRadius: 8,
  },
  quoteDetailsContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  quoteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: "black"
  },
  quoteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quoteLabel: {
    fontSize: 14,
    color: '#666',
  },
  quoteValue: {
    fontSize: 14,
    fontWeight: '500',
    color: "black"
  },
  disclaimerText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: hp(1.5),
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tokenListItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tokenListSymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: "black"
  },
  tokenListName: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginTop: 16,
  },
  closeButtonText: {
    fontSize: 16,
    color: 'black',
  },
  tokenContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  tokenDetaisContainer: {
    marginLeft: 10
  },
  logoImage: {
    height: hp(4),
    width: wp(8.5),
    borderRadius: hp(2),
  },
  swapButtonCon: {
    width: wp(90),
    backgroundColor: "#4052D6",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: hp(2.5),
    paddingHorizontal: wp(2),
    paddingVertical: hp(2),
    borderRadius: 10,
  },
  swapButtonConText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "500"
  },
  networkCon: {
    width: "99%",
    justifyContent: "space-between",
    flexDirection: "row",
    alignContent: "space-evenly",
    padding: 1
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 5,
    marginLeft: 10,
  },
  clearButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  resultsText: {
    fontSize: 12,
    marginBottom: 10,
    marginHorizontal: 15,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  headerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: wp(2),
    borderRadius: 16,
  },
  assetInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  assetIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: wp(3),
  },
  assetName: {
    fontSize: 20,
    fontWeight: "700",
  },
  assetSymbol: {
    fontSize: 14,
  },
});

export default EthSwap;