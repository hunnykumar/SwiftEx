import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Button, TextInput, StyleSheet, FlatList, Image, Alert, RefreshControl, TouchableOpacity, ActivityIndicator, Modal, Animated, Dimensions, TouchableWithoutFeedback, Keyboard } from 'react-native';
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
import Dropdown from './exchange/crypto-exchange-front-end-main/src/components/dropDown';
import IconWithCircle, { CustomIconWithCircle } from '../Screens/iconwithCircle';
import TokenQrCode from './Modals/TokensQrCode';
import { PPOST, proxyRequest } from './exchange/crypto-exchange-front-end-main/src/api';
import { FAB } from 'react-native-paper';
import Icon from '../icon';
import { getTokenBalancesUsingAddress } from './exchange/crypto-exchange-front-end-main/src/utils/getWalletInfo/EtherWalletService';
import CustomInfoProvider from './exchange/crypto-exchange-front-end-main/src/components/CustomInfoProvider';

const { height } = Dimensions.get('window');

const Token_Import = () => {
  const navigation = useNavigation();
  const state = useSelector((state) => state);
  const [tokenInfoList, setTokenInfoList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [newTokenAddress, setNewTokenAddress] = useState('');
  const [showTokenList, setShowTokenList] = useState(true);
  const [QrVisible, setQrVisible] = useState(false);
  const [QrValue, setQrValue] = useState("");
  const [QrName, setQrName] = useState("");
  const [loadingForImport, setLoadingForImport] = useState(null);
  const [checkTokenStatus, setcheckTokenStatus] = useState(false);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);

  const slideAnim = useRef(new Animated.Value(height)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const WALLET_ADDRESS = state.wallet.address;
  const STORAGE_KEY = `tokens_${WALLET_ADDRESS}`;
  const STORAGE_BNB_KEY = `tokens_BNB${WALLET_ADDRESS}`;

  const [selectedToken, setSelectedToken] = useState({
    id: 1,
    name: 'Ethereum',
    image: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
  });

  const [tokenListed, settokenListed] = useState([]);
  const tokensList = [
    {
      id: 1,
      symbol: "USDT",
      network: "ETH",
      imgUrl: "https://tokens.pancakeswap.finance/images/0x55d398326f99059fF775485246999027B3197955.png",
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      status: true
    },
    {
      id: 2,
      symbol: "USDC",
      network: "ETH",
      imgUrl: "https://tokens.pancakeswap.finance/images/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d.png",
      address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      status: true
    },
    {
      id: 3,
      symbol: "UNI",
      network: "ETH",
      imgUrl: "https://tokens.pancakeswap.finance/images/0xBf5140A22578168FD562DCcF235E5D43A02ce9B1.png",
      address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
      status: true
    },
    {
      id: 4,
      symbol: "USDT",
      network: "BNB",
      imgUrl: "https://tokens.pancakeswap.finance/images/0x55d398326f99059fF775485246999027B3197955.png",
      address: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd",
      status: true
    },
  ];

  useEffect(() => {
    if (bottomSheetVisible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [bottomSheetVisible]);

  const handleCloseBottomSheet = () => {
    Keyboard.dismiss();
    setBottomSheetVisible(false);
    setNewTokenAddress('');
  };

  const fetchTokenInfo = async (address) => {
    try {
      if (address && WALLET_ADDRESS) {
        const fetchedTokens = await getTokenBalancesUsingAddress(address, WALLET_ADDRESS, "ETH")
        console.log("walleetREspo--", fetchedTokens)
        if (fetchedTokens.status) {
          return fetchedTokens.tokenInfo[0]
        }
      }
    } catch (error) {
      console.error(`Error fetching token info for ${address}:`, error);
      throw new Error('Invalid token address or failed to fetch data');
    }
  };

  const fetchBNBTokenInfo = async (address) => {
    try {
      if (address && WALLET_ADDRESS) {
        const fetchedTokens = await getTokenBalancesUsingAddress(address, WALLET_ADDRESS, "BSC")
        console.log("walleetREspo--", fetchedTokens)
        if (fetchedTokens.status) {
          return fetchedTokens.tokenInfo[0]
        }
      }
    } catch (error) {
      console.log(`Error fetching token info for ${address}:`, error);
      throw new Error('Invalid token address or failed to fetch data');
    }
  };

  const fetchDefaultAndStoredTokens = async () => {
    setIsLoading(true);
    try {
      const defaultTokenPromises = DEFAULT_TOKENS.map(({ address, img_url, symbol }) =>
        fetchTokenInfo(address, img_url, symbol)
      );
      const defaultTokenData = await Promise.all(defaultTokenPromises);

      const storedAddresses = await AsyncStorage.getItem(STORAGE_KEY);
      const storedTokenAddresses = storedAddresses ? JSON.parse(storedAddresses) : [];

      const storedTokenPromises = storedTokenAddresses.map((address) =>
        fetchTokenInfo(address)
      );
      const storedTokenData = await Promise.all(storedTokenPromises);

      const combinedTokens = [...defaultTokenData, ...storedTokenData];
      const sortedTokens = combinedTokens.sort((a, b) => a.name.localeCompare(b.name));

      setTokenInfoList(sortedTokens);
    } catch (error) {
      console.error('Error fetching tokens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDefaultAndStoredBNBTokens = async () => {
    setIsLoading(true);
    try {
      const defaultTokenPromises = DEFAULT_BNB_TOKENS.map(({ address, img_url, symbol }) =>
        fetchBNBTokenInfo(address, img_url, symbol)
      );
      const defaultTokenData = await Promise.all(defaultTokenPromises);

      const storedAddresses = await AsyncStorage.getItem(STORAGE_BNB_KEY);
      const storedTokenAddresses = storedAddresses ? JSON.parse(storedAddresses) : [];

      const storedTokenPromises = storedTokenAddresses.map((address) =>
        fetchBNBTokenInfo(address)
      );
      const storedTokenData = await Promise.all(storedTokenPromises);

      const combinedTokens = [...defaultTokenData, ...storedTokenData];
      const sortedTokens = combinedTokens.sort((a, b) => a.name.localeCompare(b.name));

      setTokenInfoList(sortedTokens);
    } catch (error) {
      console.error('Error fetching tokens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToken = async () => {
    if (!newTokenAddress) {
      setNewTokenAddress('');
      setLoadingForImport(null);
      CustomInfoProvider.show('error', 'Please enter a token contract address.');
      return;
    }

    if (!ethers.utils.isAddress(newTokenAddress)) {
      setNewTokenAddress('');
      setLoadingForImport(null);
      CustomInfoProvider.show('error', 'Invalid Ethereum address.');
      return;
    }

    if (tokenInfoList.some((token) => token.address === newTokenAddress)) {
      setNewTokenAddress('');
      setLoadingForImport(null);
      CustomInfoProvider.show('error', 'Token already added.');
      return;
    }

    setIsLoading(true);
    try {
      const newToken = await fetchTokenInfo(newTokenAddress);
      const updatedTokens = [...tokenInfoList, newToken].sort((a, b) => a.name.localeCompare(b.name));
      setTokenInfoList(updatedTokens);

      const storedAddresses = await AsyncStorage.getItem(STORAGE_KEY);
      const tokenAddresses = storedAddresses ? JSON.parse(storedAddresses) : [];
      const updatedAddresses = Array.from(new Set([...tokenAddresses, newTokenAddress]));
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAddresses));

      setNewTokenAddress('');
      setLoadingForImport(null);
      await checkAddedList();
      CustomInfoProvider.show("Info", "Token Adding completed.")
      handleCloseBottomSheet();
      setIsLoading(false);
    } catch (error) {
      CustomInfoProvider.show('error', 'Please check the token address.');
      console.log("-----", error)
      setLoadingForImport(null);
      setNewTokenAddress('');
      setIsLoading(false);
    } finally {
      setLoadingForImport(null);
      setIsLoading(false);
    }
  };

  const handleAddBNBToken = async () => {
    if (!newTokenAddress || newTokenAddress.length !== 42) {
      setNewTokenAddress('');
      setLoadingForImport(null);
      CustomInfoProvider.show('error', 'Please enter a valid token contract address.');
      return;
    }

    if (!ethers.utils.isAddress(newTokenAddress)) {
      setNewTokenAddress('');
      setLoadingForImport(null);
      CustomInfoProvider.show('error', 'Invalid Binance address.');
      return;
    }

    if (tokenInfoList.some((token) => token.address === newTokenAddress)) {
      setNewTokenAddress('');
      setLoadingForImport(null);
      CustomInfoProvider.show('error', 'Token already added.');
      return;
    }

    setIsLoading(true);
    try {
      const newToken = await fetchBNBTokenInfo(newTokenAddress);
      const updatedTokens = [...tokenInfoList, newToken].sort((a, b) => a.name.localeCompare(b.name));
      setTokenInfoList(updatedTokens);

      const storedAddresses = await AsyncStorage.getItem(STORAGE_BNB_KEY);
      const tokenAddresses = storedAddresses ? JSON.parse(storedAddresses) : [];
      const updatedAddresses = Array.from(new Set([...tokenAddresses, newTokenAddress]));
      await AsyncStorage.setItem(STORAGE_BNB_KEY, JSON.stringify(updatedAddresses));

      setNewTokenAddress('');
      await checkAddedList();
      CustomInfoProvider.show("Info", "Token Adding completed.")
      handleCloseBottomSheet();
      setLoadingForImport(null);
      setIsLoading(false);
    } catch (error) {
      CustomInfoProvider.show('error', 'Please check the token address.');
      setLoadingForImport(null);
      setNewTokenAddress('');
      setIsLoading(false);
    } finally {
      setLoadingForImport(null);
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (selectedToken.name === "Ethereum") {
      await fetchDefaultAndStoredTokens();
    }
    else {
      await fetchDefaultAndStoredBNBTokens();
    }
    setRefreshing(false);
  };

  useEffect(() => {
    if (selectedToken.name === "Ethereum") {
      fetchDefaultAndStoredTokens();
    }
    else {
      fetchDefaultAndStoredBNBTokens();
    }
  }, [WALLET_ADDRESS, selectedToken]);

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

  const handleERCImport = async (address, network) => {
    if (network === "ETH") {
      await handleAddToken(address)
    } else {
      await handleAddBNBToken(address)
    }
  }

  const checkAddedList = async () => {
    try {
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
      CustomInfoProvider.show("info", "Unable to get tokens Info...");
      console.log("Error reading Wallets tokens from storage:", e);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: state.THEME.THEME === false ? "#fff" : "#1B1B1C" }]}>
      <FlatList
        data={checkTokenStatus ? [] : tokenListed}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshing={checkTokenStatus}
        onRefresh={() => {
          checkAddedList();
        }}
        ListEmptyComponent={<Text style={[styles.gettingInfo, { color: state.THEME.THEME ? "#fff" : "black" }]}>Wait Collecting token details...</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity disabled={item.status || loadingForImport !== null} style={[styles.itemContainer, { backgroundColor: state.THEME.THEME ? "#23262F99" : "#F4F4F8" }]} onPress={() => { setLoadingForImport(item.id), handleERCImport(item.address, item.network) }}>
            <Image source={{ uri: item.imgUrl }} style={styles.image} />
            <View style={styles.textContainer}>
              <Text style={[styles.name, { color: state.THEME.THEME ? "#fff" : "black" }]}>{item.symbol}</Text>
              <Text style={styles.subname}>{item.network}</Text>
            </View>
            {loadingForImport === item.id && <ActivityIndicator color={"green"} size={"small"} />}
            {item.status && <Icon name={"check-circle"} type={"materialCommunity"} size={28} color={"#40BF6A"} style={{ paddingHorizontal: "3%" }} />}
          </TouchableOpacity>
        )}
      />

      <View style={styles.fabContainer}>
        <TouchableOpacity 
          style={[styles.customFab]}
          onPress={() => {
            setBottomSheetVisible(true);
          }}
        >
          <Icon name="plus" type="materialCommunity" size={28} color={"#fff"} />
          <Text style={{fontSize:16,color:"#fff",fontWeight:"600"}}>New Token</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={bottomSheetVisible}
        transparent
        animationType="none"
        onRequestClose={handleCloseBottomSheet}
      >
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback onPress={handleCloseBottomSheet}>
            <Animated.View
              style={[
                styles.backdrop,
                {
                  opacity: backdropOpacity,
                },
              ]}
            />
          </TouchableWithoutFeedback>

          <Animated.View
            style={[
              styles.bottomSheet,
              {
                backgroundColor: state.THEME.THEME ? '#242426' : '#F4F4F8',
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.handleBar}>
              <View style={[styles.handle, { backgroundColor: state.THEME.THEME ? '#404040' : '#E0E0E0' }]} />
            </View>

            <TouchableOpacity style={[styles.closeButton,{backgroundColor:state.THEME.THEME ?'#1B1B1C':'#FFFFFF'}]} onPress={handleCloseBottomSheet}>
              <Icon name="close" type="materialCommunity" size={30} color={state.THEME.THEME ?'#FFFFFF':'#1B1B1C'} />
            </TouchableOpacity>

            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={[styles.title, { color: state.THEME.THEME ? '#FFFFFF' : '#000000' }]}>
                  Add Custom Token
                </Text>
              </View>

              <Text style={[styles.subtitle, { color: state.THEME.THEME ? '#A0A0A0' : '#666666' }]}>
                Import your favorite tokens to track them
              </Text>

              <View style={styles.infoBox}>
                <Icon
                  name="information-outline"
                  type="materialCommunity"
                  size={18}
                  color="#ECB742"
                  style={styles.infoIcon}
                />
                <Text style={styles.infoText}>
                  Make sure to verify the contract address before adding.
                </Text>
              </View>

              <View style={[styles.section,{backgroundColor:state.THEME.THEME?"#1B1B1C":"#FFFFFF",}]}>
                <Text style={[styles.label, { color: state.THEME.THEME ? '#E0E0E0' : '#333333' }]}>
                  Select Network
                </Text>
                <View style={styles.networkContainer}>
                  <TouchableOpacity
                    style={[
                      styles.networkCard,
                      {
                        backgroundColor: selectedToken.name === 'Ethereum'
                          ? '#4052D6'
                          : state.THEME.THEME ? '#242426' : '#F4F4F8'
                      },
                    ]}
                    onPress={() => setSelectedToken({
                      id: 1,
                      name: 'Ethereum',
                      image: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
                    })}
                    activeOpacity={0.7}
                  >
                    <View style={styles.networkIconContainer}>
                      <Image
                        source={{ uri: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png' }}
                        style={styles.networkIcon}
                      />
                    </View>
                    <View style={{alignItems:"flex-start",justifyContent:"center"}}>
                      <Text
                        style={[styles.networkName,{color: selectedToken.name === 'Ethereum'?'#fff': state.THEME.THEME ? '#fff' : '#000'}]}>
                        Ethereum
                      </Text>
                      <Text
                        style={[styles.networkSubtext,{color: selectedToken.name === 'Ethereum'? '#fff': state.THEME.THEME ? '#fff' : '#888'}]}>ERC-20</Text>
                   </View>
                    {selectedToken.name === 'Ethereum' && (
                      <View style={styles.checkIconContainer}>
                        <Icon name="check-circle" type="materialCommunity" size={20} color="#F3BA2F" />
                      </View>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                     style={[
                      styles.networkCard,
                      {
                        backgroundColor: selectedToken.name === 'Binance'
                          ? '#4052D6'
                          : state.THEME.THEME ? '#242426' : '#F4F4F8'
                      },
                    ]}
                    onPress={() => setSelectedToken({
                      id: 2,
                      name: 'Binance',
                      image: 'https://tokens.pancakeswap.finance/images/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c.png'
                    })}
                    activeOpacity={0.7}
                  >
                    <View style={styles.networkIconContainer}>
                      <Image
                        source={{ uri: 'https://tokens.pancakeswap.finance/images/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c.png' }}
                        style={styles.networkIcon}
                      />
                    </View>
                    <View style={{alignItems:"flex-start",justifyContent:"center"}}>
                      <Text
                        style={[styles.networkName,{color: selectedToken.name === 'Binance'?'#fff': state.THEME.THEME ? '#fff' : '#000'}]}>
                        BNB Chain
                      </Text>
                      <Text
                        style={[styles.networkSubtext,{color: selectedToken.name === 'Binance'? '#fff': state.THEME.THEME ? '#fff' : '#888'}]}>BEP-20</Text>
                   </View>
                    {selectedToken.name === 'Binance' && (
                      <View style={styles.checkIconContainer}>
                        <Icon name="check-circle" type="materialCommunity" size={20} color="#F3BA2F" />
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.section,{backgroundColor:state.THEME.THEME?"#1B1B1C":"#FFFFFF",}]}>
                <View style={[styles.inputContainer]}>
                  <TextInput
                    style={[
                      styles.input,
                      { color: state.THEME.THEME ? '#FFFFFF' : '#000000' },
                    ]}
                    placeholder="0x..."
                    placeholderTextColor={state.THEME.THEME ? '#666666' : '#999999'}
                    value={newTokenAddress}
                    onChangeText={setNewTokenAddress}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity style={styles.pasteButton} onPress={() => { Paste(setNewTokenAddress) }}>
                    <Text style={styles.pasteText}>Paste</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                disabled={!newTokenAddress || isLoading}
                style={[
                  styles.addButton,
                  {
                    backgroundColor: !newTokenAddress
                      ? state.THEME.THEME
                        ? '#2C2C2C'
                        : '#4052D6'
                      : '#4052D6',
                  },
                ]}
                onPress={() => {
                  Keyboard.dismiss()
                  selectedToken.name === "Ethereum" ? handleAddToken() : handleAddBNBToken()
                }}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                    <Text style={styles.addButtonText}>Continue</Text>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop:hp(1)
  },
  fabContainer: {
    position: 'absolute',
    right: wp(3),
    borderColor: "#2164C1",
    borderWidth: 1,
    bottom:"59%",
    borderRadius: 8,
  },
  customFab: {
    backgroundColor:"#5B65E1",
    minWidth: 56,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 7,
    flexDirection:"row",
    paddingHorizontal:10
  },
  list: {
    marginTop: 1,
    marginHorizontal: 10,
  },
  itemContainer: {
    alignSelf:"center",
    width:"100%",
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingHorizontal:15,
    marginBottom: hp(0.5),
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
  gettingInfo: {
    fontSize: 19,
    textAlign: "center",
    fontWeight: "600",
    marginTop: "53%"
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: hp(3),
    maxHeight: height * 0.85,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
    borderTopColor:"gray",
    borderWidth:1
  },
  handleBar: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 16,
    zIndex: 10,
    padding: 4,
    borderRadius:50,
  },
  content: {
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerIcon: {
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '400',
    flex: 1,
    left:10
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 14,
    lineHeight: 20,
    left:10
  },
  section: {
    marginBottom: 10,
    marginTop:10,
    paddingHorizontal:15,
    borderRadius:19,
    padding:14
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom:5,
    marginTop:-3
  },
  networkContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  networkCard: {
    flex: 1,
    padding: 16,
    flexDirection:"row",
    borderRadius: 16,
    alignContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  networkIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  networkIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  networkName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
    marginLeft:5
  },
  networkSubtext: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft:5
  },
  checkIconContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 10,
    height: hp(5),
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  pasteButton: {
    alignItems: 'center',
    paddingHorizontal: 19,
    paddingVertical: 15,
    borderRadius: 8,
    backgroundColor:"#4052D6"
  },
  pasteText: {
    color: '#fff',
    fontSize: 16,
    textAlign:"center",
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: hp(7),
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    backgroundColor:"#FEF6D8"
  },
  infoIcon: {
    marginRight: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color:"#ECB742"
  },
});

export default Token_Import;