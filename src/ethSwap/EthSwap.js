
import React, { useState, useEffect, useMemo } from 'react';
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
  Keyboard
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { ethers } from 'ethers';
import { Wallet_screen_header } from '../Dashboard/reusables/ExchangeHeader';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import Icon from "react-native-vector-icons/Ionicons";
import { useSelector } from 'react-redux';
import ErrorComponet from '../utilities/ErrorComponet';
import { fetchBSCTokenInfo, fetchTokenInfo } from './tokenUtils';
import { main, swapUSDCtoWETH } from './SwapExecution';
import Snackbar from 'react-native-snackbar';
import { swapETHtoUSDC } from './MutiStepSwap';
import { SaveTransaction } from '../utilities/utilities';
import { PGET, PPOST, proxyRequest } from '../Dashboard/exchange/crypto-exchange-front-end-main/src/api';

import EtherTokens from "../Dashboard/tokens/tokenList.json";
import BNBTokens from "../Dashboard/tokens/pancakeSwap/PancakeList.json";
import { getTokenBalancesUsingAddress, getWalletBalance } from '../Dashboard/exchange/crypto-exchange-front-end-main/src/utils/getWalletInfo/EtherWalletService';

// Token List
const TOKENS = [
  {
    symbol: 'WETH',
    name: 'Wrapped Ethereum',
    decimals: 18,
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 
    balance: '1.5',
    logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",

  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    balance: '1000',
    logoURI:'https://tokens.pancakeswap.finance/images/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d.png'
  }
];

const NETWORK=[
  {
    symbol: 'ETH',
    logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
  },
  {
    symbol: 'BNB',
    logoURI:'https://tokens.pancakeswap.finance/images/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c.png'
  }
]

const EthSwap = () => {
  const navigation=useNavigation();
  const FOCUSED=useIsFocused();
  const state=useSelector((state)=>state);
  const [ErroVisible,setErroVisible]=useState(false);
  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS[1]);
  const [amount, setAmount] = useState('');
  const [quoteInfo, setQuoteInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showTokenList, setShowTokenList] = useState(false);
  const [selectingFor, setSelectingFor] = useState('from');
  const [WETHBAL, setWETHBAL] = useState(0.00);
  const [USDCBAL, setUSDCBAL] = useState(0.00);
  const [allblnLoading, setallblnLoading] = useState(false);
  const [btnMessage,setbtnMessage]=useState("Swap");
  const [btnDisable,setbtnDisable]=useState(false);
  const [SwapExecution,setSwapExecution]=useState(false);
  const [currentNetwork,setCurrentNetwork]=useState(0);


  const getSwapQuote = async (tokenIn, tokenOut, amountIn,type) => {
    const { res, err } = await proxyRequest(`/v1/${type}/swap-quote`, PPOST, { tokenIn: tokenIn, tokenOut: tokenOut, amount: amountIn });
    console.log(res, err)
    if (err?.status === 500) {
      setErroVisible(true);
      setQuoteInfo(null);
      setLoading(false);
    }
    else {
      return res;
    }
  };

  useEffect(() => {
    const updateQuote = async () => {
      if (!amount || parseFloat(amount) === 0) {
        setQuoteInfo(null);
        return;
      }

      setLoading(true);
      try {
        if (currentNetwork === 0) {
        await getTokesBalance(fromToken.address,toToken.address)
        const quote = await getSwapQuote(fromToken, toToken, amount,"eth");
        setQuoteInfo(quote);
        }
        if (currentNetwork === 1) {
         await getBSCTokenBalance(fromToken.address, toToken.address)
          const quote = await getSwapQuote(fromToken, toToken, amount,"bsc");
          setQuoteInfo(quote);
        }
      } catch (error) {
        console.log(error);
        // Alert.alert('Error', 'Failed to get quote');
        setErroVisible(true);
        setQuoteInfo(null);
      } finally {
        if (Number(amount)===0) {
          if (!amount) {
            setbtnDisable(true);
            setbtnMessage("Swap");
          } else {
            setbtnDisable(true);
            setbtnMessage("Invalid Amount");
          }
        }
        if (Number(amount)>Number(WETHBAL)) {
          setbtnDisable(true);
          setbtnMessage("Insufficient Balance");
        }
        else {
          setbtnDisable(false);
          setbtnMessage("Swap")
        }
        setLoading(false);
      }
    };

    updateQuote();
  }, [amount, fromToken, toToken]);


  useEffect(() => {
    const updateBalances=async()=>{
      if (currentNetwork === 0) {
        setallblnLoading(true);
        setFromToken(EtherTokens[0])
        setToToken(EtherTokens[1])
        await getTokesBalance(EtherTokens[0].address,EtherTokens[1].address)
        if (Number(amount)===0) {
          if (!amount) {
            setbtnDisable(true);
            setbtnMessage("Swap");
          } else {
            setbtnDisable(true);
            setbtnMessage("Invalid Amount");
          }
        }
        if (Number(amount)>Number(WETHBAL)) {
          setbtnDisable(true);
          setbtnMessage("Insufficient Balance");
        }
        else {
          setbtnDisable(false);
          setbtnMessage("Swap")
        }
      } else {
        await getBSCTokenBalance(BNBTokens[0].address,BNBTokens[1].address)
        setallblnLoading(true);
        setFromToken(BNBTokens[0])
        setToToken(BNBTokens[1])
        setallblnLoading(false);
        if (Number(amount)===0) {
          if (!amount) {
            setbtnDisable(true);
            setbtnMessage("Swap");
          } else {
            setbtnDisable(true);
            setbtnMessage("Invalid Amount");
          }
        }
        if (Number(amount)>Number(WETHBAL)) {
          setbtnDisable(true);
          setbtnMessage("Insufficient Balance");
        }
        else {
          setbtnDisable(false);
          setbtnMessage("Swap")
        }
      }
    }
    updateBalances();
  }, [currentNetwork])

  useEffect(()=>{
    setCurrentNetwork(0)
    console.log("---",state)
    setallblnLoading(true);
  },[FOCUSED])

  const getTokesBalance = async (token0, token1) => {
    try {
      const addresses = [token0, token1];
      const WALLET_ADDRESS = state?.wallet?.address;
      const resposeBalance = await fetchTokenInfo(addresses, WALLET_ADDRESS)
      console.log("resposeBalance", resposeBalance)
      setWETHBAL(parseFloat(resposeBalance[0]?.balance||0)?.toFixed(parseFloat(resposeBalance[0]?.balance)===0?3:Number(resposeBalance[0].decimals)));
      setUSDCBAL(parseFloat(resposeBalance[1]?.balance||0)?.toFixed(parseFloat(resposeBalance[1]?.balance)===0?3:Number(resposeBalance[1].decimals)));
      setallblnLoading(false);
      setShowTokenList(false);
    } catch (error) {
      console.log("Error fetching token info:", error);
      setallblnLoading(false);
      setShowTokenList(false);
      Snackbar.show({
        text: "Unable to find balance",
        duration: Snackbar.LENGTH_LONG,
        backgroundColor: 'red',
      });
    }
  }

  const getBSCTokenBalance = async (token0, token1) => {
    try {
      const addresses = [token0, token1];
      console.log("addresses:",addresses)
      const WALLET_ADDRESS = state?.wallet?.address;
      const resposeBalance = await fetchBSCTokenInfo(addresses, WALLET_ADDRESS)
      console.log("resposeBalance", resposeBalance)
      setWETHBAL(parseFloat(resposeBalance[0]?.balance||0)?.toFixed(parseFloat(resposeBalance[0]?.balance)===0?3:Number(resposeBalance[0].decimals)));
      setUSDCBAL(parseFloat(resposeBalance[1]?.balance||0)?.toFixed(parseFloat(resposeBalance[1]?.balance)===0?3:Number(resposeBalance[1].decimals)));
      setallblnLoading(false);
      setShowTokenList(false);
    } catch (error) {
      console.log("Error fetching token info:", error);
      setallblnLoading(false);
      setShowTokenList(false);
      Snackbar.show({
        text: "Unable to find balance",
        duration: Snackbar.LENGTH_LONG,
        backgroundColor: 'red',
      });
    }
  }

  const TokenSelector = ({ token, onPress,balance }) => (
    <TouchableOpacity disabled={loading} style={[styles.tokenSelector,{backgroundColor:state?.THEME?.THEME===false?"#f8f9fa":"#080a0a"}]} onPress={onPress}>
      <View style={styles.tokenContainer}>
      <Image source={{ uri: token.logoURI }} style={[styles.logoImage,{marginRight:5}]} />
      <Text style={[styles.tokenSymbol,{color:state?.THEME?.THEME===false?"black":"#fff"}]}>{token.symbol}</Text>
      </View>
      {allblnLoading?<ActivityIndicator size={"small"} color={"green"}/>:<Text style={styles.tokenBalance}>Balance: {balance}</Text>}
    </TouchableOpacity>
  );

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
  
    const clearSearch = () => {
      setSearchQuery('');
    };
  
    return (
      <Modal
        visible={showTokenList}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTokenList(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, {backgroundColor: state?.THEME?.THEME === false ? "#fff" : "#171616"}]}>
            <Text style={[styles.modalTitle, {color: state?.THEME?.THEME === false ? "black" : "#fff"}]}>
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
                <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
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
              keyExtractor={(item) => item.symbol}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.tokenListItem}
                  onPress={() => {
                    if (selectingFor === 'from') {
                      setFromToken(item);
                      if(item.symbol === "WBNB") {
                        navigation.navigate("BnbSwap");
                      }
                    } else {
                      setToToken(item);
                    }
                    setShowTokenList(false);
                    setSearchQuery('');
                  }}
                >
                  <View style={styles.tokenContainer}>
                    <Image source={{ uri: item.logoURI }} style={styles.logoImage} />
                    <View style={styles.tokenDetaisContainer}>
                      <Text style={[styles.tokenListSymbol, {color: state?.THEME?.THEME === false ? "black" : "#fff"}]}>
                        {item.symbol}
                      </Text>
                      <Text style={[styles.tokenListName, {color: state?.THEME?.THEME === false ? "black" : "#fff"}]}>
                        {item.name}
                      </Text>
                      {item.address && searchQuery.trim() && 
                       item.address.toLowerCase().includes(searchQuery.toLowerCase()) && (
                        <Text style={[styles.tokenAddress, {
                          color: state?.THEME?.THEME === false ? "#6c757d" : "#888"
                        }]}>
                          {`${item.address.slice(0, 6)}...${item.address.slice(-4)}`}
                        </Text>
                      )}
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
              style={[styles.closeButton, {backgroundColor: state?.THEME?.THEME === false ? "#f8f9fa" : "#080a0a"}]}
              onPress={() => {
                setShowTokenList(false);
                setSearchQuery('');
              }}
            >
              <Text style={[styles.closeButtonText, {color: state?.THEME?.THEME === false ? "black" : "#fff"}]}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };
  const handleChange = (text,decimals) => {
    const regex = new RegExp(`^\\d*(\\.\\d{0,${decimals}})?$`);
    if (regex.test(text)) {
      setAmount(text);
    }
  };
  const tokenHande=()=>{
    setAmount('');
    setFromToken(toToken);
    setToToken(fromToken);
  }

  useEffect(() => {
    // if (Number(amount)===0) {
    //   if (!amount) {
    //     setbtnDisable(true);
    //     setbtnMessage("Swap");
    //   } else {
    //     setbtnDisable(true);
    //     setbtnMessage("Invalid Amount");
    //   }
    // }
    // if (Number(amount)>Number(WETHBAL)) {
    //   setbtnDisable(true);
    //   setbtnMessage("Insufficient Balance");
    // }
    // else {
    //   setbtnDisable(false);
    //   setbtnMessage("Swap")
    // }
  }, [amount])


  async function handleSwap(amount, privateKey, SWAPTYPE) {
    Keyboard.dismiss()
    setSwapExecution(true);
    if (SWAPTYPE === "ETH") {
      try {
        const etherSwapRes=await swapForEth(amount, privateKey)
        console.log("etherSwapRes---",etherSwapRes)
        if (etherSwapRes.status) {
          setSwapExecution(false);
          Snackbar.show({
            text: "Swap Success",
            duration: Snackbar.LENGTH_LONG,
            backgroundColor: 'green',
          });
          navigation.navigate("Transactions")
        } else {
          setSwapExecution(false);
          // Error UI update
          console.log('Swap failed:', result.message);
          if (result.error) {
            console.log('Error details:', result.error);
          }
          Snackbar.show({
            text: "Faild to swap",
            duration: Snackbar.LENGTH_LONG,
            backgroundColor: 'red',
          });
        }
      } catch (error) {
        setSwapExecution(false);
        console.log('Unexpected error:', error);
        Snackbar.show({
          text: "Faild to swap",
          duration: Snackbar.LENGTH_LONG,
          backgroundColor: 'red',
        });
      }
    }
  }


  async function swapForEth(amount, privateKey) {
    try {
      const wallet = new ethers.Wallet(privateKey);
      const address = await wallet.getAddress();
      console.log("---toToken.symbol",fromToken.symbol)
      const ethBalance=fromToken.symbol==="WETH"?await getWalletBalance(address,"ETH"):await getTokenBalancesUsingAddress(fromToken.address,address,"ETH");
      console.log("---toToken.ba",ethBalance)
      const amountIn = ethers.utils.parseEther(amount);
      const balanceWei = ethers.utils.parseEther(fromToken.symbol==="WETH"?ethBalance.balance.toString():ethBalance.tokenInfo[0].balance.toString());
      if (balanceWei.lt(amountIn)) {
        return {
          status: false,
          message: "Insufficient ETH balance",
          details: {
            requiredAmount: amount,
            currentBalance: fromToken.symbol==="WETH"?ethBalance.balance:ethBalance.tokenInfo[0].balance
          }
        };
      }
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
      } if (res?.[0]?.status === 1) {
        console.log("=====execute0-----", res)
        return {
          status: true,
          message: "Swap completed successfully",
          inputAmount: `${amount} ETH`,
          outputAmount: `${QuotedAmountOutRes?.res?.outputAmount}`,
          transactions: {
            approve: res?.[0].transactionHash
          },
          swap: res?.[1].transactionHash,
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
  return (
    <>
      <Wallet_screen_header title="Swap" onLeftIconPress={() => {navigation.goBack()}} />
      <ErrorComponet
          isVisible={ErroVisible}
          onClose={() => setErroVisible(false)}
          message="We encountered an issue while attempting to fetch the requested quote. Please try again later."
        />
    <View style={[styles.container,{backgroundColor:state?.THEME?.THEME===false?"#fff":"black"}]}>
      <View style={[styles.card,{backgroundColor:state?.THEME?.THEME===false?"#ebebeb":"#171616"}]}>
        <View style={[styles.inputContainer,{backgroundColor:state?.THEME?.THEME===false?"#ebebeb":"#171616"}]}>
            <View style={styles.networkCon}>
              <Text style={styles.label}>From</Text>
              <TouchableOpacity style={styles.networkSelector} onPress={()=>{currentNetwork===0?setCurrentNetwork(1):setCurrentNetwork(0)}}>
              <Icon name={"arrow-down"} size={19} color={"#666"}/>
                <Text style={[styles.label,{marginBottom: 0}]}> {NETWORK[currentNetwork].symbol}</Text>
              </TouchableOpacity>
            </View>
          <TokenSelector
            token={fromToken}
            onPress={() => {
              setSelectingFor('from');
              setShowTokenList(true);
            }}
            balance={WETHBAL}
          />
          <TextInput
            maxLength={30}
            returnKeyType='done'
            style={[styles.input,{backgroundColor:state?.THEME?.THEME===false?"#f8f9fa":"#080a0a",color:state?.THEME?.THEME===false?"black":"#fff"}]}
            value={amount}
            onChangeText={(text)=>{handleChange(text,fromToken.decimals)}}
            placeholder="0.0"
            keyboardType="decimal-pad"
            placeholderTextColor="#666"
          />
        </View>
         
         <View style={styles.swapButton}>

        <View style={[styles.divider,{backgroundColor:state?.THEME?.THEME===false?"#c7c5c5":"#080a0a"}]} />
          <TouchableOpacity style={styles.swapButtonCircle} onPress={()=>{tokenHande()}}>
          <Icon
            name={"swap-vertical"}
            size={23}
            color={"#3574B6"}
          />
          </TouchableOpacity>
        <View style={[styles.divider,{backgroundColor:state?.THEME?.THEME===false?"#c7c5c5":"#080a0a"}]} />
         </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>To</Text>
          <TokenSelector
            token={toToken}
            onPress={() => {
              setSelectingFor('to');
              setShowTokenList(true);
            }}
            balance={USDCBAL}
          />
          {quoteInfo && (
            <View style={[styles.quoteTextCon,{backgroundColor:state?.THEME?.THEME===false?"#f8f9fa":"#080a0a"}]}>
              <Text style={[styles.quoteText,{backgroundColor:state?.THEME?.THEME===false?"#f8f9fa":"#080a0a"}]}>≈</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Text style={[styles.quoteText,{backgroundColor:state?.THEME?.THEME===false?"#f8f9fa":"#080a0a"}]}>{quoteInfo.outputAmount}</Text>
              </ScrollView>
            <Text style={[styles.quoteText,{backgroundColor:state?.THEME?.THEME===false?"#f8f9fa":"#080a0a"}]}>{quoteInfo.outputToken}</Text>
            </View>
          )}
        </View>

        {quoteInfo && (
          <View style={[styles.quoteDetailsContainer,{backgroundColor:state?.THEME?.THEME===false?"#f8f9fa":"#080a0a"}]}>
            <Text style={[styles.quoteTitle,{color:state?.THEME?.THEME===false?"black":"#fff"}]}>Quote Details</Text>
            
            <View style={styles.quoteRow}>
              <Text style={styles.quoteLabel}>Rate</Text>
              <Text style={[styles.quoteValue,{color:state?.THEME?.THEME===false?"black":"#fff"}]}>
                1 {quoteInfo.inputToken} = {quoteInfo.pricePerToken} {quoteInfo.outputToken}
              </Text>
            </View>

            <View style={styles.quoteRow}>
              <Text style={styles.quoteLabel}>Fee Tier</Text>
              <Text style={[styles.quoteValue,{color:state?.THEME?.THEME===false?"black":"#fff"}]}>{parseFloat(quoteInfo.fee) / 10000}%</Text>
            </View>

            <View style={styles.quoteRow}>
              <Text style={styles.quoteLabel}>Minimum Received</Text>
              <View style={{width:wp(25),flexDirection:"row"}}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <Text style={[styles.quoteValue,{color:state?.THEME?.THEME===false?"black":"#fff"}]}>{quoteInfo.outputAmount}</Text>
                </ScrollView>
                <Text style={[styles.quoteValue,{color:state?.THEME?.THEME===false?"black":"#fff"}]}> {quoteInfo.outputToken}</Text>
              </View>
            </View>
          </View>
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066cc" />
            <Text style={styles.loadingText}>Getting best quote...</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={[styles.swapButtonCon,{backgroundColor:btnDisable||SwapExecution?"gray":"#3574B6"}]} disabled={btnDisable||SwapExecution} onPress={()=>{handleSwap(amount,state?.wallet?.privateKey,currentNetwork === 0?"ETH":"BSC")}}>
        {SwapExecution?<ActivityIndicator color={"green"}/>:<Text style={styles.swapButtonConText}>{btnMessage}</Text>}
      </TouchableOpacity>

      <TokenListModal />
    </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    alignSelf: "center",
    width: "100%",
    height:"100%"
  },
  card: {
    backgroundColor: '#ebebeb',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  inputContainer: {
    marginBottom: 16,
  },
  swapButtonCircle:{
    borderColor:"#3574B6",
    borderWidth:2,
    borderRadius:100,
    padding:5
  },
  swapButton:{
    flexDirection: "row",
    paddingHorizontal:10,
    alignItems: "center",
    justifyContent: "space-between"
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
    color:"black"
  },
  tokenBalance: {
    fontSize: 14,
    color: '#666',
  },
  input: {
    fontSize: 24,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    color: '#000',
  },
  divider: {
    height: wp(0.5),
    width:wp(33),
    backgroundColor: '#c7c5c5',
  },
  quoteTextCon: {
    flexDirection:"row",
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  quoteText: {
    fontSize: 24,
    color: '#666',
    // padding: 12,
    backgroundColor: '#f8f9fa',
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
    color:"black"
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
    color:"black"
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 16,
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
    color:"black"
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
  tokenContainer:{
    flexDirection:"row",
    alignItems:"center"
  },
  tokenDetaisContainer:{
    marginLeft:10
  },
  logoImage:{
    height: hp(4),
    width: wp(8.5)
  },
  swapButtonCon: {
    width: wp(90),
    backgroundColor: "#3574B6",
    justifyContent: "center",
    alignItems: "center",
    marginTop:wp(5),
    padding:14,
    borderRadius:20
  },
  swapButtonConText:{
    fontSize:18,
    color:"#fff",
    fontWeight:"400"
  },
  networkCon:{
    width:"99%",
    justifyContent:"space-between",
    flexDirection:"row",
    alignContent:"space-evenly",
    padding:10
  },
  networkSelector:{
    padding:5,
    paddingHorizontal:10,
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"center",
    borderRadius:10,
    borderColor:"#3574B6",
    borderWidth:0.9
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
    paddingVertical: 0, // Remove default padding
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
  tokenAddress: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: 'monospace',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default EthSwap;