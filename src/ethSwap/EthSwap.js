
import React, { useState, useEffect } from 'react';
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
import { fetchTokenInfo } from './tokenUtils';
import { main, swapUSDCtoWETH } from './SwapExecution';
import Snackbar from 'react-native-snackbar';
import { swapETHtoUSDC } from './MutiStepSwap';
import { SaveTransaction } from '../utilities/utilities';

const FACTORY_ABI = require('./abi/factory.json');
const QUOTER_ABI = require('./abi/quoter.json');
const POOL_ABI = require('./abi/pool.json');

const POOL_FACTORY_CONTRACT_ADDRESS = '0x0227628f3F023bb0B980b67D528571c95c6DaC1c'
const QUOTER_CONTRACT_ADDRESS = '0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3'
const RPC_URL = 'https://eth-sepolia.g.alchemy.com/v2/k5oEPTr8Pryz-1bdXyNzH3TfwczQ_TRo'

// Token List
const TOKENS = [
  {
    symbol: 'WETH',
    name: 'Wrapped Ethereum',
    decimals: 18,
    address: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14', 
    balance: '1.5',
    logoUri: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",

  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    balance: '1000',
    logoUri:'https://tokens.pancakeswap.finance/images/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d.png'
  },
  {
    symbol: 'WBNB',
    name: 'BNB Coin',
    decimals: 6,
    address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    balance: '1000',
    logoUri:'https://tokens.pancakeswap.finance/images/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c.png'
  }
];

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


  const provider = new ethers.providers.JsonRpcProvider(RPC_URL,{chainId:11155111});
  const factoryContract = new ethers.Contract(POOL_FACTORY_CONTRACT_ADDRESS, FACTORY_ABI, provider);
  const quoterContract = new ethers.Contract(QUOTER_CONTRACT_ADDRESS, QUOTER_ABI, provider);

  const getSwapQuote = async (tokenIn, tokenOut, amountIn) => {
    try {
      const poolAddress = await factoryContract.getPool(
        tokenIn.address,
        tokenOut.address,
        3000
      );

      if (!poolAddress) {
        throw new Error("Pool not found for token pair");
      }

      const poolContract = new ethers.Contract(poolAddress, POOL_ABI, provider);
      const fee = await poolContract.fee();

      const formattedAmountIn = ethers.utils.parseUnits(
        amountIn.toString(),
        tokenIn.decimals
      );

      const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle({
        tokenIn: tokenIn.address,
        tokenOut: tokenOut.address,
        fee: fee,
        recipient: ethers.constants.AddressZero,
        deadline: Math.floor(Date.now() / 1000) + 600,
        amountIn: formattedAmountIn,
        sqrtPriceLimitX96: 0
      });

      const formattedAmountOut = ethers.utils.formatUnits(
        quotedAmountOut[0],
        tokenOut.decimals
      );

      const pricePerToken = (parseFloat(formattedAmountOut) / parseFloat(amountIn)).toFixed(6);

      return {
        inputAmount: amountIn,
        inputToken: tokenIn.symbol,
        outputAmount: formattedAmountOut,
        outputToken: tokenOut.symbol,
        pricePerToken: pricePerToken,
        fee: fee.toString(),
        poolAddress: poolAddress
      };
    } catch (error) {
      throw new Error(`Failed to get swap quote: ${error.message}`);
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
        const quote = await getSwapQuote(fromToken, toToken, amount);
        setQuoteInfo(quote);
      } catch (error) {
        console.log(error);
        // Alert.alert('Error', 'Failed to get quote');
        setErroVisible(true);
        setQuoteInfo(null);
      } finally {
        setLoading(false);
      }
    };

    updateQuote();
  }, [amount, fromToken, toToken]);

  useEffect(()=>{
    console.log("---",state)
    setallblnLoading(true);
    const fetchBalance=async()=>{
     try{
      const addresses = ["0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14", "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"];
      const WALLET_ADDRESS = state?.wallet?.address;

      const resposeBalance = await fetchTokenInfo(addresses, WALLET_ADDRESS)
      const usdcBalance = resposeBalance.find(item => item.symbol === "USDC")?.balance || "0.0";
      const wethBalance = resposeBalance.find(item => item.symbol === "WETH")?.balance || "0.0";
      setUSDCBAL(parseFloat(usdcBalance).toFixed(5));
      setWETHBAL(parseFloat(state?.EthBalance)?.toFixed(5));
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
      // const resposeBalance = await fetchTokenInfo(TOKENS[1].address,state?.wallet?.address)
      // setUSDCBAL(parseFloat(resposeBalance?.balance)?.toFixed(5))
      // setWETHBAL(parseFloat(state?.EthBalance)?.toFixed(5))
      // setallblnLoading(false);
      // setShowTokenList(false);
    }
    fetchBalance()
  },[FOCUSED])

  const TokenSelector = ({ token, onPress }) => (
    <TouchableOpacity disabled={loading} style={[styles.tokenSelector,{backgroundColor:state?.THEME?.THEME===false?"#f8f9fa":"#080a0a"}]} onPress={onPress}>
      <View style={styles.tokenContainer}>
      <Image source={{ uri: token.logoUri }} style={[styles.logoImage,{marginRight:5}]} />
      <Text style={[styles.tokenSymbol,{color:state?.THEME?.THEME===false?"black":"#fff"}]}>{token.symbol}</Text>
      </View>
      {allblnLoading?<ActivityIndicator size={"small"} color={"green"}/>:<Text style={styles.tokenBalance}>Balance: {token?.symbol==="WETH"?WETHBAL!=="NaN"?WETHBAL:"0.00":USDCBAL!=="NaN"?USDCBAL:"0.00"}</Text>}
    </TouchableOpacity>
  );

  const TokenListModal = () => (
    <Modal
      visible={showTokenList}
      transparent
      animationType="slide"
      onRequestClose={() => setShowTokenList(false)}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent,{backgroundColor:state?.THEME?.THEME===false?"#fff":"#171616"}]}>
          <Text style={[styles.modalTitle,{color:state?.THEME?.THEME===false?"black":"#fff"}]}>Select Token</Text>
          <FlatList
            data={TOKENS}
            keyExtractor={(item) => item.symbol}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.tokenListItem}
                onPress={() => {
                  if (selectingFor === 'from') {
                    setFromToken(item);
                    if(item.symbol==="WBNB")
                    {
                      navigation.navigate("BnbSwap");
                    }
                  } else {
                    setToToken(item);
                  }
                  setShowTokenList(false);
                }}
              >
                <View style={styles.tokenContainer}>
                  <Image source={{ uri: item.logoUri }} style={styles.logoImage} />
                  <View style={styles.tokenDetaisContainer}>
                    <Text style={[styles.tokenListSymbol,{color:state?.THEME?.THEME===false?"black":"#fff"}]}>{item.symbol}</Text>
                    <Text style={[styles.tokenListName,{color:state?.THEME?.THEME===false?"black":"#fff"}]}>{item.name}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={[styles.closeButton,{backgroundColor:state?.THEME?.THEME===false?"#f8f9fa":"#080a0a"}]}
            onPress={() => setShowTokenList(false)}
          >
            <Text style={[styles.closeButtonText,{color:state?.THEME?.THEME===false?"black":"#fff"}]}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
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

  useEffect(()=>{
    if (Number(amount) <= 0) {
      if(amount==="")
      {
        setbtnDisable(true);
        setbtnMessage("Swap");
      }else{
        setbtnDisable(true);
        setbtnMessage("Invalid Amount");
      }
    }
    else{    
    if(fromToken.symbol==="WETH")
    {
      if (Number(WETHBAL)<Number(amount)) {
        setbtnDisable(true);
        setbtnMessage("Insufficient Balance");
      }
      else{
        setbtnDisable(false);
        setbtnMessage("Swap")
      }
    }
    if(fromToken.symbol==="USDC")
    {
      if (Number(USDCBAL)<Number(amount)) {
        setbtnDisable(true);
        setbtnMessage("Insufficient Balance");
      }
      else{
        setbtnDisable(false);
        setbtnMessage("Swap")
      }
    }
  }
    
  },[amount])


  async function handleSwap(amount, PRIVATE_KEY, SWAPTYPE) {
    Keyboard.dismiss()
    setSwapExecution(true);
    if (SWAPTYPE === "USDC") {
      try {
        const result = await swapUSDCtoWETH(amount, PRIVATE_KEY);

        if (result.success) {
          // Success UI update
          console.log('Swap successful!');
          console.log('Amount received:', result.data.outputAmount);
          console.log('Transaction:', result.data.transactionHash);
          await SaveTransaction(
            "Swap",
            result.data.transactionHash,
            await state.user,
            "Eth",
            'Multi-coin',
            "Eth"
          );
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
    if(SWAPTYPE==="WETH")
    {
      try {
        const result = await swapETHtoUSDC( amount,PRIVATE_KEY);
        
        if (result.success) {
            // Success case
            console.log('Swap successful!');
            console.log('Input:', result.data.inputAmount);
            console.log('Output:', result.data.outputAmount);
            console.log('Transaction links:', result.data.transactions);

            await SaveTransaction(
              "Swap",
              result.data.transactions.swapHash,
              await state.user,
              "Eth",
              'Multi-coin',
              "Eth"
            );
            setSwapExecution(false);
            Snackbar.show({
              text: "Swap Success",
              duration: Snackbar.LENGTH_LONG,
              backgroundColor: 'green',
            });
           navigation.navigate("Transactions")
        } else {
            setSwapExecution(false);
            // Error case
            console.error('Swap failed:', result.message);
            if (result.error) {
                console.error('Error details:', result.error);
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
          <Text style={styles.label}>From</Text>
          <TokenSelector
            token={fromToken}
            onPress={() => {
              setSelectingFor('from');
              setShowTokenList(true);
            }}
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

      <TouchableOpacity style={[styles.swapButtonCon,{backgroundColor:btnDisable||SwapExecution?"gray":"#3574B6"}]} disabled={btnDisable||SwapExecution} onPress={()=>{handleSwap(amount,state?.wallet?.privateKey,fromToken.symbol)}}>
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
  }
});

export default EthSwap;