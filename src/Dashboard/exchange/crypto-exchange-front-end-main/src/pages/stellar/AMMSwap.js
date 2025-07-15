import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from "react-native-vector-icons/Ionicons";
import stellarTokens from "./Tokens.json";
import { debounce } from 'lodash';
import { useSelector } from 'react-redux';
import { GetStellarAvilabelBalance } from '../../../../../../utilities/StellarUtils';
import { AMMSWAPTESTNET } from './AMMSwapTestNetUtil';
import { useNavigation } from '@react-navigation/native';
import { STELLAR_URL } from '../../../../../constants';
const StellarSdk = require('stellar-sdk');

const AMMSwap = () => {
  const state=useSelector((state)=>state);
  const [fromToken, setFromToken] = useState({
    code: "USDC",
    issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
    contract: "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75",
    name: "USD Coin",
    org: "Centre Consortium LLC dba Centre Consortium",
    domain: "centre.io",
    icon: "https://stellar.myfilebase.com/ipfs/QmNcfZxs8e9uVyhEa3xoPWCsj3ZogGirtixMEC9Km4Fjm2",
    decimals: 7,
    balance: '1,245.32',
  });
  
  const [toToken, setToToken] = useState({
    code: "BTC",
    issuer: "GDPJALI4AZKUU2W426U5WKMAT6CN3AJRPIIRYR2YM54TL2GDWO5O2MZM",
    contract: "CAO7DDJNGMOYQPRYDY5JVZ5YEK4UQBSMGLAEWRCUOTRMDSBMGWSAATDZ",
    name: "BTC",
    org: "Ultra Capital LLC dba Ultra Capital",
    domain: "ultracapital.xyz",
    icon: "https://stellar.myfilebase.com/ipfs/QmUjsGiNcUFTbiKoMZyBtgkSwfndBXSbRKFpGrYKvHC1fX",
    decimals: 7
  },);
  const navigation=useNavigation();
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromBal, setFromBal] = useState(0.00);
  const [toBal, setToBal] = useState(0.00);
  const [exchangeRes, setexchangeRes] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenBurn, settokenBurn] = useState(false);
  const [tokenModalVisible, setTokenModalVisible] = useState(false);
  const [tokenTypeSelection, settokenTypeSelection] = useState(0);
  const [messageError,setmessageError]=useState(null);
  const [showReverse,setshowReverse]=useState(false);
  
  useEffect(()=>{
    settokenBurn(false)
    setshowReverse(false)
    setFromAmount('');
    setToAmount('');
    setFromBal(0.00);
    setToBal(0.00);
    setexchangeRes(null);
    setIsLoading(false);
    setTokenModalVisible(false);
    settokenTypeSelection(0);
    setmessageError(null);
    handleInitBal(fromToken?.code,toToken?.code)
  },[])

  const handleInitBal=async(asset,asset1)=>{
    const res= await BridgeUSDCValidation(asset==="XLM"?"native":asset);
    if(res!==null)
    {
      setFromBal(parseFloat(res?.balance).toFixed(4));
    }else{
      setFromBal(0.00);
    }
    const res1= await BridgeUSDCValidation(asset1==="XLM"?"native":asset1);
    if(res1!==null)
      {
        setToBal(parseFloat(res1?.balance).toFixed(4));
      }else{
        setToBal(0.00);
      }
  }

  useEffect(()=>{
    handleInitBal(fromToken?.code,toToken?.code)
  },[fromToken,toToken])
  

  function isAssetData(state) {
    return state?.assetData !== undefined && state?.assetData !== null;
}
  const BridgeUSDCValidation=async(assetCode)=>{
    const avlRes=isAssetData(state?.assetData);
    if(!avlRes)
    {
      const ALL_STELLER_BALANCES=state?.assetData;
      const assetData = ALL_STELLER_BALANCES.find(
        (balance) =>
          balance.asset_code === assetCode || balance.asset_type === assetCode
      );
      
      if (!assetData) {
        return null;
      } else {
        if(assetCode==="native")
          {
            const res=await GetStellarAvilabelBalance(state?.STELLAR_PUBLICK_KEY)
            if(res?.availableBalance==="Error")
            {
              return null
            }
            else{
              return {"balance":res?.availableBalance}
            }
        }else{
          return assetData;
        }
      }
      
    }
    
  }

  const isValidNumber = (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num !== 0;
  };
  const handleInputChange = (numericText) => {
    setmessageError(null);
    setFromAmount(numericText);
    const amount = parseFloat(numericText);
    const isValidAmount = /^(?:0|[1-9]\d*)(?:\.\d{1,7})?$/.test(numericText);
    if (numericText && isValidAmount && amount > 0) {
      fetchQuote(fromToken.code,fromToken.issuer,toToken.code,toToken.issuer,numericText);
    }
  };
  // Handle input change and calculate the output amount
  const fetchQuote = useCallback(
    debounce((fromTokenCode,fromTokenIssuer,toTokenCode,toTokenIssuer,value) => {
      setIsLoading(true)
      handleQoutesFeatch(fromTokenCode,fromTokenIssuer,toTokenCode,toTokenIssuer,value)
    }, 400),
    []
  );

  const handleQoutesFeatch=async(fromName,fromAdd,toName,toAdd,amount) => {
      const res=await getSwapQuote(fromName,fromAdd,toName,toAdd,amount)
      if(res.status===true)
      {
        setshowReverse(false)
        setexchangeRes(res)
        setToAmount(res?.destination?.amount);
        setIsLoading(false)
      }
      else{
        setToAmount('');
        setIsLoading(false)
        setmessageError("Unable to fetch quote");
      }
  }
  function URLBuilder(
    sourceAssetCode,
    sourceAssetIssuer,
    destinationAssetCode,
    destinationAssetIssuer,
    sourceAmount
  ) {
    console.log(sourceAssetCode,
      sourceAssetIssuer,
      destinationAssetCode,
      destinationAssetIssuer,
      sourceAmount)
    const baseUrl = STELLAR_URL.URL+"/paths/strict-send";
    const isSourceXLM = sourceAssetCode === "XLM";
    const isDestinationXLM = destinationAssetCode === "XLM";
    const query = [];
    if (isSourceXLM) {
      query.push(`source_asset_type=native`);
    } else {
      query.push(`source_asset_type=credit_alphanum4`);
      query.push(`source_asset_code=${encodeURIComponent(sourceAssetCode)}`);
      query.push(`source_asset_issuer=${encodeURIComponent(sourceAssetIssuer)}`);
    }
    query.push(`source_amount=${encodeURIComponent(sourceAmount)}`);
    let destinationAsset;
    if (isDestinationXLM) {
      destinationAsset = "native";
    } else {
      destinationAsset = `${destinationAssetCode}:${destinationAssetIssuer}`;
    }
  
    query.push(`destination_assets=${encodeURIComponent(destinationAsset)}`);
  
    const fullUrl = `${baseUrl}?${query.join("&")}`;
  
    return fullUrl
  }
  
  async function getSwapQuote(
    sourceAssetCode,
    sourceAssetIssuer,
    destinationAssetCode,
    destinationAssetIssuer,
    sourceAmount,
    slippageTolerance = 0.05
  ) {
    try {
      const url =URLBuilder(sourceAssetCode,sourceAssetIssuer,destinationAssetCode,destinationAssetIssuer,sourceAmount)
      console.log("** LOG **", url);
      
      const response = await fetch(url);
      const json = await response.json();
  
      const records = json._embedded?.records;
      if (!records || records.length === 0) {
        return { status: false, error: "No available swap paths found." };
      }
  
      // Pick best path (first one usually highest return)
      const bestPath = records[0];
      const destinationAmount = parseFloat(bestPath.destination_amount);
      const exchangeRate = destinationAmount / parseFloat(sourceAmount);
      const minReceived = destinationAmount * (1 - slippageTolerance);
  
      // Format path info (if any)
      const path = bestPath.path.map(asset => {
        return asset.asset_type === "native"
          ? "XLM"
          : `${asset.asset_code}:${asset.asset_issuer}`;
      });
  
      return {
        status: true,
        network: "Stellar",
        requestUrl: url,
        source: {
          code: sourceAssetCode,
          issuer: sourceAssetIssuer,
          amount: parseFloat(sourceAmount).toFixed(7),
        },
        destination: {
          code: destinationAssetCode,
          issuer: destinationAssetIssuer,
          amount: destinationAmount.toFixed(7),
        },
        exchangeRate: {
          rate: `1 ${sourceAssetCode} = ${exchangeRate.toFixed(7)} ${destinationAssetCode}`,
          inverse:`1 ${destinationAssetCode} = ${(1 / exchangeRate).toFixed(7)} ${sourceAssetCode}`,
        },
        path,
        swapDetails: {
          slippageTolerance: `${(slippageTolerance * 100).toFixed(0)}%`,
          minReceived: minReceived.toFixed(7),
        },
      };
  
    } catch (error) {
      console.error("Swap quote error:", error);
      return {
        status: false,
        error: error.message || "Unknown error",
      };
    }
  }
  
  
  
  



  // Swap tokens function
  const swapTokens = () => {
    setmessageError(null);
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount('');
    setToAmount('');
  };
  
  const handleTokenSelection=(item)=>{
    if(tokenTypeSelection===0)
    {
      if(toToken.code!==item.code)
      {
        setFromToken(item);
        setTokenModalVisible(false);
        setFromAmount('');
        setToAmount('');
        setexchangeRes(null);
        setIsLoading(false);
      }
      else{
        Alert.alert("Info","To and From asset tokens can be the same.")
      }
    }
    if (tokenTypeSelection === 1) {
      if (fromToken.code !== item.code) {
        setToToken(item);
        setTokenModalVisible(false);
        setFromAmount('');
        setToAmount('');
        setexchangeRes(null);
        setIsLoading(false);
      } else {
        Alert.alert("Info", "From and To asset tokens can be the same.")
      }
    }
  }

  
  const renderTokenItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.tokenItem} 
      onPress={() =>{handleTokenSelection(item)}}
    >
      <Image 
        source={{ uri: item.icon }}
        style={styles.tokenIcon}
      />
      <View style={styles.tokenInfo}>
        <Text style={styles.tokenSymbol}>{item.code}</Text>
        <Text style={styles.tokenName}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  const handleSwap=async()=>{
    settokenBurn(true)
    const respo=await AMMSWAPTESTNET(fromToken.code,fromToken.issuer,toToken.code,toToken.issuer,state?.STELLAR_SECRET_KEY,toAmount)
    if(respo.status===true)
    {
      setmessageError("Transaction successful!")
      console.log("--Success--,",respo.tx)
      settokenBurn(false)
      setTimeout(()=>{
        navigation.navigate("Transactions",{txType:"STR"});
      },2000)
    }
    else{
      settokenBurn(false)
      console.log("--Error--",respo.error)
      setmessageError("Transaction Faild.")
    }
  }
  
  return (
    <View style={styles.container}>
        <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : null}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        style={{ flex: 1, backgroundColor: "#011434" }}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          {/* <View style={styles.header}>
          <Ionicons name="flash" size={20} color="#EFBF04" />
            <Text style={styles.headerTitle}>Instant trade</Text>
          </View> */}
          
          {/* From Token Input */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>From</Text>
              <Text style={styles.balanceText}>
                Balance: {fromBal} {fromToken.code}
              </Text>
            </View>
            
            <View style={styles.inputContainer}>
              <TouchableOpacity style={styles.tokenSelector} onPress={()=>{settokenTypeSelection(0),setTokenModalVisible(true)}}>
                <Image
                  source={{ uri: fromToken.icon }}
                  style={styles.tokenLogo}
                />
                <Text style={styles.tokenSymbol}>{fromToken.code}</Text>
                <Ionicons name="chevron-down" size={20} color="#FFF" />
              </TouchableOpacity>
              
              <TextInput
                style={styles.amountInput}
                returnKeyType="done"
                placeholder="0.00"
                placeholderTextColor="#8A8A8A"
                keyboardType="decimal-pad"
                value={fromAmount}
                onChangeText={(value)=>{handleInputChange(value)}}
              />
            </View>
            
            {messageError===null?<TouchableOpacity style={styles.maxButton} onPress={()=>{setFromAmount(fromBal)}}>
              <Text style={styles.maxButtonText}>MAX</Text>
            </TouchableOpacity>:<Text style={[styles.maxButtonText,{color:messageError==="Transaction successful!"?"green":"red"}]}>{messageError}</Text>}
          </View>
          
          {/* Swap Button */}
          <TouchableOpacity style={styles.swapButton} onPress={swapTokens}>
            <View style={styles.swapIconContainer}>
              <Ionicons name="swap-vertical" size={24} color="#4CA6EA" />
            </View>
          </TouchableOpacity>
          
          {/* To Token Input */}
          <View style={[styles.card,{marginTop:16}]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>To (Estimated)</Text>
              <Text style={styles.balanceText}>
                Balance: {toBal} {toToken.code}
              </Text>
            </View>
            
            <View style={styles.inputContainer}>
              <TouchableOpacity style={styles.tokenSelector} onPress={()=>{settokenTypeSelection(1),setTokenModalVisible(true)}}>
                <Image
                  source={{ uri: toToken.icon }}
                  style={styles.tokenLogo}
                />
                <Text style={styles.tokenSymbol}>{toToken.code}</Text>
                <Ionicons name="chevron-down" size={20} color="#FFF" />
              </TouchableOpacity>
              
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor="#8A8A8A"
                keyboardType="decimal-pad"
                value={toAmount}
                editable={false}
              />
            </View>
          </View>
          
          {/* Swap Details */}
          {exchangeRes !== null ? <View style={styles.detailsCard}>
          <Text style={styles.tokenSymbol}>Swap Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Network</Text>
              <Text style={styles.detailValue}>{exchangeRes?.network}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Exchange Rate</Text>
              <View style={{flexDirection:"row",alignContent:"center"}}>
              <Text style={styles.detailValue}>{showReverse?exchangeRes?.exchangeRate?.inverse:exchangeRes?.exchangeRate?.rate} </Text>
              <TouchableOpacity onPress={()=>{setshowReverse(showReverse?false:true)}}>
                <Ionicons name="swap-horizontal" size={19} color="#FFF" />
              </TouchableOpacity>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Slippage Tolerance</Text>
              <Text style={styles.detailValue}>{exchangeRes?.swapDetails?.slippageTolerance}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Minimum Received</Text>
              <Text style={styles.detailValue}>{exchangeRes?.swapDetails?.minReceived}</Text>
            </View>
          </View> : null}
          
          {/* Swap Button */}
          <TouchableOpacity
            style={[
              styles.swapActionButton,
              (!fromAmount || parseFloat(fromAmount) <= 0||parseFloat(fromBal)===0||parseFloat(fromAmount)>=parseFloat(fromBal)) && styles.disabledButton,
            ]}
            disabled={!fromAmount || parseFloat(fromAmount) <= 0 || isLoading||parseFloat(fromBal)===0||parseFloat(fromAmount)>=parseFloat(fromBal)}
            onPress={()=>{handleSwap()}}
          >
              {isLoading||tokenBurn ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.swapActionButtonText}>{parseFloat(fromBal)===0||parseFloat(fromAmount)>=parseFloat(fromBal)?"Insufficient balance":"Swap Tokens"}</Text>
              )}
          </TouchableOpacity>

          <Modal
        animationType="slide"
        transparent={true}
        visible={tokenModalVisible}
        onRequestClose={() => setTokenModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select a token</Text>
              <TouchableOpacity onPress={() => setTokenModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>      
            <FlatList
              data={stellarTokens?.assets}
              renderItem={renderTokenItem}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width:"100%",
    height:"100%",
    backgroundColor: '#011434',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    padding: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardLabel: {
    color: '#BBBBBB',
    fontSize: 16,
  },
  balanceText: {
    color: '#BBBBBB',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  tokenSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    padding: 8,
    paddingHorizontal: 12,
  },
  tokenLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  tokenSymbol: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'right',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  maxButton: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.30)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  maxButtonText: {
    color: '#4CA6EA',
    fontWeight: '600',
    fontSize: 12,
  },
  swapButton: {
    alignSelf: 'center',
    marginVertical: -9,
    zIndex: 1,
  },
  swapIconContainer: {
    backgroundColor: '#12122E',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CA6EA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  detailsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  detailLabel: {
    color: '#BBBBBB',
    fontSize: 14,
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  swapActionButton: {
    backgroundColor:"#2164C1",
    borderRadius: 16,
    marginBottom: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swapActionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '70%',
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#666',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tokenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tokenIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  tokenInfo: {
    flex: 1,
    marginLeft: 12,
  },
  tokenSymbol: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  tokenName: {
    fontSize: 14,
    color: '#999',
  },
  tokenBalance: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});

export default AMMSwap;