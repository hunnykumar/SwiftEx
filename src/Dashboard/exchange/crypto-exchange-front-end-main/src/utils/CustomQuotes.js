import { debounce } from 'lodash';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
  ActivityIndicator,
  Animated,
  Alert
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { getETHtoTokenPrice } from '../../../../tokens/swapFunctions';
import { USDT } from './assetAddress';
import { REACT_APP_HOST } from '../ExchangeConstants';
import { authRequest, GET, getToken, POST } from '../api';
import { useNavigation } from '@react-navigation/native';
import Icon from '../../../../../icon';
import { ethers } from 'ethers';
import { OneTapContractAddress, OneTapUSDCAddress, RPC, STELLAR_URL } from '../../../../constants';
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from 'react-redux';
import { RAPID_STELLAR, SET_ASSET_DATA } from '../../../../../components/Redux/actions/type';
import useFirebaseCloudMessaging from '../../../../notifications/firebaseNotifications';
import DeviceInfo from 'react-native-device-info';
import AsyncStorageLib from "@react-native-async-storage/async-storage";
import Snackbar from 'react-native-snackbar';
import { getCUSTOMSwapQuote } from './QuotesUtil';
import { onSwapETHtoUSDC } from './OneTapPayExecution';
import { swap_prepare } from '../../../../../../All_bridge';
const StellarSdk = require('stellar-sdk');
export const QuotesComponent = ({ quoteInfo, loading, sourceToken, destinationToken,hideQuote,typeProvider }) => {

  const styles = StyleSheet.create({
    quoteTextCon: {
      flexDirection: "row",
      padding: 9,
      backgroundColor: "#33373DCC",
      borderRadius: 8,
    },
    quoteText: {
      fontSize: 24,
      color: 'silver',
      borderRadius: 8,
    },
    quoteDetailsContainer: {
      paddingHorizontal: 1,
      borderRadius: 8,
    },
    quoteTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 12,
      color: '#fff',
    },
    quoteRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    quoteLabel: {
      fontSize: 14,
      color: 'silver',
    },
    quoteValue: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '500',
    },
    loadingContainer: {
      alignItems: 'center',
      marginTop: 16,
    },
    loadingText: {
      marginTop: 8,
      color: 'silver',
    },
  });

  if (!quoteInfo && !loading) return null;

  return (
    <View style={{ padding: 1 }}>
      {quoteInfo !== null && (
        <View style={[styles.quoteDetailsContainer]}>
          <View style={styles.quoteRow}>
            <Text style={styles.quoteLabel}>Provider</Text>
            <Text style={styles.quoteValue}>
              {typeProvider}
            </Text>
          </View>

          <View style={styles.quoteRow}>
            <Text style={styles.quoteLabel}>Rate</Text>
            <Text style={styles.quoteValue}>
              1 {sourceToken} = {quoteInfo.conversionRate} {destinationToken}
            </Text>
          </View>

          <View style={styles.quoteRow}>
            <Text style={styles.quoteLabel}>Slippage</Text>
            <Text style={styles.quoteValue}>
              {quoteInfo.slippageTolerance}%
            </Text>
          </View>

          <View style={styles.quoteRow}>
            <Text style={styles.quoteLabel}>Minimum Received</Text>
            <View style={{ width: wp(25), flexDirection: 'row' }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Text style={styles.quoteValue}>{quoteInfo.minimumAmountOut}</Text>
              </ScrollView>
              <Text style={styles.quoteValue}>{destinationToken}</Text>
            </View>
          </View>
        </View>
      )}
      {hideQuote ? (quoteInfo !== null && (
  <View style={styles.quoteTextCon}>
    <Text style={styles.quoteText}>≈</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <Text style={styles.quoteText}>{quoteInfo.minimumAmountOut}</Text>
    </ScrollView>
    <Text style={styles.quoteText}>{destinationToken}</Text>
  </View>
)) : null}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Getting best quote...</Text>
        </View>
      )}
    </View>
  );
};

const QuotesResComponent = ({ quoteInfo, sourceToken,quoteInfoDes, destinationToken }) => {
  const styles = StyleSheet.create({
    quoteTextCon: {
      flexDirection: "row",
      padding: 9,
      backgroundColor: "#10B981",
      borderRadius:10,
      bt: 8,
    },
    quoteText: {
      fontSize: 24,
      color: 'white',
      borderRadius: 8,
    },
  });

  if (!quoteInfo && !quoteInfoDes) return null;

  return (
    <View style={{ padding: 3, backgroundColor: "#10B981",borderRadius:10 }}>
    {(quoteInfo || quoteInfoDes) && (
      <>
        {/* {sourceToken && quoteInfo && (
          <View style={styles.quoteTextCon}>
            <Text style={styles.quoteText}>≈</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Text style={styles.quoteText}>{quoteInfo?.minimumAmountOut || "--"}</Text>
            </ScrollView>
            <Text style={styles.quoteText}> USDT</Text>
          </View>
        )} */}
  
        {destinationToken && quoteInfoDes && (
          <View style={styles.quoteTextCon}>
            <Text style={styles.quoteText}>≈</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Text style={styles.quoteText}>{quoteInfoDes?.minimumAmountOut || "--"}</Text>
            </ScrollView>
            <Text style={styles.quoteText}>{destinationToken}</Text>
          </View>
        )}
      </>
    )}
  </View>
  
  
  );
};

export const CustomQuotes = ({
  isVisible,
  onClose,
  tokenChain,
  tokenName,
  tokenAddress,
  ACTIVATED
}) => {
  const navigation=useNavigation();
  const [inputAmount, setInputAmount] = useState('');
  const [usdtRes, setusdtRes] = useState(null);
  const [completTransaction, setcompletTransaction] = useState(true);
  const [isDone, setisDone] = useState(false);
  const [usdtResLoading, setusdtResLoading] = useState(false);
  const [usdcRes, setusdcRes] = useState(null);
  const [usdcResLoading, setusdcResLoading] = useState(false);
  const [messageError, setmessageError] = useState(null);
  const [Approved, setApproved] = useState(false);
  const [not_avilable, setnot_avilable] = useState(false);
  const [Loading,setLoading]=useState(false);
  const state = useSelector((state) => state);
  const dispatch_ = useDispatch()
  const [Wallet_activation,setWallet_activation]=useState(false)
    const [statusMap, setStatusMap] = useState({
      'ETH→USDT': 'default',
      'USDT→USDC': 'default',
      'USDC→Wallet': 'default'
    });
  const { FCM_getToken } = useFirebaseCloudMessaging();
   useEffect(()=>{
    setStatusMap({
      'ETH→USDT': 'default',
      'USDT→USDC': 'default',
      'USDC→Wallet': 'default'
    });
    setisDone(false)
    setLoading(false)
    setnot_avilable(false)
    setApproved(false);
    setInputAmount(null)
    setusdtRes(null)
    setcompletTransaction(false)
    setusdtResLoading(null)
    setusdcRes(null)
    setusdcResLoading(null)
    setmessageError(null)
    fetchUSDTBAL()
    if(ACTIVATED)
    {
      BridgeUSDCValidation()
    }
   },[isVisible])

   function isAssetData(state) {
    return state?.assetData !== undefined && state?.assetData !== null;
  }

  const fetchUSDTBAL=async(value)=>{
    try {
      const walletUSDCAddress = await AsyncStorageLib.getItem("wallet");
      const addresses=JSON?.parse(walletUSDCAddress)?.address
      const provider = new ethers.providers.JsonRpcProvider(RPC.ETHRPC);
      const usdtAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
      const usdtAbi = [
        "function balanceOf(address owner) view returns (uint256)"
      ];

      const usdtContract = new ethers.Contract(usdtAddress, usdtAbi, provider);

      const balance = await usdtContract.balanceOf(addresses);
      console.log(`USDT Balance of ${addresses}: ${ethers.utils.formatUnits(balance, 6)} USDT`); 
      if(parseFloat(value)>=parseFloat(ethers.utils.formatUnits(balance, 6))||parseFloat(ethers.utils.formatUnits(balance, 6))===0){
        setcompletTransaction(true)
      }
      else{
        setcompletTransaction(false)
      }
    } catch (error) {
      console.log("USDT->Bala",error)
    }
  }


   const BridgeUSDCValidation=async()=>{
    const avlRes=isAssetData(state?.assetData);
    if(!avlRes)
    {
      const ALL_STELLER_BALANCES=state?.assetData;
      const hasAsset = ALL_STELLER_BALANCES.some(
        (balance) => balance.asset_code === "USDC" || balance.asset_type === "USDC"
      );
      if (!hasAsset) {
        setnot_avilable(true);
      }
      else{
        setnot_avilable(false);
      }
    }
  
  }

  const changeTrust = async (domainName,domainIssuerAddress) => {
    setLoading(true)
    try {
        console.log(":++++ Entered into trusting ++++:")
        const server = new StellarSdk.Server(STELLAR_URL.URL);
        StellarSdk.Network.usePublicNetwork();
        const account = await server.loadAccount(StellarSdk.Keypair.fromSecret(state.STELLAR_SECRET_KEY).publicKey());
        const transaction = new StellarSdk.TransactionBuilder(account, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: StellarSdk.Network.current().networkPassphrase,
        })
            .addOperation(
                StellarSdk.Operation.changeTrust({
                    asset: new StellarSdk.Asset(domainName, domainIssuerAddress),
                })
            )
            .setTimeout(30)
            .build();
        transaction.sign(StellarSdk.Keypair.fromSecret(state.STELLAR_SECRET_KEY));
        const result = await server.submitTransaction(transaction);
        console.log(`Trustline updated successfully`);
        Snackbar.show({
            text: "USDT added successfully",
            duration: Snackbar.LENGTH_SHORT,
            backgroundColor:'green',
        });
        server.loadAccount(state.STELLAR_PUBLICK_KEY)
            .then(account => {
                console.log('Balances for account:', state.STELLAR_PUBLICK_KEY);
                account.balances.forEach(balance => {
                  dispatch_({
                    type: SET_ASSET_DATA,
                    payload: account.balances,
                  })
                  setLoading(false)
                  setnot_avilable(false)
                  // onClose();
                setWallet_activation(false)
                });
            })
            .catch(error => {
                console.log('Error loading account:', error);
                setLoading(false)
                Snackbar.show({
                    text: "USDT failed to be added",
                    duration: Snackbar.LENGTH_SHORT,
                    backgroundColor:'red',
                });
                setWallet_activation(false)
                onClose();
            });
    } catch (error) {
        console.error(`Error changing trust:`, error);
        setLoading(false)
        setWallet_activation(false)
        Snackbar.show({
            text: 'USDC failed to be added',
            duration: Snackbar.LENGTH_SHORT,
            backgroundColor:'red',
        });
        onClose();
    }
};

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'flex-end',
    },
    modalContainer: {
      backgroundColor: '#080a0a',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 20,
      paddingHorizontal: 15,
    },
    dragHandle: {
      width: 40,
      height: 5,
      backgroundColor: '#444444',
      alignSelf: 'center',
      borderRadius: 3,
      marginBottom: 15,
    },
    inputContainer: {
      marginBottom: 15,
    },
    inputLabel: {
      color: 'white',
      marginBottom: 10,
      fontSize: 16,
    },
    quoteTitle: {
      color: 'white',
      marginBottom: 10,
      fontSize: 16,
    },
    input: {
      borderWidth: 1,
      borderColor: '#333333',
      borderRadius: 8,
      padding: 10,
      color: 'white',
      backgroundColor: '#111111',
    },
    closeButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      padding: 10,
      zIndex: 10,
    },
    closeButtonText: {
      color: 'white',
      fontSize: 16,
    },
    approveCon: {
      width: wp(93),
      backgroundColor: "#3574B6",
      justifyContent: "center",
      alignItems: "center",
      marginTop: hp(1),
      marginBottom: hp(3),
      padding: 14,
      borderRadius: 20

    },
    approveConText: {
      fontSize: 19,
      color: "#fff",
      fontWeight: "600"
    },
    content: {
      padding: 24,
      alignItems: 'center',
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 16,
      textAlign: 'center',
    },
    description: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 22,
    },
    activateButton: {
      backgroundColor: '#4F8EF7',
      borderRadius: 8,
      paddingVertical: 14,
      paddingHorizontal: 24,
      width: '100%',
      alignItems: 'center',
      marginBottom: 12,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    cancelButton: {
      padding: 10,
    },
    cancelText: {
      fontSize: 14,
    },
    quoteTitleCon:{
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 12,
      color: '#fff',
    },
  });
  
  const handleUSDTBNB = async (value,address,token) => {
    if(token==="USDT")
    {
      setusdtRes(null)
      setusdtResLoading(false)
      await handleUSDC(value,"BSC")
    }else{
      const res=await getBNBTokenQuoteToUSDT(address,value)
      if(res.status)
        {
          setusdtRes(res)
          setusdtResLoading(false)
          await handleUSDC(res?.minimumAmountOut?.toFixed(6)?.toString(),"BSC")
        }
    }
  }

  const handleUSDT = async (value,address,token) => {
    if(token==="USDT")
    {
      fetchUSDTBAL(value)
      setusdtRes(null)
      setusdtResLoading(false)
      await handleUSDC(value,"ETH")
    }else{
      const res=await getTokenQuoteToUSDT(address,value,token)
      if(res.status)
        {
        console.log("---err->",res)
        const walletAddress = await AsyncStorageLib.getItem("wallet");
        const provider = new ethers.providers.JsonRpcProvider(RPC.ETHRPC);
        const EthBalance = await provider.getBalance(JSON.parse(walletAddress).address);
        const balanceInEth = ethers.utils.formatEther(EthBalance);
        console.log("---ae",balanceInEth)
            if(parseFloat(value)>=parseFloat(balanceInEth)||parseFloat(balanceInEth)===0){
              setcompletTransaction(true)
            }
            else{
              setcompletTransaction(false)
            }
          setusdtRes(res)
          setusdtResLoading(false)
          await handleUSDC(res?.minimumAmountOut,"ETH")
        }
    }
  }

  const handleUSDC = async (value,typeOfchain) => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "Bearer " + await getToken());

    const raw = JSON.stringify({
      "amount": value,
      "chainType":typeOfchain
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };

    fetch(REACT_APP_HOST + "/users/swapInfo", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log("---err->",result)
        if (result?.status === 200) {
          setusdcRes(result?.response),
            setusdcResLoading(false)
        }
        else {
          setusdcResLoading(false)
          setusdcRes(null)
          console.log("---err->",result)
          Alert.alert("Info", "An error occurred. Please try again later.")
        }
      })
      .catch((error) => console.error(error));
  }


  const isValidNumber = (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num !== 0;
  };
  const fetchQuote = useCallback(
    debounce((value,token,tokenAddre,chaiType) => {
      setApproved(false)
      setmessageError(null);
      if (isValidNumber(value)&&value!=="null") {
        setmessageError(null);
        setusdtRes(null)
        setusdtResLoading(true)
        setusdcRes(null)
        setusdcResLoading(true)
        if(chaiType==="ETH")
        {
          handleUSDT(value,tokenAddre,token)
        }
        if(chaiType==="BSC")
          {
            handleUSDTBNB(value,tokenAddre,token)
          }
      }
      else {
        setmessageError("Invalid Amount");
      }
    }, 400),
    []
  );

  const handleInputChange = (text) => {
    const numericText = text.replace(/[^0-9.]/g, '');
    setInputAmount(numericText);
    fetchQuote(text,tokenName,tokenAddress,tokenChain);
  };
   // Function to update a specific step's status
   const handleStepUpdate = (stepKey, status) => {
    setStatusMap(prevStatus => ({
      ...prevStatus,
      [stepKey]: status
    }));
  };

  const handlleMultiProcces = async (token,value1) => {
    setApproved(true)
    if (token === "USDT") {
      handleStepUpdate("USDT→USDT","done")
      setisDone(true)
      const resAmt=parseFloat(value1).toFixed(6).toString();
      await sendEthToContract(resAmt)
    }
    if (token !== "USDT") {
      setisDone(true)
      handleStepUpdate("WETH→USDT","pending")
      const res = await onSwapETHtoUSDC(inputAmount, state?.wallet?.privateKey, RPC.ETHRPC2)
      if (res.status === true) {
      handleStepUpdate("WETH→USDT","done")
        console.log("--onSwapETHtoUSDC-->", res)
        await sendEthToContract(res.outputAmount)
      }
      else {
      handleStepUpdate("WETH→USDT","error")
      handleStepUpdate("USDT→USDC","error")
      handleStepUpdate("USDC→Wallet","error")
        Alert.alert("Info", res.message)
        setisDone(false)
      }
    }
    // setApproved(true)
  }
  const errorExtractor = (resp) => {
    try {
      const errorString = resp.res.toString();
      const fundMatchResult = errorString.match(/have\s*(\d+)\s*want\s*(\d+)/);
      if (fundMatchResult) {
        const [, haveFunds, wantFunds] = fundMatchResult;
        const fundsAnalysis = {
          haveFunds: haveFunds,
          wantFunds: wantFunds
        }; 
        return fundsAnalysis;
      }
      return 'Error';
    } catch (error) {
      return 'Error';
    }
  };
   const sendEthToContract = async (amount) => {
      try {
        keysUpdate()
        handleStepUpdate("USDT→USDC","pending")
        const ressult_swap = await swap_prepare(state.wallet.privateKey, state.wallet.address, state.STELLAR_PUBLICK_KEY, amount, "USDT", "USDC", "Ethereum")
           console.log("last ui res ---->", ressult_swap)
           if (ressult_swap.status_task) {
             setisDone(false)
             handleStepUpdate("USDT→USDC", "done")
             setTimeout(() => {
               handleStepUpdate("USDC→Wallet", "done")
             }, 2000);
           }
           else {
             const res=errorExtractor(ressult_swap);
             if(res!=="Error")
             {
               Alert.alert("info",`Insufficient funds you have ${res.haveFunds} want ${res.wantFunds}`);
             }
             setisDone(false)
             handleStepUpdate("USDT→USDC","error")
             handleStepUpdate("USDC→Wallet","error")
           }
        // setApproved(true)
    } catch (error) {
        console.log("Transaction Failed", error);
        setisDone(false)
        handleStepUpdate("USDT→USDC","error")
        handleStepUpdate("USDC→Wallet","error")
    }
  }

  const keysUpdate=async()=>{
    try {
       const postData = {
              publicKey: state?.STELLAR_PUBLICK_KEY,
              wallletPublicKey:state?.ETH_KEY
            };
        
            // Update public key by email
            const response = await fetch(`${REACT_APP_HOST}/users/updatePublicKey`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer "+await getToken()
              },
              body: JSON.stringify(postData),
            });
            
            const data = await response.json();
            console.log("---keysUpdate>>>>", data);
    } catch (error) {
      console.log(error)
    }
  }

  const theme = {
    background: '#1E1E1E',
    text: '#FFFFFF',
    secondaryText: '#AAAAAA',
    accentColor: '#4F8EF7',
    accentBackground: '#2C3E50',
    handleColor: '#555555',
    backdropColor: 'rgba(0, 0, 0, 0.7)'
  };

  const syncDevice = async () => {
    const token = await FCM_getToken();
    console.log(token);
    console.log("hi----->>>ttokenb", token);
    const device_info = {
      'deviceBrand': await DeviceInfo.getBrand(),
      'deviceModel': await DeviceInfo.getModel(),
      'systemVersion': await DeviceInfo.getSystemVersion(),
      "deviceUniqueID": await DeviceInfo.getUniqueIdSync(),
      "deviceIP": await DeviceInfo.getIpAddressSync(),
      "deviceType": await DeviceInfo.getDeviceType(),
      "deviceMacAddress": await DeviceInfo.getMacAddress()
    }
    try {
      const { res } = await authRequest(
        `/users/getInSynced/${token}`,
        GET
      );
      if (res.isInSynced) {
        const { err } = await authRequest("/users/syncDevice", POST, {
          fcmRegToken: token,
          deviceInfo:device_info
        });
        if (err){
          return { status: false };
        } 
        return { status: true };
      }

      return { status: true }; 
    } catch (err) {
      console.log(err)
      return { status: false };
    }
  };
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const active_account = async () => {
    console.log("<<<<<<<clicked");
    try {  
      // Retrieve token and stored email in parallel
      const [token, storedEmail] = await Promise.all([
        getToken(),
        AsyncStorageLib.getItem('user_email')
      ]);
  
      console.log("Token:", token);
  
      const postData = {
        email: storedEmail,
        publicKey: state?.STELLAR_PUBLICK_KEY,
        wallletPublicKey:state?.ETH_KEY
      };
  
      // Update public key by email
      const response = await fetch(`${REACT_APP_HOST}/users/updatePublicKeyByEmail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData),
      });
      
      const data = await response.json();
      console.log("--->>>>", data);
  
      if (data.message === "Funded successfully") {
         const keypair = StellarSdk.Keypair.fromSecret(state.STELLAR_SECRET_KEY);
        const envelope = StellarSdk.xdr.TransactionEnvelope.fromXDR(data?.resXdr, "base64");
        const tx = new StellarSdk.Transaction(envelope, StellarSdk.Networks.PUBLIC);
        tx.sign(keypair);
        const server = new StellarSdk.Server(STELLAR_URL.URL);
        const result = await server.submitTransaction(tx);
        if(result?.successful===true)
        {        
        // await delay(3000)
          // await changeTrust("USDC","GALANI4WK6ZICIQXLRSBYNGJMVVH3XTZYFNIVIDZ4QA33GJLSFH2BSID")
        // Dispatch success action and load account details from Stellar in parallel
        server.loadAccount(state.STELLAR_PUBLICK_KEY)
        .then(account => {
            console.log('Balances for account:', state.STELLAR_PUBLICK_KEY);
            account.balances.forEach(balance => {
              dispatch_({
                type: SET_ASSET_DATA,
                payload: account.balances,
              })
               dispatch_({
                type: RAPID_STELLAR,
                payload: {
                  ETH_KEY: state.ETH_KEY,
                  STELLAR_PUBLICK_KEY: state.STELLAR_PUBLICK_KEY,
                  STELLAR_SECRET_KEY: state.STELLAR_SECRET_KEY,
                  STELLAR_ADDRESS_STATUS: true
                },
              });
              Snackbar.show({
                text: 'Wallet Activated',
                duration: Snackbar.LENGTH_SHORT,
                backgroundColor:'green',
            });
            setLoading(false)
            setWallet_activation(false)
            });
        })
        .catch(error => {
            console.log('Error loading account:', error);
            setLoading(false)
            Snackbar.show({
                text: "USDT failed to be added",
                duration: Snackbar.LENGTH_SHORT,
                backgroundColor:'red',
            });
            setWallet_activation(false)
            onClose();
        });
        
        // setWallet_activation(false);
       
    }
    else{
      console.log("Error: Funding account failed.");
      setWallet_activation(false);
      onClose()
      Snackbar.show({
        text: 'Activation failed',
        duration: Snackbar.LENGTH_SHORT,
        backgroundColor:'red',
    });
    }

        // onClose()
      } else if (data.message === "Error funding account") {
        console.log("Error: Funding account failed.");
        setWallet_activation(false);
        onClose()
        Snackbar.show({
          text: 'Activation failed',
          duration: Snackbar.LENGTH_SHORT,
          backgroundColor:'red',
      });
      }
  
    } catch (error) {
      console.error('Network or fetch error:', error);
      setWallet_activation(false);
      Snackbar.show({
        text: 'Activation failed',
        duration: Snackbar.LENGTH_SHORT,
        backgroundColor:'red',
    });
      onClose()
    }
  };


  const ActivationHandle=async()=>{
    setWallet_activation(true)
   const res=await syncDevice()
   if(res.status)
   {
    await active_account()
   }else{
    setWallet_activation(false)
   }
  }

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {/* Prevent touch events from closing when touching the modal content */}
       <TouchableWithoutFeedback>
          <View style={styles.modalContainer}>
            {/* Drag handle */}
            <View style={styles.dragHandle} />

            {/* Close Button */}
            {!Approved&&<TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              disabled={Loading||Wallet_activation}
            >
                <MaterialCommunityIcons
                  name={'close-circle-outline'}
                  size={33}
                  color={"white"}
                />
            </TouchableOpacity>}

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >

             {!Approved?
             <>
             {!ACTIVATED?
                 <View style={styles.content}>
                       <View style={[styles.iconContainer, { backgroundColor: theme.accentBackground }]}>
                       <Ionicons name="warning-outline" size={40} color={theme.accentColor} />
                       </View>
                       
                       <Text style={[styles.title, { color: theme.text }]}>
                       Activate and Trust USDT
                       </Text>
                       
                       <Text style={[styles.description, { color: theme.secondaryText }]}>
                       Your Stellar wallet isn’t activated yet. Activate it now to automatically trust USDC and start using all features seamlessly!
                       </Text>
                       
                       <TouchableOpacity 
                         style={[styles.activateButton,{backgroundColor:Wallet_activation?"gray":"#4F8EF7"}]}
                         onPress={()=>{ActivationHandle()}}
                         disabled={Wallet_activation}
                       >
                         {Wallet_activation?<ActivityIndicator color={"green"} size={"small"}/>:<Text style={styles.buttonText}>Claim 5 XLM Now!</Text>}
                       </TouchableOpacity>
                       
                       <TouchableOpacity 
                         style={styles.cancelButton}
                         onPress={onClose}
                         disabled={Wallet_activation}
                       >
                         <Text style={[styles.cancelText, { color: theme.secondaryText }]}>
                           Remind Me Later
                         </Text>
                       </TouchableOpacity>
                     </View>
             :
             not_avilable?
             <View style={styles.content}>
             <View style={[styles.iconContainer, { backgroundColor: theme.accentBackground }]}>
             <Ionicons name="warning-outline" size={40} color={theme.accentColor} />
             </View>
             
             <Text style={[styles.title, { color: theme.text }]}>
              Trust USDC
             </Text>
             <Text style={[styles.description, { color: theme.secondaryText }]}>
            Please trust USDC first to ensure a smooth and uninterrupted experience.
             </Text>
             
             <TouchableOpacity 
               style={[styles.activateButton,{backgroundColor:Loading?"gray":"#4F8EF7"}]}
               disabled={Loading}
               onPress={()=>{changeTrust("USDC","GALANI4WK6ZICIQXLRSBYNGJMVVH3XTZYFNIVIDZ4QA33GJLSFH2BSID")}}
             >
               {Loading?<ActivityIndicator color={"green"} size={"small"}/>:<Text style={styles.buttonText}>Trust Now!</Text>}
             </TouchableOpacity>
             
             <TouchableOpacity 
               style={styles.cancelButton}
               onPress={onClose}
               disabled={Loading}
             >
               <Text style={[styles.cancelText, { color: theme.secondaryText }]}>
                 Remind Me Later
               </Text>
             </TouchableOpacity>
           </View>:
                <>
                <Text style={styles.quoteTitle}>How much {tokenName==="WETH"?"USDT":tokenName} you want on trade wallet?</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Enter Amount</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter swap amount"
                  placeholderTextColor={'#666666'}
                  keyboardType="numeric"
                  value={inputAmount}
                  onChangeText={handleInputChange}
                />
                <Text style={{ color: "red" }}>{messageError}</Text>
              </View>
                </>}

                  <View style={{
                    padding: 9,
                    backgroundColor: "#33373DCC",
                    borderRadius: 8,
                    marginBottom:hp(2)
                  }}>
                     {usdtRes!==null||usdcRes!==null?<Text style={styles.quoteTitleCon}>Quote Details</Text>:null}
              {/* USDT Quote Details Component */}
              <QuotesComponent
                quoteInfo={usdtRes}
                loading={usdtResLoading}
                sourceToken={tokenName}
                destinationToken={"USDT"}
                hideQuote={false}
                typeProvider={tokenChain==="ETH"?"Uniswap":"PancakeSwap"}
              />
              {/*USDC Quote Details Component */}
              <QuotesComponent
                quoteInfo={usdcRes}
                loading={usdcResLoading}
                sourceToken={"USDT"}
                destinationToken={"USDC"}
                hideQuote={false}
                typeProvider={"Allbridge"}
              />
              </View>
              <QuotesResComponent 
                quoteInfo={usdtRes}
                sourceToken={tokenName}
                quoteInfoDes={usdcRes}
                destinationToken={"USDC"}
              />
              {!ACTIVATED?null:not_avilable?null:
              <TouchableOpacity disabled={usdcResLoading || usdtResLoading || !usdcRes||completTransaction||isDone } style={[styles.approveCon, { backgroundColor: usdcResLoading || usdtResLoading || !usdcRes||completTransaction||isDone  ? "gray" : Approved ? "green" : "#3574B6" }]} onPress={() => { handlleMultiProcces(tokenName,usdcRes?.minimumAmountOut) }}>
                {Approved ? <Icon name={"check-circle-outline"} type={"materialCommunity"} size={25} color={"white"} /> : isDone?<ActivityIndicator color={"green"} size={"small"}/>:<Text style={styles.approveConText}>{ usdcResLoading?"Getting best quote...":completTransaction?inputAmount!==null?"Insufficient balance":"Approve":"Approve"}</Text>}
              </TouchableOpacity>}
              </>
                :<TokenTransferFlow visible={Approved} fistToken={tokenName} statusMap={statusMap} onClose={()=>{onClose()}}/>}

            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
};

const TokenTransferFlow = ({ 
  visible = false, 
  fistToken = 'ETH', 
  statusMap = {}, 
  onClose 
}) => {
  const [showNotification, setShowNotification] = useState(false);
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const prevCompletedStepsRef = useRef(0);
  
  const tokens = [
    { from: fistToken, to: 'USDT', key: `${fistToken}→USDT` },
    { from: 'USDT', to: 'USDC', key: 'USDT→USDC' },
    { from: 'USDC', to: 'Wallet', key: 'USDC→Wallet' }
  ];

  useEffect(() => {
    if (!visible) {
      // Reset when not visible
      progressAnimation.setValue(0);
      prevCompletedStepsRef.current = 0;
      setShowNotification(false);
      return;
    }

    let completedSteps = 0;
    tokens.forEach(token => {
      if (statusMap[token.key] === 'done') completedSteps++;
    });

    // Only update if number of completed steps has changed
    if (completedSteps !== prevCompletedStepsRef.current) {
      // Calculate progress (ensuring it maxes at 100%)
      const newProgress = Math.min(completedSteps * (100/3), 100);
      
      // Animate progress bar from current value to new value
      Animated.timing(progressAnimation, {
        toValue: newProgress,
        duration: 600, // Animation duration in ms
        useNativeDriver: false
      }).start();

      // Update reference for next comparison
      prevCompletedStepsRef.current = completedSteps;
    }

    // Show notification when all steps are complete
    if (completedSteps === tokens.length) {
      setShowNotification(true);
    } else {
      setShowNotification(false);
    }
  }, [visible, statusMap, progressAnimation, tokens]);

  // For display in the text element
  const [progressTextValue, setProgressTextValue] = useState(0);

  // Update the text value when animation changes
  useEffect(() => {
    const listener = progressAnimation.addListener(({ value }) => {
      setProgressTextValue(Math.round(value));
    });
    
    return () => {
      progressAnimation.removeListener(listener);
    };
  }, [progressAnimation]);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Token Transfer Flow</Text>
      </View>

      <View style={styles.tokenTransferContainer}>
        {tokens.map((token) => {
          const status = statusMap[token.key] || 'default';
          const isCompleted = status === 'done';
          const isError = status === 'error';
          const isPending = status === 'pending';

          return (
            <View key={token.key} style={styles.tokenStep}>
              <View style={[
                styles.tokenCircle,
                isCompleted ? styles.completedTokenCircle : {},
                isPending ? styles.pendingTokenCircle : {},
                isError ? styles.errorTokenCircle : {},
                !isCompleted && !isPending && !isError ? styles.defaultTokenCircle : {},
              ]}>
                <MaterialCommunityIcons
                  name={
                    isCompleted ? 'check-circle' 
                    : isError ? 'close-circle' 
                    : isPending ? 'timer-outline' 
                    : 'swap-horizontal'
                  }
                  size={32}
                  color={
                    isCompleted ? '#10B981' 
                    : isError ? '#EF4444' 
                    : isPending ? '#FBBF24' 
                    : '#9CA3AF'
                  }
                />
              </View>
              <Text style={[
                styles.tokenText,
                isCompleted ? styles.completedTokenText : {},
                isError ? styles.errorTokenText : {},
                isPending ? styles.pendingTokenText : {},
                !isCompleted && !isPending && !isError ? styles.defaultTokenText : {},
              ]}>
                {token.from} <MaterialCommunityIcons
                  name={"arrow-right"} size={15} 
                  color={isCompleted ? '#10B981' : isError ? '#EF4444' : isPending ? '#FBBF24' : '#9CA3AF'}/> {token.to}
              </Text>
            </View>
          );
        })}
      </View>

      {showNotification ? (
        <View style={styles.notificationContainer}>
          <Text style={styles.notificationText}>Estimated time: 19 min. We'll notify you when complete.</Text>
          <TouchableOpacity style={styles.button} onPress={() => {onClose()}}>
            <Text style={styles.buttonText}>Okay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Progress: {progressTextValue}%
          </Text>
          <View style={styles.progressBarBackground}>
            <Animated.View 
              style={[
                styles.progressBar, 
                { width: progressAnimation.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%']
                })}
              ]} 
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    backgroundColor: '#111111',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F0F9FF',
  },
  tokenTransferContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  tokenStep: {
    alignItems: 'center',
  },
  tokenCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  defaultTokenCircle: {
    borderColor: '#9CA3AF',
    backgroundColor: '#E5E7EB',
  },
  completedTokenCircle: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  pendingTokenCircle: {
    borderColor: '#FBBF24',
    backgroundColor: '#FEF9C3',
  },
  errorTokenCircle: {
    borderColor: '#EF4444',
    backgroundColor: '#FEE2E2',
  },
  tokenText: {
    marginTop: 10,
    fontSize: 14,
    color: '#6B7280',
  },
  completedTokenText: {
    color: '#10B981',
    fontWeight: 'bold',
  },
  pendingTokenText: {
    color: '#F59E0B',
    fontWeight: 'bold',
  },
  errorTokenText: {
    color: '#EF4444',
    fontWeight: 'bold',
  },
  defaultTokenText: {
    color: '#9CA3AF',
  },
  progressContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 9999,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 9999,
  },
  notificationContainer: {
    backgroundColor: '#171616',
    borderRadius: 8,
    padding: 12,
    width: '100%',
  },
  notificationText: {
    fontSize: 14,
    color: '#1E40AF',
    textAlign: 'center',
  },
  button: {
    width: '100%',
    backgroundColor: "#3574B6",
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp(0.6),
    marginBottom: hp(0.6),
    padding: 14,
    borderRadius: 20

  },
  buttonText: {
    fontSize: 19,
    color: "#fff",
    fontWeight: "600"
  },
});
const getTokenQuoteToUSDT=async(tokenAddres, amount, token)=> {
     return await getCUSTOMSwapQuote(tokenAddres, amount,token)
  }
  

  async function getBNBTokenQuoteToUSDT(tokenAddress, amount, slippageTolerance = 0.01) {
    // Setup provider for Binance Smart Chain
    const provider = new ethers.providers.JsonRpcProvider(RPC.BSCRPC2);
  
    // PancakeSwap V2 Router address on BSC
    const PANCAKESWAP_V2_ROUTER = '0x10ED43C718714eb63d5aA57B78B54704E256024E';
  
    // USDT token address on Binance Smart Chain
    const USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';
  
    // ABI for the PancakeSwap V2 Router
    const PANCAKESWAP_V2_ROUTER_ABI = [
      'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)'
    ];
  
    try {
      // Create contract instance for PancakeSwap Router
      const pancakeswapRouter = new ethers.Contract(
        PANCAKESWAP_V2_ROUTER, 
        PANCAKESWAP_V2_ROUTER_ABI, 
        provider
      );
  
      // Specify the path: Token -> WBNB -> USDT
      const path = [
        tokenAddress,
        '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // WBNB address
        USDT_ADDRESS
      ];
  
      // Convert amount to token's smallest unit (consider token's decimals)
      const amountIn = ethers.utils.parseUnits(amount.toString(), 18);
  
      // Get amounts out (quote)
      const amounts = await pancakeswapRouter.getAmountsOut(amountIn, path);
  
      // Convert result to human-readable format
      const outputAmount = ethers.utils.formatUnits(amounts[2], 18);
      
      // Calculate conversion rate
      const conversionRate = outputAmount / amount;
  
      // Calculate minimum receive amount with slippage tolerance
      const minimumReceiveAmount = outputAmount * (1 - slippageTolerance);
  
      // Construct result object
      const result = {
        conversionRate,
        minimumAmountOut: minimumReceiveAmount,
        slippageTolerance,
        inputAmount: amount,
        inputToken: tokenAddress,
        outputAmount: parseFloat(outputAmount),
        outputToken: USDT_ADDRESS,
        status:true
      };
  
      return result;
    } catch (error) {
      console.error('Error fetching quote:', error);
      const result = {status:false}
      return result;
    }
  }