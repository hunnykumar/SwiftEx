

  import React, { useState, useEffect, useCallback } from 'react';
  import { View, Text, Button, TextInput, StyleSheet, FlatList, Image, Alert, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import { ethers } from 'ethers';
  import { RPC } from './constants';
  import { useSelector } from 'react-redux';
  import { Paste } from '../utilities/utilities';
  import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
  } from "react-native-responsive-screen";
import { Wallet_market_loading } from './reusables/Exchange_loading';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Dropdown from './exchange/crypto-exchange-front-end-main/src/components/dropDown';
import IconWithCircle, { CustomIconWithCircle } from '../Screens/iconwithCircle';
import RecieveAddress from './Modals/ReceiveAddress';
import TokenQrCode from './Modals/TokensQrCode';
import { FAB } from 'react-native-paper';
import Icon from '../icon';
import tokensList from "../Dashboard/tokens/TokenListForImport.json"

  const ERC20_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function balanceOf(address owner) view returns (uint256)"
  ];

  const ERC20_BNB_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function name() view returns (string)",
    "function decimals() view returns (uint8)"
  ];
  
  const Token_Import = () => {
    const navigation=useNavigation();
    const state = useSelector((state) => state);
    const [tokenInfoList, setTokenInfoList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [newTokenAddress, setNewTokenAddress] = useState('');
    const [showTokenList, setShowTokenList] = useState(true); // Toggle state for token list view
    const [QrVisible,setQrVisible]=useState(false);
    const [QrValue,setQrValue]=useState("");
    const [QrName,setQrName]=useState("");
    const [loadingForImport, setLoadingForImport] = useState(null);
    const [checkTokenStatus, setcheckTokenStatus] = useState(false);

    
    const WALLET_ADDRESS = state.wallet.address; 
    const provider = new ethers.providers.JsonRpcProvider(RPC.ETHRPC);
    const providerBNB = new ethers.providers.JsonRpcProvider(RPC.BSCRPC2);

  
    const STORAGE_KEY = `tokens_${WALLET_ADDRESS}`;
    const STORAGE_BNB_KEY = `tokens_BNB${WALLET_ADDRESS}`;
    
    const [selectedToken, setSelectedToken] = useState({
      id: 1,
      name: 'Ethereum',
      image: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    });
  
    const [tokenListed, settokenListed] = useState([]);
    
    // Fetch token details
    const fetchTokenInfo = async (address, img_url = '', symbol = '') => {
      try {
        const tokenContract = new ethers.Contract(address, ERC20_ABI, provider);
        const [name, fetchedSymbol, decimals, balance] = await Promise.all([
          tokenContract.name(),
          tokenContract.symbol(),
          tokenContract.decimals(),
          tokenContract.balanceOf(WALLET_ADDRESS)
        ]);
        const formattedBalance = ethers.utils.formatUnits(balance, decimals);
        return { 
          name, 
          symbol: fetchedSymbol || symbol, 
          balance: formattedBalance, 
          address, 
          img_url: img_url
        };
      } catch (error) {
        console.error(`Error fetching token info for ${address}:`, error);
        throw new Error('Invalid token address or failed to fetch data');
      }
    };

    // Fetch BNB token details
    const fetchBNBTokenInfo = async (address, img_url = '', symbol = '') => {
      try {
        const tokenContract = new ethers.Contract(address, ERC20_BNB_ABI, providerBNB);  
        const [name, decimals, balance] = await Promise.all([
          tokenContract.name(),
          tokenContract.decimals(),
          tokenContract.balanceOf(WALLET_ADDRESS)
        ]);
        const formattedBalance = ethers.utils.formatUnits(balance, decimals);
        return { 
          name,  
          balance: formattedBalance, 
          address, 
          img_url: img_url
        };
      } catch (error) {
        console.error(`Error fetching token info for ${address}:`, error);
        throw new Error('Invalid token address or failed to fetch data');
      }
    };
  
  
    // Add new token
    const handleAddToken = async (newTokenAddress) => {
      if (!newTokenAddress) {
        setNewTokenAddress('');
        setLoadingForImport(null);
        Alert.alert('Error', 'Please enter a token contract address.');
        return;
      }
  
      if (!ethers.utils.isAddress(newTokenAddress)) {
        setNewTokenAddress('');
        setLoadingForImport(null);
        Alert.alert('Error', 'Invalid Ethereum address.');
        return;
      }
  
      if (tokenInfoList.some((token) => token.address === newTokenAddress)) {
        setNewTokenAddress('');
        setLoadingForImport(null);
        Alert.alert('Error', 'Token already added.');
        return;
      }
      
      setIsLoading(true);
      try {
        // Fetch token info and update UI
        const newToken = await fetchTokenInfo(newTokenAddress);
        const updatedTokens = [...tokenInfoList, newToken].sort((a, b) => a.name.localeCompare(b.name));
        setTokenInfoList(updatedTokens);
  
        // Update AsyncStorage
        const storedAddresses = await AsyncStorage.getItem(STORAGE_KEY);
        const tokenAddresses = storedAddresses ? JSON.parse(storedAddresses) : [];
        const updatedAddresses = Array.from(new Set([...tokenAddresses, newTokenAddress])); // Avoid duplicates
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAddresses));
  
        setNewTokenAddress('');
        setLoadingForImport(null);
        await checkAddedList();
        Alert.alert("Info","Token Adding completed.")
        setIsLoading(false);
      } catch (error) {
        Alert.alert('Error', 'Please check the token address.');
        console.log("-----",error)
        setLoadingForImport(null);
        setNewTokenAddress('');
        setIsLoading(false);
      } finally {
        setLoadingForImport(null);
        setIsLoading(false);
      }
    };

    // Add BNB Token
    const handleAddBNBToken = async (newTokenAddress) => {
      if (!newTokenAddress||newTokenAddress.length !== 42) {
        setNewTokenAddress('');
        setLoadingForImport(null);
        Alert.alert('Error', 'Please enter a valid token contract address.');
        return;
      }
  
      if (!ethers.utils.isAddress(newTokenAddress)) {
        setNewTokenAddress('');
        setLoadingForImport(null);
        Alert.alert('Error', 'Invalid Binance address.');
        return;
      }
  
      if (tokenInfoList.some((token) => token.address === newTokenAddress)) {
        setNewTokenAddress('');
        setLoadingForImport(null);
        Alert.alert('Error', 'Token already added.');
        return;
      }
      
      setIsLoading(true);
      try {
        // Fetch token info and update UI
        const newToken = await fetchBNBTokenInfo(newTokenAddress);
        const updatedTokens = [...tokenInfoList, newToken].sort((a, b) => a.name.localeCompare(b.name));
        setTokenInfoList(updatedTokens);
  
        // Update AsyncStorage
        const storedAddresses = await AsyncStorage.getItem(STORAGE_BNB_KEY);
        const tokenAddresses = storedAddresses ? JSON.parse(storedAddresses) : [];
        const updatedAddresses = Array.from(new Set([...tokenAddresses, newTokenAddress])); // Avoid duplicates
        await AsyncStorage.setItem(STORAGE_BNB_KEY, JSON.stringify(updatedAddresses));
  
        setNewTokenAddress('');
        await checkAddedList();
        Alert.alert("Info","Token Adding completed.")
        setLoadingForImport(null);
        setIsLoading(false);
      } catch (error) {
        Alert.alert('Error', 'Please check the token address.');
        setLoadingForImport(null);
        setNewTokenAddress('');
        setIsLoading(false);
      } finally {
        setLoadingForImport(null);
        setIsLoading(false);
      }
    };

    useFocusEffect(
      useCallback(() => {
        setcheckTokenStatus(true);
        checkAddedList();
        setLoadingForImport(null);
        setShowTokenList(true);
        setNewTokenAddress("");
        return () => setShowTokenList(true);
      }, [])
    );
  
    const handleERCImport=async(address,network)=>{
      if(network==="ETH")
      {
       await handleAddToken(address)
      }else{
       await handleAddBNBToken(address)
      }
    }

    const checkAddedList = async () => {
      try {
        // Storage keys
        const storedEthToken = await AsyncStorage.getItem(STORAGE_KEY);
        const storedBnbToken = await AsyncStorage.getItem(STORAGE_BNB_KEY);
        const ethTokens = storedEthToken ? JSON.parse(storedEthToken) : [];
        const bnbTokens = storedBnbToken ? JSON.parse(storedBnbToken) : [];
        const margeTokens = [...ethTokens, ...bnbTokens];

        const updatedTokenListed = tokensList.map(item => {
          const findedValue = margeTokens.includes(item.address);
          return {
            ...item,
            status: findedValue ? true : item.status
          };
        })
        settokenListed(updatedTokenListed);
        setcheckTokenStatus(false);
      } catch (e) {
        Alert.alert("info","Unable to get tokens Info...");
        console.log("Error reading Wallets tokens from storage:", e);
      }
    }

    return (
      <View style={[styles.container,{backgroundColor:state.THEME.THEME===false?"#fff":"black"}]}>
        {showTokenList ? (
          <View style={{height:"50%"}}>
            <FlatList
              data={checkTokenStatus?[]:tokenListed}
              keyExtractor={(item) => item.id}
              style={styles.list}
              refreshing={checkTokenStatus}
              onRefresh={()=>{
                checkAddedList();
              }}
              ListEmptyComponent={<Text style={[styles.gettingInfo,{color: state.THEME.THEME ? "#fff" : "black"}]}>Wait Collecting token details...</Text>}
              renderItem={({ item,index }) => (
                <TouchableOpacity disabled={item.status || loadingForImport !== null} style={[styles.itemContainer, { backgroundColor: state.THEME.THEME ? "#23262F99" : "#ebe8e8" }]} onPress={() => { setLoadingForImport(index), handleERCImport(item.address, item.network) }}>
                  <Image source={{ uri: item.logoURI }} style={styles.image} />
                  <View style={styles.textContainer}>
                    <Text style={[styles.name, { color: state.THEME.THEME ? "#fff" : "black" }]}>{item.symbol}</Text>
                    <Text style={styles.subname}>{item.network}</Text>
                  </View>
                  {loadingForImport === index && <ActivityIndicator color={"green"} size={"small"} />}
                  {item.status && <Icon name={"check-decagram"} type={"materialCommunity"} size={26} color={"green"} style={{ paddingHorizontal: "3%" }} />}
                </TouchableOpacity>
              )}
            />
          </View>
        ) : (
          <>
            <Text style={[styles.watchlistCon.watchlistConHeading,{color:state.THEME.THEME===false?"black":"#fff"}]}>Your Tracked Tokens</Text>
              <Dropdown
                theme={state.THEME.THEME}
                selectedToken={selectedToken}
                onSelectToken={setSelectedToken}
              />
            <View style={styles.addTokenContainer}>
              <TextInput
                style={[styles.input,{backgroundColor:state.THEME.THEME===false?"#fff":"black",color:state.THEME.THEME===false?"black":"#fff"}]}
                placeholder="Contract Address"
                placeholderTextColor={"gray"}
                editable={false}
                value={newTokenAddress}
                onChangeText={setNewTokenAddress}
              />
               <TouchableOpacity onPress={()=>{Paste(setNewTokenAddress)}}>
          <Text style={{color: "blue"}}>PASTE</Text>
        </TouchableOpacity>
            </View>
              <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
                <TouchableOpacity disabled={!newTokenAddress} style={[styles.Add_asset_btn, { justifyContent: "center", backgroundColor: !newTokenAddress ? "gray" : "green" }]} onPress={() => { selectedToken.name==="Ethereum"?handleAddToken(newTokenAddress):handleAddBNBToken(newTokenAddress) }}>
                 {isLoading?<ActivityIndicator color='#fff'/>:<Text style={[styles.text, { color: state.THEME.THEME === false ? "#fff" : "#fff" }]}>Add Asset</Text>}
                </TouchableOpacity>
                {/* <TouchableOpacity style={[styles.Add_asset_btn, { justifyContent: "center", backgroundColor: "green" }]} onPress={() => { setShowTokenList(true) }}>
                  <Text style={[styles.text, { color: state.THEME.THEME === false ? "#fff" : "#fff" }]}>View</Text>
                </TouchableOpacity> */}
              </View>
          </>
        )}
        <FAB
        icon={showTokenList ? 'plus' : 'arrow-right'}
        style={[styles.fab, { backgroundColor: state.THEME.THEME ? "#23262F99" : "#F4F4F4" }]}
        onPress={()=>{setShowTokenList(showTokenList?false:true)}}
        color='#2164C1'
      />
        <View style={{ width: wp(100), height: hp(1) }}>
          <TokenQrCode
            modalVisible={QrVisible}
            setModalVisible={setQrVisible}
            iconType={QrName}
            qrvalue={QrValue}
            isDark={state.THEME.THEME}
          />
        </View>

      </View>
    );
  };
  
  // Styles
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 11,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },
    addTokenContainer: {
      height: hp(8),
      flexDirection: 'row',
      borderWidth: 1,
      borderRadius: 10,
      marginBottom: 20,
      paddingHorizontal:13,
      paddingVertical:17,
      justifyContent: 'space-between',
      alignItems: 'center',
      borderColor: '#4CA6EA',
    },
    input: {
      height:hp(7),
      flex: 1,
      marginRight: 10,
      fontSize:19,
    },
    tokenCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 13,
      borderWidth: 1,
      borderColor: '#4CA6EA',
      borderRadius: 8,
      marginBottom: 10,
    },
    tokenImage: {
      width: 50,
      height: 50,
      marginRight: 10,
    },
    tokenName: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    backButton: {
      width:wp(40),
      height:hp(6),
      marginTop:hp(3),
      borderColor: "#4CA6EA",
      borderWidth:1,
      borderRadius:10,
      flexDirection:"row",
      alignItems:"center",
      alignSelf: "flex-end",
      justifyContent: "center",
      marginRight: wp(-1),
      marginTop: hp(1),
    },
    viewButton: {
      marginTop: 20,
    },
    Add_asset_btn:{
      width:wp(95),
      height:hp(8),
      marginTop:hp(1),
      borderColor: "#4CA6EA",
      borderWidth:1,
      borderRadius:10,
      flexDirection:"row",
      justifyContent:"space-between",
      alignItems:"center"
    },
    text: {
      fontSize: 19,
      fontWeight:"600",
      textAlign: "center",
      margin: hp(0),
    },
    watchlistCon: {
      backgroundColor: "rgba(244, 244, 244, 1)",
      width: "100%",
      height: "100%",
      paddingVertical: 10,
      paddingHorizontal:20,
      watchlistConHeading: {
        fontSize: 18,
        fontWeight: "600",
        color: "#FFFFFF",
        paddingBottom:12
      }
    },
    fab: {
      position: 'absolute',
      left: 15,
      borderColor: "#2164C1",
      borderWidth: 1,
      bottom:"54%"
    },
    list: {
      marginTop: 1,
      marginHorizontal: 10,
    },
    itemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      paddingLeft:14,
      marginBottom: 8,
      borderRadius: 8,
    },
    image: {
      width: 50,
      height: 50,
      marginRight: 12,
      borderRadius: 25,
    },
    textContainer: {
      flex: 1,
    },
    name: {
      fontWeight: 'bold',
      fontSize: 16,
    },
    subname: {
      color: 'gray',
    },
    gettingInfo:{
     fontSize:19,
     textAlign:"center",
     fontWeight:"600",
     marginTop:"53%"
    }
  });
  
  export default Token_Import;
  