  import React, { useState, useEffect, useCallback } from 'react';
  import { View, Text, Button, TextInput, StyleSheet, FlatList, Image, Alert, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import { ethers } from 'ethers';
  import { useSelector } from 'react-redux';
  import { Paste } from '../utilities/utilities';
  import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
  } from "react-native-responsive-screen";
import { Wallet_market_loading } from './reusables/Exchange_loading';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Dropdown from './exchange/crypto-exchange-front-end-main/src/components/Dropdown';
import IconWithCircle, { CustomIconWithCircle } from '../Screens/iconwithCircle';
import TokenQrCode from './Modals/TokensQrCode';
import { PPOST, proxyRequest } from './exchange/crypto-exchange-front-end-main/src/api';
  
  const Token_Import = () => {
    const navigation=useNavigation();
    const state = useSelector((state) => state);
    const [tokenInfoList, setTokenInfoList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [newTokenAddress, setNewTokenAddress] = useState('');
    const [showTokenList, setShowTokenList] = useState(false); // Toggle state for token list view
    const [QrVisible,setQrVisible]=useState(false);
    const [QrValue,setQrValue]=useState("");
    const [QrName,setQrName]=useState("");

    const WALLET_ADDRESS = state.wallet.address; 
  
    const STORAGE_KEY = `tokens_${WALLET_ADDRESS}`;
    const STORAGE_BNB_KEY = `tokens_BNB${WALLET_ADDRESS}`;
    
    const [selectedToken, setSelectedToken] = useState({
      id: 1,
      name: 'Ethereum',
      image: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    });
  
    // Default tokens array
    const DEFAULT_TOKENS = [
      {
          symbol: "USDT",
          img_url: "https://tokens.pancakeswap.finance/images/0x55d398326f99059fF775485246999027B3197955.png",
          address: "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0" 
        },
        {
          symbol: "UNI",
          img_url: "https://tokens.pancakeswap.finance/images/0xBf5140A22578168FD562DCcF235E5D43A02ce9B1.png",
          address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"
        },
        {
          symbol: "USDC",
          img_url: "https://tokens.pancakeswap.finance/images/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d.png", 
          address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"
        }
    ];
    
    // Default BNB Tokens
    const DEFAULT_BNB_TOKENS = [
      {
          symbol: "USDT",
          img_url: "https://tokens.pancakeswap.finance/images/0x55d398326f99059fF775485246999027B3197955.png", 
          address: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd"
        }
    ]
  
  
    // Fetch token details
    const fetchTokenInfo = async (address) => {
      
      try {
        if(address&&WALLET_ADDRESS){
          const {res,err} = await proxyRequest("/v1/eth/token/info", PPOST, {addresses:address,walletAddress:WALLET_ADDRESS});
          return res?.[0];
        }
      } catch (error) {
        console.error(`Error fetching token info for ${address}:`, error);
        throw new Error('Invalid token address or failed to fetch data');
      }
    };

    // Fetch BNB token details
    const fetchBNBTokenInfo = async (address) => {
      try {
        if(address&&WALLET_ADDRESS){
          const {res,err} = await proxyRequest("/v1/bsc/token/info", PPOST, {addresses:address,walletAddress:WALLET_ADDRESS});
          return res?.[0];
        }
      } catch (error) {
        console.log(`Error fetching token info for ${address}:`, error);
        throw new Error('Invalid token address or failed to fetch data');
      }
    };
  
    // Fetch default tokens and stored tokens
    const fetchDefaultAndStoredTokens = async () => {
      setIsLoading(true);
      try {
        // Fetch default tokens
        const defaultTokenPromises = DEFAULT_TOKENS.map(({ address, img_url, symbol }) =>
          fetchTokenInfo(address, img_url, symbol)
        );
        const defaultTokenData = await Promise.all(defaultTokenPromises);
  
        // Fetch stored tokens from AsyncStorage
        const storedAddresses = await AsyncStorage.getItem(STORAGE_KEY);
        const storedTokenAddresses = storedAddresses ? JSON.parse(storedAddresses) : [];
  
        const storedTokenPromises = storedTokenAddresses.map((address) =>
          fetchTokenInfo(address)
        );
        const storedTokenData = await Promise.all(storedTokenPromises);
  
        // Combine and sort tokens
        const combinedTokens = [...defaultTokenData, ...storedTokenData];
        const sortedTokens = combinedTokens.sort((a, b) => a.name.localeCompare(b.name));
  
        setTokenInfoList(sortedTokens);
      } catch (error) {
        console.error('Error fetching tokens:', error);
      } finally {
        setIsLoading(false);
      }
    };
       // Fetch default BNB tokens and stored tokens
       const fetchDefaultAndStoredBNBTokens = async () => {
        setIsLoading(true);
        try {
          // Fetch default tokens
          const defaultTokenPromises = DEFAULT_BNB_TOKENS.map(({ address, img_url, symbol }) =>
            fetchBNBTokenInfo(address, img_url, symbol)
          );
          const defaultTokenData = await Promise.all(defaultTokenPromises);
    
          // Fetch stored tokens from AsyncStorage
          const storedAddresses = await AsyncStorage.getItem(STORAGE_BNB_KEY);
          const storedTokenAddresses = storedAddresses ? JSON.parse(storedAddresses) : [];
    
          const storedTokenPromises = storedTokenAddresses.map((address) =>
            fetchBNBTokenInfo(address)
          );
          const storedTokenData = await Promise.all(storedTokenPromises);
    
          // Combine and sort tokens
          const combinedTokens = [...defaultTokenData, ...storedTokenData];
          const sortedTokens = combinedTokens.sort((a, b) => a.name.localeCompare(b.name));
    
          setTokenInfoList(sortedTokens);
        } catch (error) {
          console.error('Error fetching tokens:', error);
        } finally {
          setIsLoading(false);
        }
      };
  
    // Add new token
    const handleAddToken = async () => {
      if (!newTokenAddress) {
        setNewTokenAddress('');
        Alert.alert('Error', 'Please enter a token contract address.');
        return;
      }
  
      if (!ethers.utils.isAddress(newTokenAddress)) {
        setNewTokenAddress('');
        Alert.alert('Error', 'Invalid Ethereum address.');
        return;
      }
  
      if (tokenInfoList.some((token) => token.address === newTokenAddress)) {
        setNewTokenAddress('');
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
        Alert.alert("Info","Token Adding completed.")
        setIsLoading(false);
      } catch (error) {
        Alert.alert('Error', 'Please check the token address.');
        console.log("-----",error)
        setNewTokenAddress('');
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Add BNB Token
    const handleAddBNBToken = async () => {
      if (!newTokenAddress||newTokenAddress.length !== 42) {
        setNewTokenAddress('');
        Alert.alert('Error', 'Please enter a valid token contract address.');
        return;
      }
  
      if (!ethers.utils.isAddress(newTokenAddress)) {
        setNewTokenAddress('');
        Alert.alert('Error', 'Invalid Binance address.');
        return;
      }
  
      if (tokenInfoList.some((token) => token.address === newTokenAddress)) {
        setNewTokenAddress('');
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
        Alert.alert("Info","Token Adding completed.")
        setIsLoading(false);
      } catch (error) {
        Alert.alert('Error', 'Please check the token address.');
        console.log("-op",error)
        setNewTokenAddress('');
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };


  
    // Refresh token list
    const handleRefresh = async () => {
      setRefreshing(true);
      if(selectedToken.name==="Ethereum")
      {
        await fetchDefaultAndStoredTokens();
      }
      else{
        await fetchDefaultAndStoredBNBTokens();
      }
      setRefreshing(false);
    };
  
    // Fetch token data on component mount
    useEffect(() => {
      if(selectedToken.name==="Ethereum")
        {
          fetchDefaultAndStoredTokens();
        }
        else{
          fetchDefaultAndStoredBNBTokens();
        }
    }, [WALLET_ADDRESS,selectedToken]);
    useFocusEffect(
      useCallback(() => {
        setShowTokenList(false);
        setNewTokenAddress("");
        return () => setShowTokenList(false);
      }, [])
    );
  
    return (
      <View style={[styles.container,{backgroundColor:state.THEME.THEME===false?"#fff":"black"}]}>
        {showTokenList ? (
          <>
            {/* Token List View */}
            {isLoading ? (
              <Wallet_market_loading/>
            ) : (
              <View style={{height:"32%"}}>
              <FlatList
                data={tokenInfoList}
                keyExtractor={(item) => item.address}
                renderItem={({ item }) => (
                  <View style={[styles.tokenCard, { backgroundColor: state.THEME.THEME === false ? "#fff" : "black",alignContent:"center",justifyContent:"space-between" }]}>
                    <View style={{ flexDirection: "row", alignItems: 'center' }}>
                      {item.img_url ?
                        <Image
                          source={{ uri: item.img_url }}
                          style={styles.tokenImage}
                        /> :
                        <LinearGradient
                          colors={['#3b82f6', '#8b5cf6']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[styles.tokenImage, { borderRadius: 30, justifyContent: "center", alignItems: "center" }]}
                        >
                          <Text style={[styles.tokenName, { color: "#fff", fontSize: 28 }]}>{item?.name?.charAt(0)}</Text>
                        </LinearGradient>}
                      <View>
                        <Text style={[styles.tokenName, { color: state.THEME.THEME === false ? "black" : "#fff" }]}>{item?.name} {item?.symbol && "(" + item?.symbol + ")"}</Text>
                        <Text style={{ color: state.THEME.THEME === false ? "black" : "#fff" }}>Balance: {Number(item?.balance).toFixed(4)}</Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: 'center' }}>
                      <CustomIconWithCircle
                        name={"paper-plane-outline"}
                        type={"ionicon"}
                        onPress={() => navigation.navigate("TokenSend",{tokenAddress:item?.address,tokenType:selectedToken})}
                        bgColor={state.THEME.THEME===false?"#F4F4F4":"#23262F99"}
                        width={43}
                        height={43}
                        iconColor={"#2164C1"}
                      />
                      <CustomIconWithCircle
                        name={"qr-code-outline"}
                        type={"ionicon"}
                        onPress={() => {setQrValue(state?.wallet?.address),setQrName(item?.name),setQrVisible(true)}}
                        bgColor={state.THEME.THEME===false?"#F4F4F4":"#23262F99"}
                        width={43}
                        height={43}
                        iconColor={"#2164C1"}
                      />
                    </View>
                  </View>
                )}
                refreshControl={
                  <RefreshControl tintColor={"#4CA6EA"} refreshing={refreshing} onRefresh={handleRefresh} />
                }
              />
              </View>
            )}
            <TouchableOpacity style={[styles.backButton]} onPress={() => { setShowTokenList(false) }}>
              <Text style={[styles.text, {color: state.THEME.THEME === false ? "black" : "#fff" }]}>Back</Text>
            </TouchableOpacity>
          </>
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
                <TouchableOpacity disabled={!newTokenAddress} style={[styles.Add_asset_btn, { justifyContent: "center", backgroundColor: !newTokenAddress ? "gray" : "green" }]} onPress={() => { selectedToken.name==="Ethereum"?handleAddToken():handleAddBNBToken() }}>
                 {isLoading?<ActivityIndicator color='#fff'/>:<Text style={[styles.text, { color: state.THEME.THEME === false ? "#fff" : "#fff" }]}>Add Asset</Text>}
                </TouchableOpacity>
                {/* <TouchableOpacity style={[styles.Add_asset_btn, { justifyContent: "center", backgroundColor: "green" }]} onPress={() => { setShowTokenList(true) }}>
                  <Text style={[styles.text, { color: state.THEME.THEME === false ? "#fff" : "#fff" }]}>View</Text>
                </TouchableOpacity> */}
              </View>
          </>
        )}
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
  });
  
  export default Token_Import;
  