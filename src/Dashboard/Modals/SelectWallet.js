import React, { useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from "react-native";
import { TextInput, Checkbox } from "react-native-paper";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Animated } from "react-native";
import darkBlue from "../../../assets/multicoin_wallet.png"
import title_icon from "../../../assets/title_icon.png";
import { useDispatch, useSelector } from "react-redux";
import {
  Avatar,
  Card,
  Title,
  Paragraph,
  CardItem,
  WebView,
} from "react-native-paper";
import Bnbimage from "../../../assets/bnb-icon2_2x.png";
import Etherimage from "../../../assets/ethereum.png";
import Xrpimage from "../../../assets/xrp.png";
import Maticimage from "../../../assets/matic.png";
import stellarImg from "../../../assets/Stellar_(XLM).png"
import Modal from "react-native-modal";
import ImportBinanceWallet from "./importBinance";
import ImportEthereumModal from "./importEthereumModal";
import ImportMultiCoinWalletModal from "./importMultiCoinWalletModal";
import ImportPolygonWalletModal from "./ImportPolygonWalletModal";
import ImportStellar from "./importStellarModal";
import ImportXrpWalletModal from "./importXrpWalletModal";
import ModalHeader from "../reusables/ModalHeader";
import { WalletHeader } from "../header";
import ImportStellarModal from "./importStellarModal";
//'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png?1644979850'
const SelectWallet = ({ props, visible, setVisible, setModalVisible }) => {
  const state=useSelector((state)=>state);
  const [MultiCoinModal, setMultiCoinMoodal] = useState(false);
  const [BscWallet, setBscWalletVisible] = useState(false);
  const [EthereumWallet, setEthereumWallet] = useState(false);
  const [PolygonWallet, setPolygonwallet] = useState(false);
  const [XrpWallet, setXrpWallet] = useState(false);
  const [Stellar_wallet,setStellar_wallet]=useState(false);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  let LeftContent = (props) => <Avatar.Image {...props} source={title_icon} />;
  let EtherLeftContent = (props) => (
    <Avatar.Image {...props} source={Etherimage} />
  );
  let BnbLeftContent = (props) => <Avatar.Image {...props} source={Bnbimage} />;
  let XrpLeftContent = (props) => <Avatar.Image {...props} source={Xrpimage} />;
  let MaticLeftContent = (props) => (
    <Avatar.Image {...props} source={Maticimage} />
  );

  // const Wallets = [
  //   {
  //     name: "ethereum",
  //   },
  //   {
  //     name: "Binance smart chain",
  //     LeftContent: Bnbimage,
  //   },
  //   {
  //     name: "Xrp",
  //     LeftContent: Xrpimage,
  //   },
  //   {
  //     name: "Polygon(Matic)",
  //     LeftContent: Maticimage,
  //   },
  // ];
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const Spin = new Animated.Value(0);
  const SpinValue = Spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const closeModal = () => {
    setVisible(false);
  };
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
    }).start();

    Animated.timing(Spin, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, Spin]);

  return (
    <Modal
      animationIn="slideInRight"
      animationOut="slideOutRight"
      animationInTiming={100}
      animationOutTiming={650}
      isVisible={visible}
      onBackdropPress={() => setVisible(false)}
      useNativeDriver={true}
      useNativeDriverForBackdrop={true}
      backdropTransitionOutTiming={0}
      hideModalContentWhileAnimating
      onBackButtonPress={() => {
        setVisible(false);
      }}
    >
      <View style={[style.Body,{backgroundColor:state.THEME.THEME===false?"#fff":"black"}]}>
        {/* <ModalHeader Function={closeModal}  name={'Import'}/> */}
        <View style={{marginTop:5}}>
        <WalletHeader title="Select Wallet" IconType="Wallet"/>
        </View>
        <TouchableOpacity
          style={style.Box2}
          onPress={() => {
            setMultiCoinMoodal(true);
          }}
        >
          <Image source={darkBlue} style={style.darkBlueimg}/>
          <Text style={[style.text1,{color:state.THEME.THEME===false?"black":"#fff"}]}> Multi-Chain Wallet </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={style.Box}
          onPress={() => {
            setBscWalletVisible(true);
          }}
        >
          <Image source={Bnbimage} style={style.img} />
          <Text style={[style.text,{color:state.THEME.THEME===false?"black":"#fff"}]}>Binance Smart Chain</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={style.Box}
          onPress={() => {
            setEthereumWallet(true);
          }}
        >
          <Image source={Etherimage} style={style.img} />
          <Text style={[style.text,{color:state.THEME.THEME===false?"black":"#fff"}]}>Ethereum</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity
          style={style.Box}
          onPress={() => {
            setPolygonwallet(true);
          }}
        >
          <Image source={Maticimage} style={style.img} />
          <Text style={[style.text,{color:state.THEME.THEME===false?"black":"#fff"}]}>Polygon(Matic)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={style.Box}
          onPress={() => {
            setXrpWallet(true);
          }}
        >
          <Image source={Xrpimage} style={style.img} />
          <Text style={[style.text,{color:state.THEME.THEME===false?"black":"#fff"}]}> Xrp</Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          style={style.Box}
          onPress={() => {
            setStellar_wallet(true);
          }}
        >
          <Image source={stellarImg} style={style.img} />
          <Text style={[style.text,{color:state.THEME.THEME===false?"black":"#fff"}]}> Stellar</Text>
        </TouchableOpacity>
      </View>
      <View>
        <ImportBinanceWallet
          Visible={BscWallet}
          onCrossPress={()=>{setBscWalletVisible(false)}}
          setWalletVisible={setBscWalletVisible}
          setModalVisible={setVisible}
          setVisible={setVisible}
        />
        <ImportEthereumModal
        onCrossPress={()=>{setEthereumWallet(false)}}
          Visible={EthereumWallet}
          setWalletVisible={setEthereumWallet}
          setModalVisible={setVisible}
          setVisible={setVisible}
        />
        <ImportMultiCoinWalletModal
          Visible={MultiCoinModal}
          onCrossPress={()=>{setMultiCoinMoodal(false)}}
          setWalletVisible={setMultiCoinMoodal}
          setModalVisible={setVisible}
          setVisible={setVisible}
        />
        <ImportPolygonWalletModal
          Visible={PolygonWallet}
          onCrossPress={()=>{setPolygonwallet(false)}}
          setWalletVisible={setPolygonwallet}
          setModalVisible={setVisible}
          setVisible={setVisible}
        />
        <ImportXrpWalletModal
          Visible={XrpWallet}
          onCrossPress={()=>{setXrpWallet(false)}}
          setWalletVisible={setXrpWallet}
          setModalVisible={setVisible}
          setVisible={setVisible}
        />
        <ImportStellarModal
        Visible={Stellar_wallet}
        onCrossPress={()=>{setStellar_wallet(false)}}
        setWalletVisible={setStellar_wallet}
        setModalVisible={setVisible}
        setVisible={setVisible}
      />
      </View>
    </Modal>
  );
};

export default SelectWallet;

const style = StyleSheet.create({
  Body: {
    backgroundColor: "white",
    height: hp(102.9),
    borderRadius: hp(1),
    width: wp(100),

    alignSelf: "center",
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "200",
    color: "black",
    marginTop: hp(5),
  },
  welcomeText2: {
    fontSize: 15,
    fontWeight: "200",
    color: "white",
    marginTop: hp(1),
  },
  Button: {
    marginTop: hp(10),
  },
  tinyLogo: {
    width: wp("5"),
    height: hp("5"),
    padding: 30,
    marginTop: hp(10),
  },
  Text: {
    marginTop: hp(5),
    fontSize: 15,
    fontWeight: "200",
    color: "white",
  },
  input: {
    height: hp("5%"),
    marginBottom: hp("2"),
    color: "black",
    marginTop: hp("2"),
    width: wp("70"),
    paddingRight: wp("7"),
    backgroundColor: "white",
  },
  Box: {
    alignSelf: "center",
    width: wp(90),
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth * 1,
    borderColor: "#C1BDBD",
    padding: 10,
    marginTop: hp(3),
  },
  Box2: {
    alignSelf: "center",
    width: wp(90),
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth * 1,
    borderColor: "#C1BDBD",
    // padding: 4,
    marginTop: hp(3),
  },
  img: {
    height: hp(5),
    width: wp(10),
  },
  text: {
    marginHorizontal: wp(4),
  },
  text1: {
    marginHorizontal: wp(0.5),
  },
  darkBlueimg:{
    height: hp(7),
    width: wp(14),
    marginHorizontal:wp(0.7)
  }
});
