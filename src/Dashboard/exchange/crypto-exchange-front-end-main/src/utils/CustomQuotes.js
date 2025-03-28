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
import { getToken } from '../api';
import { useNavigation } from '@react-navigation/native';
import Icon from '../../../../../icon';
import { ethers } from 'ethers';
import { RPC } from '../../../../constants';
import Ionicons from "react-native-vector-icons/Ionicons";


export const QuotesComponent = ({ quoteInfo, loading, sourceToken, destinationToken,hideQuote }) => {

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
      backgroundColor: '#33373DCC',
      marginTop: 3,
      padding: 16,
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
    <View style={{ padding: 3 }}>
      {quoteInfo !== null && (
        <View style={[styles.quoteDetailsContainer, { marginBottom: 10 }]}>
          <Text style={styles.quoteTitle}>Quote Details</Text>

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
      backgroundColor: "#33373DCC",
      bt: 8,
    },
    quoteText: {
      fontSize: 24,
      color: 'silver',
      borderRadius: 8,
    },
  });

  if (!quoteInfo && !quoteInfoDes) return null;

  return (
    <View style={{ padding: 3, backgroundColor: "#33373DCC" }}>
    {(quoteInfo || quoteInfoDes) && (
      <>
        {sourceToken && quoteInfo && (
          <View style={styles.quoteTextCon}>
            <Text style={styles.quoteText}>≈</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Text style={styles.quoteText}>{quoteInfo?.minimumAmountOut || "--"}</Text>
            </ScrollView>
            <Text style={styles.quoteText}> USDT</Text>
          </View>
        )}
  
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
  const [inputAmount, setInputAmount] = useState('');
  const [usdtRes, setusdtRes] = useState(null);
  const [usdtResLoading, setusdtResLoading] = useState(false);
  const [usdcRes, setusdcRes] = useState(null);
  const [usdcResLoading, setusdcResLoading] = useState(false);
  const [messageError, setmessageError] = useState(null);
  const [Approved, setApproved] = useState(false);
   useEffect(()=>{
    setApproved(false);
    setInputAmount(null)
    setusdtRes(null)
    setusdtResLoading(null)
    setusdcRes(null)
    setusdcResLoading(null)
    setmessageError(null)
   },[isVisible])
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
      width: wp(90),
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
  });

  const handleUSDT = async (value,address,token) => {
    if(token==="USDT")
    {
      setusdtRes(null)
      setusdtResLoading(false)
      await handleUSDC(value)
    }else{
      const res=await getTokenQuoteToUSDT(address,value)
      if(res.status)
        {
          setusdtRes(res)
          setusdtResLoading(false)
          await handleUSDC(res?.minimumAmountOut?.toFixed(6)?.toString())
        }
    }
  }

  const handleUSDC = async (value) => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "Bearer " + await getToken());

    const raw = JSON.stringify({
      "amount": value
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
    debounce((value,token) => {
      setApproved(false)
      setmessageError(null);
      if (isValidNumber(value)&&value!=="null") {
        setmessageError(null);
        setusdtRes(null)
        setusdtResLoading(true)
        setusdcRes(null)
        setusdcResLoading(true)
        handleUSDT(value,tokenAddress,token)
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
    fetchQuote(text,tokenName);
  };

  const handlleMultiProcces = async () => {
    setApproved(true)
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
                       Activate Your Wallet
                       </Text>
                       
                       <Text style={[styles.description, { color: theme.secondaryText }]}>
                       Your Stellar wallet isn’t activated yet.
                       Activate it now to start using all the features seamlessly!
                       </Text>
                       
                       <TouchableOpacity 
                         style={styles.activateButton}
                         onPress={onClose}
                       >
                         <Text style={styles.buttonText}>Claim 5 XLM Now!</Text>
                       </TouchableOpacity>
                       
                       <TouchableOpacity 
                         style={styles.cancelButton}
                         onPress={onClose}
                       >
                         <Text style={[styles.cancelText, { color: theme.secondaryText }]}>
                           Remind Me Later
                         </Text>
                       </TouchableOpacity>
                     </View>
             :
                <>
                <Text style={styles.quoteTitle}>How much {tokenName} you want on trade wallet?</Text>
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

              {/* USDT Quote Details Component */}
              <QuotesComponent
                quoteInfo={usdtRes}
                loading={usdtResLoading}
                sourceToken={tokenName}
                destinationToken={"USDT"}
                hideQuote={false}
              />
              {/*USDC Quote Details Component */}
              <QuotesComponent
                quoteInfo={usdcRes}
                loading={usdcResLoading}
                sourceToken={"USDT"}
                destinationToken={"USDC"}
                hideQuote={false}
              />
              <QuotesResComponent 
                quoteInfo={usdtRes}
                sourceToken={tokenName}
                quoteInfoDes={usdcRes}
                destinationToken={"USDC"}
              />
              {!ACTIVATED?null:
              <TouchableOpacity disabled={usdcResLoading || usdtResLoading || !usdcRes } style={[styles.approveCon, { backgroundColor: usdcResLoading || usdtResLoading || !usdcRes  ? "gray" : Approved ? "green" : "#3574B6" }]} onPress={() => { handlleMultiProcces() }}>
                {Approved ? <Icon name={"check-circle-outline"} type={"materialCommunity"} size={25} color={"white"} /> : <Text style={styles.approveConText}>{ usdcResLoading?"Getting best quote...":"Approve"}</Text>}
              </TouchableOpacity>}
              </>
                :<TokenTransferFlow visible={Approved} fistToken={tokenName} onClose={()=>{onClose()}}/>}

            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
};

const TokenTransferFlow = ({ visible = false,fistToken,onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [progressText, setProgressText] = useState('0%');
  const [showEstimate, setShowEstimate] = useState(false);
  const [progressStopped, setProgressStopped] = useState(false);
  const tokens = [
    { from: fistToken, to: 'USDT', icon: 'swap-horizontal' },
    { from: 'USDT', to: 'USDC', icon: 'repeat' },
    { from: 'USDC', to: 'Wallet', icon: 'wallet' }
  ];

  useEffect(() => {
    if (!visible) return;

    progressAnim.setValue(0);
    setCurrentStep(0);
    setShowEstimate(false);
    setProgressStopped(false);

    const animation = Animated.timing(progressAnim, {
      toValue: 60, // 60% pe ruk jayegi
      duration: 4000, // Smooth animation
      useNativeDriver: false,
    });

    animation.start();

    const listener = progressAnim.addListener(({ value }) => {
      setProgressText(`${Math.round(value)}%`);

      if (value >= 60) {
        setShowEstimate(true);
        setProgressStopped(true);
        animation.stop(); // Yahan progress stop ho jayegi
      }

      if (value >= 30) {
        setCurrentStep(1); // USDT → USDC green ho jayega
      }
      if (value >= 60) {
        setCurrentStep(2); // USDC → Wallet pe aayega (yellow)
      }
    });

    return () => {
      progressAnim.removeListener(listener);
      animation.stop();
    };
  }, [visible]);

  if (!visible) return null;

  useEffect(() => {
    if (showEstimate) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer); 
    }
  }, [showEstimate]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Token Transfer Flow</Text>
        <Text style={styles.headerSubtitle}>Real-time Token Conversion</Text>
      </View>

      <View style={styles.tokenTransferContainer}>
        {tokens.map((token, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isLastStep = index === tokens.length - 1;

          return (
            <View key={token.from} style={styles.tokenStep}>
              <View style={[
                styles.tokenCircle,
                isCompleted ? styles.completedTokenCircle : {},
                isCurrent && !isLastStep ? styles.inProgressTokenCircle : {},
                isLastStep && isCurrent ? styles.pendingTokenCircle : {}
              ]}>
                <MaterialCommunityIcons
                  name={isCompleted ? 'check-circle' : token.icon}
                  size={32}
                  color={isCompleted?'#10B981':isCurrent?'#FBBF24':'#9CA3AF'}
                />
              </View>
              <Text style={[
                styles.tokenText,
                isCompleted ? styles.completedTokenText : {},
                isCurrent && !isLastStep ? styles.inProgressTokenText : {},
                isLastStep && isCurrent ? styles.pendingTokenText : {}
              ]}>
                {token.from} <MaterialCommunityIcons
                  name={"arrow-right"} size={15} color={isCompleted?'#10B981':isCurrent?'#FBBF24':'#9CA3AF'}/> {token.to}
              </Text>
            </View>
          );
        })}
      </View>

        {showEstimate ? (
          <View style={styles.notificationContainer}>
            <Text style={styles.notificationText}>Estimated time: 19 min. We'll notify you when complete.</Text>
          </View>
        ) : (
          <View style={styles.progressContainer}>
          <Animated.Text style={styles.progressText}>Progress: {progressText}</Animated.Text>
        <View style={styles.progressBarBackground}>
          <Animated.View style={[
            styles.progressBar,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 60],
                outputRange: ['0%', '60%']
              }),
            }
          ]} />
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
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
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
    borderColor: 'gray',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  completedTokenCircle: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  inProgressTokenCircle: {
    borderColor: '#FBBF24',
    backgroundColor: '#FEF9C3',
  },
  pendingTokenCircle: {
    borderColor: '#FBBF24',
    backgroundColor: '#FEF9C3',
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
  inProgressTokenText: {
    color: '#F59E0B',
    fontWeight: 'bold',
  },
  pendingTokenText: {
    color: '#F59E0B',
    fontWeight: 'bold',
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
});
const getTokenQuoteToUSDT=async(tokenAddres, amount, slippageTolerance = 0.01)=> {
    // Setup provider (replace with your preferred Ethereum node provider)
    const provider = new ethers.providers.JsonRpcProvider(RPC.ETHRPC2);
  
    // Uniswap V2 Router address
    const UNISWAP_V2_ROUTER = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
  
    // USDT token address on Ethereum mainnet
    const USDT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
  
    // ABI for the Uniswap V2 Router
    const UNISWAP_V2_ROUTER_ABI = [
      'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)'
    ];
  
    try {
      // Create contract instance for Uniswap Router
      const uniswapRouter = new ethers.Contract(
        UNISWAP_V2_ROUTER, 
        UNISWAP_V2_ROUTER_ABI, 
        provider
      );
  
      // Specify the path: Token -> WETH -> USDT
      const path = [
        tokenAddres,
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH address
        USDT_ADDRESS
      ];
  
      // Convert amount to token's smallest unit (consider token's decimals)
      const amountIn = ethers.utils.parseUnits(amount.toString(), 18);
  
      // Get amounts out (quote)
      const amounts = await uniswapRouter.getAmountsOut(amountIn, path);
  
      // Convert result to human-readable format
      const outputAmount = ethers.utils.formatUnits(amounts[2], 6);
      
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
        inputToken: tokenAddres,
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
  