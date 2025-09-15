import { Modal, View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, TextInput, Image, Platform, Keyboard, Alert, BackHandler, TouchableWithoutFeedback, ScrollView } from 'react-native';
import Icon from "../../../../../icon";
import { FlatList } from 'native-base';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import WalletActivationComponent from '../utils/WalletActivationComponent';
import { Exchange_screen_header } from '../../../../reusables/ExchangeHeader';
import { useEffect, useState } from 'react';
import { GetStellarUSDCAvilabelBalance } from '../../../../../utilities/StellarUtils';
import { alert } from '../../../../reusables/Toasts';
const ExportUSDC = () => {
  const Focused = useIsFocused();
  const navigation = useNavigation();
  const state = useSelector((state) => state);
  const [stellarWalletActivated, setstellarWalletActivated] = useState(false);
  const [basicProccesing, setbasicProccesing] = useState(false);
  const [walletBalance, setwalletBalance] = useState('0.00');
  const [selectedNetworkDetils, setselectedNetworkDetils] = useState(null);
  const [selectedAssetDetils, setselectedAssetDetils] = useState({
    name: "USDC",
    image: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
    type:"sendAsset"
  });
  const [selectedReciveNetworkDetils,setselectedReciveNetworkDetils]=useState(null);
  const [selectedReciveAssetDetils,setselectedReciveAssetDetils]=useState(null);
  const [chooseAsset,setchooseAsset]=useState(null);
  const [chooseNetwork,setchooseNetwork]=useState(null);
  const [chooseReciveAsset,setchooseReciveAsset]=useState(null);
  const [chooseReciveNetwork,setchooseReciveNetwork]=useState(null);
  const [amount,setamount] = useState('0.00');


  const sendNetworks = [
    {
      name: "Stellar",
      image: "https://stellar.myfilebase.com/ipfs/QmSTXU2wn1USnmd5ZypA5zMze259wEPSDP3i8wivyr9qiq",
      type:"sendNetworks"
    }
  ];
  const sendAseets = [
    {
      name: "USDC",
      image: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
      type:"sendAsset"
    }
  ];
  const reciveNetwork = [
    {
      name: "Ethereum",
      image: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
      type:"reciveNetwork"
    },
    {
      name: "BNB",
      image: "https://tokens.pancakeswap.finance/images/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c.png",
      type:"reciveNetwork"
    },
  ];
  const reciveAsset = [
    {
      name: "USDT",
      image: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
      type:"reciveAsset"
    },
    {
      name: "USDC",
      image: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
      type:"reciveAsset"
    }
  ];


  useEffect(() => {
    setstellarWalletActivated(false);
    setbasicProccesing(true);
    fetchStellarWalletdetails();
    setwalletBalance("0.00");
    setamount("0.00");
    setselectedNetworkDetils(null);
    setselectedReciveNetworkDetils(null);
    setselectedReciveAssetDetils(null);
    setchooseAsset(null);
    setchooseNetwork(null);
    setchooseReciveAsset(null);
    setchooseReciveNetwork(null);
  }, [Focused])

  const fetchStellarWalletdetails = async () => {
    try {
      if (state.STELLAR_ADDRESS_STATUS === false) {
        setstellarWalletActivated(true);
        setbasicProccesing(false);
      }
      const fetchedUSDCBala = await GetStellarUSDCAvilabelBalance(state && state.STELLAR_PUBLICK_KEY, "USDC", "GALANI4WK6ZICIQXLRSBYNGJMVVH3XTZYFNIVIDZ4QA33GJLSFH2BSID");
      if (fetchedUSDCBala.status) {
        setwalletBalance(fetchedUSDCBala?.availableBalance);
        setbasicProccesing(false);
      }
      else {
        setbasicProccesing(false);
      }
    } catch (error) {
      console.log("Error fetching balance:", error);
    }
  }


  const handleWalletActivationComponent = () => {
    setstellarWalletActivated(false)
    navigation.goBack()
  };

  const handleValueUpdater = (data) => {
    switch (data.type) {
      case "sendNetworks":
        setselectedNetworkDetils(data)
        setchooseNetwork(false)
        break;
      case "sendAsset":
        setselectedAssetDetils(data)
        setchooseAsset(false)
        break;
      case "reciveNetwork":
        setselectedReciveNetworkDetils(data)
        setchooseReciveNetwork(false)
        break;
      case "reciveAsset":
        setselectedReciveAssetDetils(data)
        setchooseReciveAsset(false)
        break;
      default:
        alert("error","Something went wrong.")
        break;
    }
  }

    const chooseRenderItem = ({ item }) => {
      return(
        <TouchableOpacity onPress={() => {handleValueUpdater(item)}} style={styles.chooseItemContainer}>
        <Image style={styles.chooseItemImage} source={{ uri: item.image }} />
        <Text style={styles.chooseItemText}>{item.name}</Text>
      </TouchableOpacity>
      )
    };

   const handleInputChange=async(value)=>{
    setamount(value)
   }

  return (
    <View style={styles.container}>
      <Exchange_screen_header elemetId={"bridge_back"} elemetMenuId={"bridge_menu"} title="Bridge" onLeftIconPress={() => navigation.navigate("/")} onRightIconPress={() => console.log('Pressed')} />
      <WalletActivationComponent
        isVisible={stellarWalletActivated}
        onClose={() => { handleWalletActivationComponent }}
        onActivate={() => { setstellarWalletActivated(false) }}
        navigation={navigation}
        appTheme={true}
        shouldNavigateBack={true}
      />
      <ScrollView style={styles.scrollCon}>
        <Text style={styles.headingText}>Export USDC on Wallet</Text>
        {/* Select network */}
        <TouchableOpacity style={styles.modalOpen} onPress={() => { setchooseNetwork(true); }}>
          <View style={{ flexDirection: "row" }}>
            <Image source={{ uri: !selectedNetworkDetils?sendNetworks[0].image:selectedNetworkDetils.image }} style={styles.iconCon} />
            <Image source={{ uri: !selectedAssetDetils?sendAseets[0].image:selectedAssetDetils.image }} style={styles.iconAssetCon} />
            <View>
              <Text style={styles.networkSubHeading}>Network</Text>
              <Text style={styles.networkHeading}>{!selectedNetworkDetils?sendNetworks[0].name:selectedNetworkDetils.name}</Text>
            </View>
          </View>
          <Icon name={"chevron-right"} type={"materialCommunity"} color={"#fff"} size={30} />
        </TouchableOpacity>

        {/* perfect stellar usdc balance componet */}
        <View style={[styles.modalOpen, { paddingVertical: hp(0.5), }]}>
          <View>
            <Text style={styles.subInputText}>Amount</Text>
            <TextInput maxLength={10} placeholder='0.0' placeholderTextColor={"gray"} keyboardType="number-pad" value={amount} style={[{ width: wp(40), fontSize: 18, color: "#fff", marginTop: hp(0.2) }]} onChangeText={(value) => { handleInputChange(value) }} returnKeyType="done" />
          </View>
          <TouchableOpacity style={styles.maxCon} onPress={() => {
            if (parseFloat(walletBalance) === 0) {
              Alert.alert("Info", "Insuficint Balance.")
              setamount(null)
            } else {
              setamount(walletBalance)
            }
          }}>
            <Text style={styles.maxBtn}>MAX</Text>
          </TouchableOpacity>
        </View>

        {/* stellar address componet */}
        <View style={[styles.modalOpen, { paddingVertical: hp(1.5), }]}>
          <Text style={[styles.subInputText, { marginTop: hp(0) }]}>Address</Text>
          <View style={{ width: "50%" }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: "96%" }}>
              <Text style={{ fontSize: 17, color: "gray" }}>{state && state.STELLAR_PUBLICK_KEY}</Text>
            </ScrollView>
          </View>
        </View>

        {/* perfect usdc balance details fetching componet */}
        <View style={[styles.modalOpen, { paddingVertical: hp(1.5), marginTop: hp(0.5) }]}>
          <Text style={[styles.subInputText, { marginTop: hp(0) }]}>Balance</Text>
          <View style={{ width: "15%" }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: "96%" }}>
              {basicProccesing ? <ActivityIndicator color={"green"} /> : <Text style={{ color: "gray", fontSize: 17 }}>{walletBalance}</Text>}
            </ScrollView>
          </View>
        </View>

        {/* Select recive network */}
        <TouchableOpacity style={styles.modalOpen} onPress={() => { setchooseReciveNetwork(true); }}>
          <View style={{ flexDirection: "row" }}>
            <Image source={{ uri: !selectedReciveNetworkDetils?reciveNetwork[0].image:selectedReciveNetworkDetils.image }} style={styles.iconCon} />
            <View>
              <Text style={styles.networkSubHeading}>Network</Text>
              <Text style={styles.networkHeading}>{!selectedReciveNetworkDetils?reciveNetwork[0].name:selectedReciveNetworkDetils.name}</Text>
            </View>
          </View>
          <Icon name={"chevron-right"} type={"materialCommunity"} color={"#fff"} size={30} />
        </TouchableOpacity>

        {/* Select recive network */}
        <TouchableOpacity style={styles.modalOpen} onPress={() => { setchooseReciveAsset(true); }}>
          <View style={{ flexDirection: "row" }}>
            <Image source={{ uri: !selectedReciveAssetDetils?reciveAsset[0].image:selectedReciveAssetDetils.image }} style={styles.iconCon} />
            <View>
              <Text style={styles.networkSubHeading}>Asset</Text>
              <Text style={styles.networkHeading}>{!selectedReciveAssetDetils?reciveAsset[0].name:selectedReciveAssetDetils.name}</Text>
            </View>
          </View>
          <Icon name={"chevron-right"} type={"materialCommunity"} color={"#fff"} size={30} />
        </TouchableOpacity>

        {/* perfect Quotes details fetching componet
        {getInfo && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066cc" />
            <Text style={styles.loadingText}>Getting best quote...</Text>
          </View>
        )} */}

        {/* perfect Quotes details componet
        {resQuotes !== null && <View style={styles.modalQoutesCon}>
          <Text style={styles.quoteTitle}>Quote Details</Text>
          <View style={[styles.quoteDetailsContainer]}>
            <View style={styles.quoteRow}>
              <Text style={styles.quoteLabel}>Provider</Text>
              <Text style={styles.quoteValue}>Allbridge</Text>
            </View>

            <View style={styles.quoteRow}>
              <Text style={styles.quoteLabel}>Rate</Text>
              <Text style={styles.quoteValue}>
                1 USDT = {resQuotes.conversionRate} USDC
              </Text>
            </View>

            <View style={styles.quoteRow}>
              <Text style={styles.quoteLabel}>Slippage</Text>
              <Text style={styles.quoteValue}>
                {resQuotes.slippageTolerance}%
              </Text>
            </View>

            <View style={styles.quoteRow}>
              <Text style={styles.quoteLabel}>Minimum Received</Text>
              <View style={{ width: wp(25), flexDirection: 'row' }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <Text style={styles.quoteValue}>{resQuotes.minimumAmountOut}</Text>
                </ScrollView>
                <Text style={styles.quoteValue}>USDC</Text>
              </View>
            </View>
          </View>
          <View style={styles.quoteTextCon}>
            <Text style={styles.quoteText}>≈</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Text style={styles.quoteText}>{resQuotes.minimumAmountOut}</Text>
            </ScrollView>
            <Text style={styles.quoteText}>USDC</Text>
          </View>
        </View>} */}


        {/* perfect network selection */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={chooseNetwork}
        >
          <TouchableOpacity style={styles.chooseModalContainer} onPress={() => setchooseNetwork(false)}>
            <View style={styles.chooseModalContent}>
              <Text style={{ fontSize: 20, fontWeight: "bold", marginVertical: hp(1), color: "#fff" }}>Select Wallet</Text>
              <FlatList
                data={sendNetworks}
                renderItem={chooseRenderItem}
                keyExtractor={(item,index) => index}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        {/* perfect recive network selection */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={chooseReciveNetwork}
        >
          <TouchableOpacity style={styles.chooseModalContainer} onPress={() => setchooseReciveNetwork(false)}>
            <View style={styles.chooseModalContent}>
              <Text style={{ fontSize: 20, fontWeight: "bold", marginVertical: hp(1), color: "#fff" }}>Choose Network</Text>
              <FlatList
                data={reciveNetwork}
                renderItem={chooseRenderItem}
                keyExtractor={(item,index) => index}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        {/* perfect recive Asset selection */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={chooseReciveAsset}
        >
          <TouchableOpacity style={styles.chooseModalContainer} onPress={() => setchooseReciveAsset(false)}>
            <View style={styles.chooseModalContent}>
              <Text style={{ fontSize: 20, fontWeight: "bold", marginVertical: hp(1), color: "#fff" }}>Choose Asset</Text>
              <FlatList
                data={reciveAsset}
                renderItem={chooseRenderItem}
                keyExtractor={(item,index) => index}
              />
            </View>
          </TouchableOpacity>
        </Modal>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#011434",
    width: wp(100),
    height: hp(100)
  },
  scrollCon: {
    marginBottom: hp(5)
  },
  headingText: {
    marginTop: 10,
    color: "#fff",
    fontSize: 19,
    textAlign: "left",
    paddingLeft: wp(5)
  },
  subInputText: {
    marginTop: hp(1),
    color: "#94A3B8",
    fontSize: 16,
  },
  maxBtn: {
    color: "#FFF",
    fontSize: 16,
  },
  maxCon: {
    backgroundColor: "#2F7DFF",
    borderRadius: 10,
    padding: 8,
    paddingHorizontal: wp(5),
  },
  modalOpen: {
    width: '93%',
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0D2041",
    marginTop: hp(1.5),
    borderRadius: 10,
    alignSelf: "center",
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(3.6)
  },
  modalQoutesCon: {
    width: '93%',
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: "#0D2041",
    marginTop: hp(1.8),
    borderRadius: 10,
    alignSelf: "center",
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(3.6)
  },
  chooseModalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: 'center',
  },
  chooseModalContent: {
    backgroundColor: 'rgba(33, 43, 83, 1)',
    padding: 20,
    borderRadius: 10,
    width: wp(99),
    maxHeight: '80%',
  },
  chooseItemContainer: {
    marginVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0.9,
    borderBlockEndColor: '#fff',
    marginBottom: hp(0.5),
    paddingBottom: hp(2)
  },
  chooseItemImage: {
    width: 39,
    height: 39,
    resizeMode: 'contain',
    marginVertical: 3,
  },
  chooseItemText: {
    marginLeft: 10,
    fontSize: 24,
    color: '#fff',
  },
  iconCon: {
    height: 39,
    width: 39,
    marginRight: 3
  },
  iconAssetCon: {
    height: 21,
    width: 21,
    bottom:-20,
    zIndex:20,
    left:-18
  },
  networkHeading: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: wp(1.3),
    marginTop: hp(-0.1)
  },
  networkSubHeading: {
    color: "#94A3B8",
    fontSize: 13,
    marginLeft: wp(1.3)
  },
  quoteTextCon: {
    flexDirection: "row",
    padding: 9,
    backgroundColor: "#10B981",
    borderRadius: 8,
  },
  quoteText: {
    fontSize: 24,
    color: '#fff',
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
export default ExportUSDC;