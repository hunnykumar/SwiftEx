import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { ethers } from 'ethers';
import { useNavigation } from '@react-navigation/native';
import Icon from "react-native-vector-icons/Ionicons";
import { useSelector } from 'react-redux';
import { RPC } from '../Dashboard/constants';
import { Wallet_screen_header } from '../Dashboard/reusables/ExchangeHeader';


// Contract addresses for BSC Testnet
const ROUTER_ADDRESS = "0xD99D1c33F9fC3444f8101754aBC46c52416550D1";
const WBNB_ADDRESS = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd";
const USDT_ADDRESS = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd";

// Simplified ABIs
const ROUTER_ABI = [
  "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
  "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)"
];

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
];


const TOKENS = [
  {
    symbol: 'WBNB',
    name: 'Wrapped Ethereum',
    decimals: 18,
    address: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd', 
    balance: '1.5',
    logoUri: "https://tokens.pancakeswap.finance/images/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c.png",

  },
  {
    symbol: 'USDT',
    name: 'USD Coin',
    decimals: 6,
    address: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
    balance: '1000',
    logoUri:'https://tokens.pancakeswap.finance/images/0x55d398326f99059fF775485246999027B3197955.png'
  }
];

const BnbSwap = () => {
  // Keep your existing state management
  const [bnbBalance, setBnbBalance] = useState('0.00000');
  const [usdtBalance, setUsdtBalance] = useState('0.00000');
  const [bnbAmount, setBnbAmount] = useState('');
  const [estimatedUsdt, setEstimatedUsdt] = useState('0');
  const [loading, setLoading] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [userAddress, setUserAddress] = useState('');
  const [showQuoteDetails, setShowQuoteDetails] = useState(true);
  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS[1]);
  const state=useSelector((state)=>state);

// Initialize provider and get balances
const initializeWallet = async () => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      RPC.BSCRPC2
    );
    setProvider(provider);
    
    // In a real app, you'd implement wallet connection here
    // This is just for demonstration
    const testPrivateKey = state?.wallet?.privateKey; // PRIVATE-KEY
    const wallet = new ethers.Wallet(testPrivateKey, provider);
    setSigner(wallet);
    setUserAddress(wallet.address);
    setWalletConnected(true);
    
    await updateBalances(wallet.address, provider);
  } catch (error) {
    Alert.alert('Error', 'Failed to initialize wallet');
    console.log(error);
  }
};

// Update BNB and USDT balances
const updateBalances = async (address, provider) => {
  try {
    // Get BNB balance
    const bnbBalance = await provider.getBalance(address);
    setBnbBalance(ethers.utils.formatEther(bnbBalance));

    // Get USDT balance
    const usdtContract = new ethers.Contract(toToken.address, ERC20_ABI, provider);
    const usdtBalance = await usdtContract.balanceOf(address);
    setUsdtBalance(ethers.utils.formatUnits(usdtBalance, 18));
  } catch (error) {
    console.error('Balance update error:', error);
  }
};

// Get price quote
const getQuote = async (inputAmount) => {
  if (!inputAmount || isNaN(inputAmount)) return;
  
  setQuoteLoading(true);
  try {
    const router = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, provider);
    const amountIn = ethers.utils.parseEther(inputAmount);
    
    const amounts = await router.getAmountsOut(
      amountIn,
      [fromToken.address, toToken.address]
    );
    
    setEstimatedUsdt(ethers.utils.formatUnits(amounts[1], 18));
  } catch (error) {
    console.error('Quote error:', error);
    setEstimatedUsdt('0');
  } finally {
    setQuoteLoading(false);
  }
};

// Execute swap
const executeSwap = async () => {
  if (!bnbAmount || isNaN(bnbAmount)) {
    Alert.alert('Error', 'Please enter a valid amount');
    return;
  }

  setLoading(true);
  try {
    const router = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, signer);
    
    // Calculate minimum output amount (with 5% slippage)
    const amountIn = ethers.utils.parseEther(bnbAmount);
    const amounts = await router.getAmountsOut(
      amountIn,
      [fromToken.address, toToken.address]
    );
    const minOut = amounts[1].mul(95).div(100); // 5% slippage
    
    // Execute swap
    const deadline = Math.floor(Date.now() / 1000) + 300; // 5 minutes
    const tx = await router.swapExactETHForTokens(
      minOut,
      [fromToken.address, toToken.address],
      userAddress,
      deadline,
      {
        value: amountIn,
        gasLimit: 300000
      }
    );
    
    await tx.wait();
    Alert.alert('Success', 'Swap completed successfully!');
    
    // Update balances
    await updateBalances(userAddress, provider);
  } catch (error) {
    Alert.alert('Error', 'Swap failed: ' + error.message);
    console.error(error);
  } finally {
    setLoading(false);
  }
};

// Initialize wallet on component mount
useEffect(() => {
  initializeWallet();
}, []);

// Update quote when input changes
useEffect(() => {
  const debounceTimer = setTimeout(() => {
    if (bnbAmount) getQuote(bnbAmount);
  }, 500);

  return () => clearTimeout(debounceTimer);
}, [bnbAmount]);

if (!walletConnected) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2196F3" />
      <Text>Connecting to wallet...</Text>
    </View>
  );
}
const navigation=useNavigation();
const tokenHande=()=>{
  setBnbAmount('');
  setFromToken(fromToken);
  setToToken(toToken);
}
  return (
    <View style={[styles.container,{backgroundColor:state?.THEME?.THEME===false?"#fff":"black"}]}>
      <Wallet_screen_header title="Swap" onLeftIconPress={() => {navigation.navigate("Home")}} />

      <View style={[styles.swapCard,{backgroundColor:state?.THEME?.THEME===false?"#ebebeb":"#171616"}]}>
        <Text style={styles.labelText}>From</Text>
        <View style={[styles.tokenCard,{backgroundColor:state?.THEME?.THEME===false?"#f5f5f5":"black"}]}>
          <View style={styles.tokenInfo}>
            <Image
              source={{ uri: fromToken.logoUri }}
              style={styles.tokenIcon}
            />
            <Text style={[styles.tokenSymbol,{color:state?.THEME?.THEME===false?"black":"#fff"}]}>{fromToken.symbol}</Text>
          </View>
          <Text style={styles.balanceText}>Balance: {fromToken.symbol==="USDT"?parseFloat(usdtBalance).toFixed(6):parseFloat(bnbBalance).toFixed(6)}</Text>
        </View>
        
        <View style={[styles.amountInput,{backgroundColor:state?.THEME?.THEME===false?"#f5f5f5":"black"}]}>
          <TextInput
            style={[styles.input,{color:state?.THEME?.THEME===false?"black":"#fff"}]}
            value={bnbAmount}
            onChangeText={setBnbAmount}
            keyboardType="decimal-pad"
            placeholder="0.000"
            placeholderTextColor="#666"
            returnKeyType="done"
          />
        </View>


        <View style={[styles.swapButton,{flexDirection:"row",justifyContent:"center",alignItems:"center"}]}>
        <View style={[styles.divider]} />
          <TouchableOpacity style={styles.swapButtonCircle} onPress={()=>{tokenHande()}}>
          <Icon
            name={"swap-vertical"}
            size={23}
            color={"#3574B6"}
          />
          </TouchableOpacity>
        <View style={[styles.divider]} />
         </View>

        <Text style={styles.labelText}>To</Text>
        <View style={[styles.tokenCard,{backgroundColor:state?.THEME?.THEME===false?"#f5f5f5":"black"}]}>
          <View style={styles.tokenInfo}>
            <Image
              source={{ uri: toToken.logoUri }}
              style={styles.tokenIcon}
            />
            <Text style={[styles.tokenSymbol,{color:state?.THEME?.THEME===false?"black":"#fff"}]}>{toToken.symbol}</Text>
          </View>
          <Text style={styles.balanceText}>Balance: {toToken.symbol==="USDT"?parseFloat(usdtBalance).toFixed(6):parseFloat(bnbBalance).toFixed(6)}</Text>
        </View>

        <View style={[styles.amountOutput,{backgroundColor:state?.THEME?.THEME===false?"#f5f5f5":"black"}]}>
        <Text style={styles.outputAmount}>≈</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Text style={styles.outputAmount}>
            {quoteLoading ? '...' : estimatedUsdt}
          </Text>
          </ScrollView>
          <Text style={styles.outputAmount}> {toToken.symbol}</Text>
        </View>

        {showQuoteDetails && (
          <View style={[styles.quoteDetails,{backgroundColor:state?.THEME?.THEME===false?"#f5f5f5":"black"}]}>
            <Text style={[styles.quoteTitle,{color:state?.THEME?.THEME===false?"black":"#fff"}]}>Quote Details</Text>
            <View style={styles.quoteRow}>
              <Text style={styles.quoteLabel}>Rate</Text>
              <Text style={[styles.quoteValue,{color:state?.THEME?.THEME===false?"black":"#fff"}]}>1 WBNB = {parseFloat(estimatedUsdt).toFixed(6)} {toToken.symbol}</Text>
            </View>
            <View style={styles.quoteRow}>
              <Text style={styles.quoteLabel}>Fee Tier</Text>
              <Text style={[styles.quoteValue,{color:state?.THEME?.THEME===false?"black":"#fff"}]}>0.3%</Text>
            </View>
            <View style={styles.quoteRow}>
              <Text style={styles.quoteLabel}>Minimum Received</Text>
              <Text style={[styles.quoteValue,{color:state?.THEME?.THEME===false?"black":"#fff"}]}>{(parseFloat(estimatedUsdt) * 0.95).toFixed(6)} {toToken.symbol}</Text>
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.swapButton, (!bnbAmount || loading|| bnbBalance<=bnbAmount ||!parseFloat(bnbAmount)) ? styles.disabledButton: styles.enableButton]}
          onPress={executeSwap}
          disabled={!bnbAmount || loading || bnbBalance<=bnbAmount || !parseFloat(bnbAmount)}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Swapping...' : bnbAmount<=bnbBalance?"Swap":'Insufficient Balance'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 24,
  },
  swapCard: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    margin: 20,
    borderRadius: 20,
  },
  labelText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  tokenCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tokenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
    borderRadius: 12,
  },
  tokenSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  balanceText: {
    color: '#666',
  },
  amountInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
  },
  input: {
    fontSize: 24,
    padding: 15,
  },
  switchContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  switchButton: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  switchIcon: {
    fontSize: 20,
    color: '#3574B6',
  },
  amountOutput: {
    flexDirection:"row",
    justifyContent:"space-evenly",
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  outputAmount: {
    fontSize: 24,
    color: '#666',
    // padding: 12,
    borderRadius: 8,
  },
  quoteDetails: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  quoteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  quoteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  quoteLabel: {
    color: '#666',
  },
  quoteValue: {
    fontWeight: '500',
  },
  swapButton: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#666',
  },
  enableButton:{
    backgroundColor:"green"
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    height: 2,
    width:"45%",
    backgroundColor: '#c7c5c5',
    marginHorizontal:5
  },
  swapButtonCircle:{
    borderColor:"#3574B6",
    borderWidth:2,
    borderRadius:100,
    padding:5
  },
});

export default BnbSwap;