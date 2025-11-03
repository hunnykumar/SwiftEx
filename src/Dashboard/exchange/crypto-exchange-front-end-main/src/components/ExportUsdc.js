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
import { useCallback, useEffect, useState } from 'react';
import { GetStellarAvilabelBalance, GetStellarUSDCAvilabelBalance } from '../../../../../utilities/StellarUtils';
import { alert } from '../../../../reusables/Toasts';
import { getChainTokenData, swapPepare } from '../../../../../utilities/AllbridgeUtil';
import { Keypair } from '@stellar/stellar-sdk';
import Snackbar from 'react-native-snackbar';
import { debounce } from 'lodash';
import AllbridgeTxTrack from './AllbridgeTxTrack';
import CustomInfoProvider from './CustomInfoProvider';
import { convertMultiple } from '../utils/UsdPriceHandler';
import { colors } from '../../../../../Screens/ThemeColorsConfig';

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
    type:"sendAsset",
    symbole:"USDC"
  });
  const [selectedReciveNetworkDetils,setselectedReciveNetworkDetils]=useState(null);
  const [selectedReciveAssetDetils,setselectedReciveAssetDetils]=useState(null);
  const [chooseAsset,setchooseAsset]=useState(null);
  const [chooseNetwork,setchooseNetwork]=useState(null);
  const [chooseReciveAsset,setchooseReciveAsset]=useState(null);
  const [chooseReciveNetwork,setchooseReciveNetwork]=useState(null);
  const [amount,setamount] = useState('0.00');
  const [getInfo,setgetInfo]=useState(false);
  const [resQuotes,setresQuotes]=useState(null);
  const [btnLoading,setbtnLoading]=useState(false);
  const [XLMAvlBal,setXLMAvlBal]=useState("0");
  const [payFeeType,setPayFeeType]=useState("native");
  const [showTx,setshowTx]=useState(false);
  const [showTxHash,setshowTxHash]=useState([]);
  const [viewInUSD, setViewInUSD] = useState(false);
  const manageFeeViewer = () => setViewInUSD(prev => !prev);


  const sendNetworks = [
    {
      name: "Stellar",
      image: "https://stellar.myfilebase.com/ipfs/QmSTXU2wn1USnmd5ZypA5zMze259wEPSDP3i8wivyr9qiq",
      type:"sendNetworks",
      symbole:"SRB"
    }
  ];
  const sendAseets = [
    {
      name: "USDC",
      image: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
      type:"sendAsset",
      symbole:"USDC"
    }
  ];
  const reciveNetwork = [
    {
      name: "Ethereum",
      image: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
      type:"reciveNetwork",
      symbole:"ETH"
    },
    {
      name: "BNB",
      image: "https://tokens.pancakeswap.finance/images/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c.png",
      type:"reciveNetwork",
      symbole:"BSC"
    },
  ];
  const reciveAsset = [
    {
      name: "USDT",
      image: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
      type:"reciveAsset",
      symbole:"USDT"
    },
    {
      name: "USDC",
      image: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
      type:"reciveAsset",
      symbole:"USDC"
    }
  ];


  useEffect(() => {
    setshowTx(false);
    setshowTxHash([]);
    setstellarWalletActivated(false);
    setbasicProccesing(true);
    fetchStellarWalletdetails();
    setwalletBalance("0.00");
    setamount("");
    setselectedNetworkDetils(null);
    setselectedReciveNetworkDetils(null);
    setselectedReciveAssetDetils(null);
    setchooseAsset(null);
    setchooseNetwork(null);
    setchooseReciveAsset(null);
    setchooseReciveNetwork(null);
    setgetInfo(false);
    setresQuotes(null);
    setbtnLoading(false);
    setXLMAvlBal("0.0");
    setPayFeeType("native")
  }, [Focused])

  useEffect(() => {
    setamount("");
    setgetInfo(false);
    setresQuotes(null);
    setPayFeeType("native")
  }, [chooseReciveAsset,chooseReciveNetwork])

  const fetchStellarWalletdetails = async () => {
    try {
      if (state.STELLAR_ADDRESS_STATUS === false) {
        setstellarWalletActivated(true);
        setbasicProccesing(false);
      }
      const fetchedUSDCBala = await GetStellarUSDCAvilabelBalance(state && state.STELLAR_PUBLICK_KEY, "USDC", "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN");
      if (!fetchedUSDCBala.status) {
        setwalletBalance(fetchedUSDCBala?.availableBalance);
        setbasicProccesing(false);
      }
      else {
        setbasicProccesing(false);
      }
      const fetchedXLMBal = await GetStellarAvilabelBalance(state && state.STELLAR_PUBLICK_KEY);
      if(fetchedXLMBal.availableBalance)
      {
        setXLMAvlBal(fetchedXLMBal.availableBalance);
      }else{
        setXLMAvlBal("0");
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
        <Text style={[styles.chooseItemText,{color:theme.headingTx}]}>{item.name}</Text>
      </TouchableOpacity>
      )
    };

  const handleInputChange = async (value) => {
    setgetInfo(true)
    const numericText = value.replace(/[^0-9.]/g, '');
    setamount(numericText)
    getQuote(!selectedNetworkDetils ? sendNetworks[0].symbole : selectedNetworkDetils.symbole, !selectedReciveNetworkDetils ? reciveNetwork[0].symbole : selectedReciveNetworkDetils.symbole, !selectedAssetDetils ? sendAseets[0].symbole : selectedAssetDetils.symbole, !selectedReciveAssetDetils ? reciveAsset[0].symbole : selectedReciveAssetDetils.symbole,numericText);
  }

  const getQuote = useCallback(
    debounce(async (sourceChain,destChain,sourceToken,destToken,value) => {
      const qoutesRep = await getChainTokenData(sourceChain,destChain,sourceToken,destToken,value);
      if (qoutesRep.success) {
        Keyboard.dismiss();
        setgetInfo(false);
        const respo = await convertMultiple([
          {
            token:
              qoutesRep.info.fee.native.symbole === "Native"
                ? "XLM"
                : qoutesRep.info.fee.native.symbole,
            amount: qoutesRep.info.fee.native.amount,
          },
          {
            token: qoutesRep.info.fee.stablecoin.symbole,
            amount: qoutesRep.info.fee.stablecoin.amount,
          },
        ]);
        const mergedQuotes = { ...qoutesRep.info };
        for (const item of respo) {
          if (item.success) {
            const nativeToken =
              qoutesRep.info.fee.native.symbole === "Native"
                ? "XLM"
                : qoutesRep.info.fee.native.symbole;
            const stableToken = qoutesRep.info.fee.stablecoin.symbole;

            if (item.token === nativeToken) {
              mergedQuotes.fee.native = { ...mergedQuotes.fee.native, ...item };
            } else if (item.token === stableToken) {
              mergedQuotes.fee.stablecoin = { ...mergedQuotes.fee.stablecoin, ...item };
            }
          }
        }
        setresQuotes(mergedQuotes);
        setgetInfo(false);
      } else {
        Keyboard.dismiss();
        alert("error", qoutesRep.error)
        setresQuotes(null);
        setgetInfo(false);
      }
    }, 500),
    []
  );

  const swapExecute = async () => {
    try {
      setbtnLoading(true);
      Keyboard.dismiss();
      const stellarWallet = {
        publicKey: state && state.STELLAR_PUBLICK_KEY,
        secretKey: state && state.STELLAR_SECRET_KEY
      };
      const result = await swapPepare(
        !selectedNetworkDetils ? sendNetworks[0].symbole : selectedNetworkDetils.symbole,
        !selectedReciveNetworkDetils ? reciveNetwork[0].symbole : selectedReciveNetworkDetils.symbole,
        !selectedAssetDetils ? sendAseets[0].symbole : selectedAssetDetils.symbole,
        !selectedReciveAssetDetils ? reciveAsset[0].symbole : selectedReciveAssetDetils.symbole,
        amount,
        state && state.wallet && state.wallet.address,
        stellarWallet,
        payFeeType
      );
      console.log("swap-result----", result)
      if (result.success) {
        setshowTxHash([{ chain: "SRB", hash: showTxHash }]);
        setshowTx(true);
        Snackbar.show({
          text: "USDC Exported successfully.",
          duration: Snackbar.LENGTH_SHORT,
          backgroundColor: 'green',
        });
        console.log("USDC Exported:-", result);
        setbtnLoading(false);
      } else {
        setshowTx(false);
        Snackbar.show({
          text: result.error||"USDC Exported Faild.",
          duration: Snackbar.LENGTH_SHORT,
          backgroundColor: 'red',
        });
        console.log("USDC Exported Faild:-", result);
        setbtnLoading(false);
      }
    } catch (error) {
      setshowTx(false);
      setbtnLoading(false);
      console.log("error in allbridge swap execute:", error)
      Snackbar.show({
        text: "USDC Exported Faild.",
        duration: Snackbar.LENGTH_SHORT,
        backgroundColor: 'red',
      });
      console.log("USDC Exported Faild:-", result);
    }
  }
console.log("resQuotes-",resQuotes)
  const feeData = payFeeType === "native"
    ? resQuotes?.fee?.native
    : resQuotes?.fee?.stablecoin;


  
    const theme = state.THEME.THEME ? colors.dark : colors.light;

    const numericAmount = parseFloat(amount) || 0;
    const numericWalletBalance = parseFloat(walletBalance) || 0;
    const xlmFee = parseFloat(resQuotes?.fee?.native?.amount || 0);
    const stableFee = parseFloat(resQuotes?.fee?.stablecoin?.amount || 0);
    const noAmount = !amount || isNaN(Number(amount));
    const insufficientFunds = numericAmount > numericWalletBalance;
    const insufficientXLMFee = payFeeType === "native" && resQuotes && xlmFee > parseFloat(XLMAvlBal || 0);
    const insufficientStableFee = payFeeType === "stable" && resQuotes && stableFee > numericWalletBalance;
    const isProcessing = basicProccesing || btnLoading || getInfo;
    const isDisabled =
      noAmount ||
      isProcessing ||
      insufficientFunds ||
      insufficientXLMFee ||
      insufficientStableFee;
    const buttonColor = isDisabled ? 'gray' : '#4052D6';
    let buttonLabel = 'Confirm Transaction';
    if (insufficientXLMFee || insufficientStableFee) {
      buttonLabel = `Insufficient ${payFeeType === 'stable' ? 'USDC' : 'XLM'
        } to cover the fee`;
    } else if (insufficientFunds) {
      buttonLabel = 'Insufficient Funds';
    }
  return (
    <View style={[styles.container,{backgroundColor:theme.bg}]}>
      <Exchange_screen_header title="Bridge" onLeftIconPress={() => navigation.goBack()} onRightIconPress={() => console.log('Pressed')} />
      <WalletActivationComponent
        isVisible={stellarWalletActivated}
        onClose={() => { handleWalletActivationComponent }}
        onActivate={() => { setstellarWalletActivated(false) }}
        navigation={navigation}
        appTheme={true}
        shouldNavigateBack={true}
      />
      <ScrollView style={[styles.scrollCon,{backgroundColor:theme.bg}]}>
        <View style={[styles.card,{backgroundColor:theme.cardBg,flexDirection:"column"}]}>
        
        <Text style={[styles.headingText,{color:theme.headingTx}]}>Export USDC to Wallet</Text>
        {/* Select network */}
        <TouchableOpacity style={[styles.modalOpen,{backgroundColor:theme.bg}]} onPress={() => { setchooseNetwork(true); }}>
          <View style={{ flexDirection: "row" }}>
            <Image source={{ uri: !selectedNetworkDetils?sendNetworks[0].image:selectedNetworkDetils.image }} style={styles.iconCon} />
            <View>
              <Text style={[styles.networkSubHeading,{color:theme.inactiveTx}]}>Network</Text>
              <Text style={[styles.networkHeading,{color:theme.headingTx}]}>{!selectedNetworkDetils?sendNetworks[0].name:selectedNetworkDetils.name}</Text>
            </View>
          </View>
          <Icon name={"chevron-down"} type={"materialCommunity"} color={theme.headingTx} size={30} />
        </TouchableOpacity>
        </View>

        {/* perfect stellar usdc balance componet */}
        <View style={[styles.card,{backgroundColor:theme.cardBg,flexDirection:"column",borderBottomLeftRadius:0,borderBottomRightRadius:0}]}>
        <View style={[styles.rowBtnCon, { paddingVertical: hp(-0.5),backgroundColor:theme.cardBg }]}>
            <Text style={[styles.subInputText,{color:theme.inactiveTx,marginTop: hp(0)}]}>Amount</Text>
            <TouchableOpacity style={styles.maxCon} onPress={() => {
            if (parseFloat(walletBalance) === 0) {
             CustomInfoProvider.show("Info", "Insuficint Balance.")
              setamount(null)
            } else {
              handleInputChange(walletBalance)
            }
          }}>
            <Text style={styles.maxBtn}>MAX</Text>
          </TouchableOpacity>
            </View>
         <View style={[styles.modalOpen, { paddingVertical: hp(0.5),backgroundColor:theme.bg }]}>
            <TextInput maxLength={10} placeholder='0.0' placeholderTextColor={"gray"} keyboardType="number-pad" value={amount} style={[styles.textInputForCrossChain,{fontSize: 18, color: theme.headingTx}]} onChangeText={(value) => { handleInputChange(value) }} returnKeyType="done" />
        </View>
        </View>

        {/* stellar address componet */}
        <View style={[styles.card,{backgroundColor:theme.cardBg,flexDirection:"column",borderTopLeftRadius:0,borderTopRightRadius:0,marginTop:-4,borderTopColor:theme.smallCardBorderColor,borderTopWidth:1}]}>
         <View style={styles.accountDetailsCon}>
         <Text style={[styles.subInputText, { color:theme.inactiveTx }]}>Active Wallet :</Text>
          <View style={{ width: "60%" }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: "99%" }}>
              <Text style={{ fontSize: 14, color: theme.headingTx }}>{state && state.STELLAR_PUBLICK_KEY}</Text>
            </ScrollView>
          </View>
         </View>

         <View style={styles.accountDetailsCon}>
          <Text style={[styles.subInputText, { color:theme.inactiveTx }]}>Balance :</Text>
          <View style={{ minWidth:wp(15) }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: "96%" }}>
              {basicProccesing ? <ActivityIndicator color={"green"} /> : <Text style={{ color: theme.headingTx, fontSize: 14 }}>{payFeeType==="stable"?walletBalance:XLMAvlBal}</Text>}
            </ScrollView>
          </View>
          </View>

        </View>

        <View style={[styles.card,{backgroundColor:theme.cardBg,flexDirection:"column"}]}>
          <View style={{ flexDirection: "row", paddingLeft: wp(3) }}>
            <Icon name={"fire"} type={"materialCommunity"} size={25} color={"#4052D6"} />
            <Text style={[styles.subInputText, { fontSize: 16,color:theme.headingTx }]}> Relayer Fee</Text>
          </View>
            <View style={{flexDirection:"row"}}>
            <TouchableOpacity style={[styles.feePayCon,{backgroundColor:payFeeType==="native"?"#4052D6":theme.bg}]} onPress={()=>{setPayFeeType("native")}}>
              <Icon name={"fire"} type={"materialCommunity"} size={25} color={payFeeType==="native"?"#fff":"#4052D6"} />
              <Text style={[styles.feePayTx,{color: payFeeType==="native"?"#fff":theme.headingTx}]}>Native </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.feePayCon,{backgroundColor:payFeeType==="stable"?"#4052D6":theme.bg}]} onPress={()=>{setPayFeeType("stable")}}>
              <Icon name={"fire"} type={"materialCommunity"} size={25} color={payFeeType==="stable"?"#fff":"#4052D6"} />
              <Text style={[styles.feePayTx,{color: payFeeType==="stable"?"#fff":theme.headingTx}]}>Stable-Coin </Text>
            </TouchableOpacity>
            </View>
        </View>

        <View style={[styles.card,{backgroundColor:theme.cardBg,flexDirection:"column"}]}>
        <Text style={[styles.headingText,{color:theme.headingTx}]}>Export USDC to Wallet</Text>
        <View style={[styles.exportBottomCon]}>
          {/* Select recive network */}
        <TouchableOpacity style={[styles.exportCon,{backgroundColor:theme.bg}]} onPress={() => { setchooseReciveNetwork(true); }}>
          <View style={{ flexDirection: "row" }}>
            <Image source={{ uri: !selectedReciveNetworkDetils?reciveNetwork[0].image:selectedReciveNetworkDetils.image }} style={styles.iconCon} />
            <View>
              <Text style={[styles.networkSubHeading,{color:theme.inactiveTx}]}>Network</Text>
              <Text style={[styles.networkHeading,{color:theme.headingTx}]}>{!selectedReciveNetworkDetils?reciveNetwork[0].name:selectedReciveNetworkDetils.name}</Text>
            </View>
          </View>
          <Icon name={"chevron-down"} type={"materialCommunity"} color={theme.headingTx} size={30} />
        </TouchableOpacity>

        {/* Select recive network */}
        <TouchableOpacity style={[styles.exportCon,{backgroundColor:theme.bg}]} onPress={() => { setchooseReciveAsset(true); }}>
          <View style={{ flexDirection: "row" }}>
            <Image source={{ uri: !selectedReciveAssetDetils?reciveAsset[0].image:selectedReciveAssetDetils.image }} style={styles.iconCon} />
            <View>
              <Text style={[styles.networkSubHeading,{color:theme.inactiveTx}]}>Asset</Text>
              <Text style={[styles.networkHeading,{color:theme.headingTx}]}>{!selectedReciveAssetDetils?reciveAsset[0].name:selectedReciveAssetDetils.name}</Text>
            </View>
          </View>
          <Icon name={"chevron-down"} type={"materialCommunity"} color={theme.headingTx} size={30} />
        </TouchableOpacity>
        </View>
        </View>

        {getInfo && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066cc" />
            <Text style={styles.loadingText}>Getting best quote...</Text>
          </View>
        )}

        {resQuotes !== null && <View style={[styles.modalQoutesCon,{backgroundColor:theme.cardBg}]}>
          <Text style={[styles.quoteTitle,{color:theme.headingTx}]}>Quote Details</Text>
          <View style={[styles.quoteDetailsContainer]}>
            <View style={styles.quoteRow}>
              <Text style={[styles.quoteLabel,{color:theme.inactiveTx}]}>Provider</Text>
              <Text style={[styles.quoteValue,{color:theme.headingTx}]}>Allbridge</Text>
            </View>

            <View style={styles.quoteRow}>
              <Text style={[styles.quoteLabel,{color:theme.inactiveTx}]}>Unit Price</Text>
              <Text style={[styles.quoteValue,{color:theme.headingTx}]}>
                1 {!selectedAssetDetils?sendAseets[0].symbole:selectedAssetDetils.symbole} = {resQuotes.conversionRate} {!selectedReciveAssetDetils?reciveAsset[0].symbole:selectedReciveAssetDetils.symbole}
              </Text>
            </View>

            <View style={styles.quoteRow}>
              <Text style={[styles.quoteLabel,{color:theme.inactiveTx}]}>Slippage</Text>
              <Text style={[styles.quoteValue,{color:theme.headingTx}]}>
                {resQuotes.slippageTolerance}%
              </Text>
            </View>

            <View style={styles.quoteRow}>
              <Text style={[styles.quoteLabel,{color:theme.inactiveTx}]}>Minimum Received</Text>
              <View style={{ width: wp(25), flexDirection: 'row' }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <Text style={[styles.quoteValue,{color:theme.headingTx}]}>{resQuotes.minimumAmountOut}</Text>
                </ScrollView>
                <Text style={[styles.quoteValue,{color:theme.headingTx}]}>{!selectedReciveAssetDetils?reciveAsset[0].symbole:selectedReciveAssetDetils.symbole}</Text>
              </View>
            </View>
          </View>

          <View style={styles.quoteRow}>
            <Text style={[styles.quoteLabel,{color:theme.inactiveTx}]}>Network Fee</Text>
            <TouchableOpacity onPress={manageFeeViewer}>
              <Text style={[styles.quoteValue,{color:theme.headingTx}]}>
                {`${feeData?.amount} ${feeData?.symbole}`}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.quoteRow}>
            <Text style={[styles.quoteLabel,{color:theme.inactiveTx}]}>Network Fee (USD)</Text>
            <TouchableOpacity onPress={manageFeeViewer}>
              <Text style={[styles.quoteValue,{color:theme.headingTx}]}>
                {feeData?.formattedUSD || `$${Number(feeData?.usdValue || 0).toFixed(2)}`}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.quoteRow}>
            <Text style={[styles.quoteLabel,{color:theme.inactiveTx}]}>Estimated time</Text>
            <Text style={[styles.quoteValue,{color:theme.headingTx}]}>
              ~ {resQuotes?.completionTime}
            </Text>
          </View>

          <View style={[styles.quoteTextCon,{borderColor:theme.inactiveTx}]}>
            <Text style={[styles.quoteText,{color:theme.headingTx}]}>≈</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Text style={[styles.quoteText,{color:theme.headingTx}]}>{resQuotes.minimumAmountOut}</Text>
            </ScrollView>
            <Text style={[styles.quoteText,{color:theme.headingTx}]}>{!selectedReciveAssetDetils?reciveAsset[0].symbole:selectedReciveAssetDetils.symbole}</Text>
          </View>
        </View>}

        <TouchableOpacity
          style={[styles.confirmButton, { backgroundColor: buttonColor }]}
          disabled={isDisabled}
          onPress={swapExecute}
        >
          {isProcessing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.confirmButtonText}>{buttonLabel}</Text>
          )}
        </TouchableOpacity>


        {/* perfect network selection */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={chooseNetwork}
        >
          <TouchableOpacity style={styles.chooseModalContainer} onPress={() => setchooseNetwork(false)}>
            <View style={[styles.chooseModalContent,{backgroundColor:theme.cardBg}]}>
              <Text style={{ fontSize: 20, fontWeight: "bold", marginVertical: hp(1), color: theme.headingTx }}>Select Wallet</Text>
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
            <View style={[styles.chooseModalContent,{backgroundColor:theme.cardBg}]}>
              <Text style={{ fontSize: 20, fontWeight: "bold", marginVertical: hp(1), color: theme.headingTx }}>Choose Network</Text>
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
            <View style={[styles.chooseModalContent,{backgroundColor:theme.cardBg}]}>
              <Text style={{ fontSize: 20, fontWeight: "bold", marginVertical: hp(1), color: theme.headingTx }}>Choose Asset</Text>
              <FlatList
                data={reciveAsset}
                renderItem={chooseRenderItem}
                keyExtractor={(item,index) => index}
              />
            </View>
          </TouchableOpacity>
        </Modal>
        </ScrollView>
      <View style={styles.allBridgeTxCon}>
        <AllbridgeTxTrack txs={showTxHash} isDarkMode={state?.THEME?.THEME} showTx={showTx} closeTx={()=>{setshowTx(false)}} />
      </View>
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
    marginBottom: hp(5),
    paddingHorizontal:wp(3.5)
  },
  headingText: {
    color: "#fff",
    fontSize: 16,
    fontWeight:"400",
    textAlign: "left",
    paddingLeft: wp(5)
  },
  subInputText: {
    color: "#94A3B8",
    fontSize: 15,
  },
  feePayTx: {
    fontSize: 16,
    fontWeight:"600"
  },
  maxBtn: {
    color: "#FFF",
    fontSize: 16,
  },
  maxCon: {
    backgroundColor: "#4052D6",
    borderRadius: 10,
    paddingVertical:5,
    paddingHorizontal: wp(5),
  },
  modalOpen: {
    width: '93%',
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: hp(1.5),
    borderRadius: 10,
    alignSelf: "center",
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(3)
  },
  exportBottomCon: {
    width: '100%',
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 10,
    alignSelf: "center",
    marginTop:12,
    paddingVertical: hp(0),
    paddingHorizontal: wp(3.9)
  },
  exportCon: {
    width: wp(41),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0D2041",
    borderRadius: 10,
    alignSelf: "center",
    paddingVertical: hp(1.4),
    paddingHorizontal: wp(3)
  },
  rowBtnCon: {
    width: '93%',
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 10,
    alignSelf: "center",
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(2)
  },
  modalQoutesCon: {
    width: '100%',
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: "#0D2041",
    marginTop: hp(1),
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
    borderWidth:1,
    borderRadius: 8,
  },
  quoteText: {
    fontSize: 20,
    color: '#fff',
    borderRadius: 8,
    fontWeight:"600"
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
    fontWeight:"500"
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
  confirmButton: {
    width: wp(93),
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginTop: 20,
    alignSelf: "center",
    height:hp(6.4),
    marginTop:hp(1.6),
    marginBottom:hp(3)
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight:"bold"
  },
  feePayCon:{
   flexDirection: "row",
   marginLeft:10,
   paddingVertical:hp(1),
   paddingHorizontal:wp(2),
   borderRadius:10,
   maxWidth:wp(38),
   alignItems:"center",
   justifyContent:"center",
   marginTop:8
  },
  allBridgeTxCon:{
    zIndex:20,
    position:"absolute",
    width:"100%",
    maxHeight:"50%",
    bottom:25
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#2b3c57",
    borderRadius: 10,
    paddingVertical:hp(1.9),
    marginVertical: hp(0.5),
    justifyContent: "space-between",
  },
  accountDetailsCon:{
    flexDirection:"row",
    justifyContent:"space-between",
    paddingHorizontal:wp(4.5)
  },
  textInputForCrossChain:{
    width:"100%",
    paddingHorizontal: wp(2),
    paddingVertical:  Platform.OS=="android"?hp(1):hp(2),
  },
});
export default ExportUSDC;