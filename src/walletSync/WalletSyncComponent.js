import "@walletconnect/react-native-compat";
import "@ethersproject/shims";
import { Buffer } from "buffer";
global.Buffer = Buffer;

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Button,
  Alert,
  TextInput,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Image,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RNCamera } from "react-native-camera";
import { Core } from "@walletconnect/core";
import { Web3Wallet } from "@walletconnect/web3wallet";
import { useSelector } from "react-redux";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { WALLET_CONN_PROJECT_ID } from '@env';
import Icon from "../icon";

const PROJECT_ID = "5384a462a6bd32fd80e6d6ff268ed760";

const WalletSyncComponent = ({ close,openModal }) => {
  const cameraRef = useRef(null);
  const [wallet, setWallet] = useState(null);

  const [web3wallet, setWeb3wallet] = useState(null);
  const [manualUri, setManualUri] = useState("");
  const [scanned, setScanned] = useState(false);
  const [proposal, setProposal] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const state = useSelector((state) => state);
  const requestedChain = [
    {  name:"Ethereum",symbole: "ETH", img: "https://tokens.pancakeswap.finance/images/0x2170Ed0880ac9A755fd29B2688956BD959F933F8.png" },
    {  name:"Binance",symbole: "BNB", img: "https://coin-images.coingecko.com/coins/images/825/large/bnb-icon2_2x.png?1696501970", },
    {  name:"Stellar",symbole: "STR", img: "https://stellar.myfilebase.com/ipfs/QmSTXU2wn1USnmd5ZypA5zMze259wEPSDP3i8wivyr9qiq"},
  ]
  useEffect(() => {
    const init = async () => {
      try {
        setWallet(state.wallet.address);

        const core = new Core({ projectId: PROJECT_ID });
        const web3 = await Web3Wallet.init({
          core,
          metadata: {
            name: "SwiftEx App",
            description: "SwiftEx App",
            url: "https://swift-exwallet.vercel.app",
            icons: ["https://swiftexchange.io/icons/favicon.ico"],
          },
          storageOptions: { asyncStorage: AsyncStorage },
        });

        web3.on("session_proposal", async (proposal) => {
          openModal()
          setProposal(proposal);
          setModalVisible(true);
        });

        setWeb3wallet(web3);
        console.log("Web3Wallet Initialized");
      } catch (err) {
        console.log("Wallet Init Error:", err);
      }
    };

    init();
  }, []);

  const approveSession = async () => {
    try {
      setApprovalLoading(true);
      await web3wallet.approveSession({
        id: proposal.id,
        namespaces: {
          eip155: {
            chains: ["eip155:5", "eip155:97"],
            methods: ["eth_sendTransaction", "personal_sign"],
            events: ["accountsChanged", "chainChanged"],
            accounts: [
              `eip155:5:${wallet}`,
              `eip155:97:${wallet}`,
            ],
          },
          stellar: {
            chains: ["stellar:testnet"],
            methods: [
              "stellar_signTransaction",
              "stellar_signAndSubmitTransaction",
            ],
            events: ["accountsChanged", "chainChanged"],
            accounts: [`stellar:testnet:${state.STELLAR_PUBLICK_KEY}`],
          },
        },
      });
      setApprovalLoading(false);
      setModalVisible(false);
      // close()
      Alert.alert("Info","Wallet Connected.");
    } catch (err) {
      setApprovalLoading(false);
      close()
      console.error("Session approval failed", err);
      Alert.alert("Info","Wallet Connected Faild.");
    }
  };

  const rejectSession = async () => {
    try {
      await web3wallet.rejectSession({
        id: proposal.id,
        reason: {
          code: 4001,
          message: "User rejected the connection request",
        },
      });
      setModalVisible(false);
      // close()
    } catch (err) {
      close()
      console.error("Session rejection failed", err);
      Alert.alert("Info","Wallet Connection Faild.");
    }
  };

  const handlePairing = async (uri) => {
    try {
      if (!uri) throw new Error("Invalid WalletConnect URI");
      await web3wallet.core.pairing.pair({ uri });
      setScanned(true);
      // close()
    } catch (err) {
      Alert.alert("Pairing error", err.message);
      console.error("Pairing error:", err);
      close()
    }
  };

  const handleBarCodeRead = async ({ data }) => {
    if (!scanned && data.startsWith("wc:")) {
      await handlePairing(data);
    }
  };

  const changeIntoFormat = (fullData) => {
    if (!fullData || fullData.length <= 6) return fullData;
    const fistData = fullData.slice(0, 9);
    const lastData = fullData.slice(-9);
    return `${fistData}......${lastData}`;
  };
  

  const renderChain = ({ item }) => {
    return (
      <View style={styles.chainCon}>
        <View style={styles.chainImgCon}>
          <Image source={{ uri: item.img }} style={styles.chainImg} />
        </View>
        <View style={styles.chianInfoCon}>
        <Text style={styles.chianSymbol}>{item.name}</Text>
        <Text style={styles.chianAddress}>{item.symbole==="STR"?changeIntoFormat(state&&state.STELLAR_PUBLICK_KEY):changeIntoFormat(state&&state.wallet&&state.wallet.address)}</Text>
        </View>
      </View>
    )
  }
  return (
    <View style={styles.mainCon}>
      {!scanned && (
        <View style={{ width: wp(100), height: hp(100) }}>
          <RNCamera
            ref={cameraRef}
            style={{ flex: 1 }}
            onBarCodeRead={handleBarCodeRead}
            captureAudio={false}
          >
            <View style={styles.header}>
              <TouchableOpacity onPress={() => { close() }}>
                <Icon name="arrow-left" size={24} color="#fff" style={styles.backIcon} />
              </TouchableOpacity>
              <Text style={[styles.title, { marginTop: Platform.OS === "ios" ? hp(5) : 0 }]}>Scan QR Code</Text>
            </View>
            <View style={styles.rectangleContainer}>
              <View style={styles.rectangle}>
                <View style={styles.innerRectangle} />
              </View>
            </View>
          </RNCamera>
          <View style={{ padding: 10 }}>
            <TextInput
              style={styles.input}
              placeholder="wc:..."
              value={manualUri}
              onChangeText={setManualUri}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Button title="Connect" onPress={() => handlePairing(manualUri)} />
          </View>
        </View>
      )}

      {/* Modal for Session Approval */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
        {proposal?.params?.proposer && (
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Wallet Connection Request.</Text>
            <Text style={styles.modalText}>{state&&state.wallet&&state.wallet.name} Wallet</Text>
            <Image source={{uri:proposal.params.proposer.metadata.icons?.[0]||proposal.params.proposer.metadata.icons}} style={{width:50,height:53,alignSelf:"center"}}/>
            <Text style={styles.modalSubText}>{proposal.params.proposer.metadata.name} want to Connect.</Text>
            <Text style={styles.baseText}>Requested Networks</Text>
              <FlatList
                data={requestedChain}
                renderItem={renderChain}
                keyExtractor={(item, index) => { index }}
              />
            <View style={[styles.modalButtons,{alignSelf:approvalLoading?"center":"space-between"}]}>
              {approvalLoading?<ActivityIndicator size={"large"} color={"#fff"}/>:
              <>
              <TouchableOpacity style={styles.btnCon} onPress={rejectSession}>
                <Text style={styles.btnText}>Cancle</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnCon} onPress={approveSession}>
                <Text style={styles.btnText}>Accept</Text>
              </TouchableOpacity>
              </>}
            </View>
          </View>)}
        </View>
      </Modal>
    </View>
  );
};

export default WalletSyncComponent;

const styles = StyleSheet.create({
  mainCon: {
    width: wp(100),
    height: hp(100),
    paddingTop: 10
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
    borderColor: "#ccc",
    borderRadius: 5,
    color: "#000",
  },
  waitConntionApprovel: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  waitConText:{
   color:"#fff",
   fontSize:"16",
   fontWeight:"400"
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalContainer: {
    backgroundColor: "#18181C",
    paddingVertical: 25,
    paddingHorizontal:10,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign:"center",
    color:"#fff"
  },
  modalSubText: {
    fontSize: 18,
    textAlign:"center",
    color:"#fff",
    fontWeight:"600"
  },
  modalText: {
    fontSize: 16.9,
    textAlign:"center",
    color:"#fff",
    fontWeight:"600"
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom:10
  },
  btnCon: {
    padding: 11,
    borderRadius: 19,
    flex: 1,
    marginRight: 5,
    alignItems: "center",
    borderWidth:0.5,
    borderColor:"gray"
  },
  btnText:{
    color:"#fff",
    fontSize:16,
    fontWeight:"600"
  },
  rectangle: {
    height: 250,
    width: 250,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 10,
  },
  rectangleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: "#fff"
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    height: hp(10),
  },
  backIcon: {
    marginRight: wp(28),
  },
  chainCon:{
    backgroundColor:"black",
    flexDirection:"row",
    margin:3,
    borderRadius:10,
    padding:10,
    alignItems:"center"
  },
  chainImgCon:{
    width:58,
    height:45,
    justifyContent:"center",
    alignContent:"center",
    backgroundColor:"#23262F",
    padding:3,
    borderRadius:10
  },
  chainImg:{
    width:35,
    height:35,
    alignSelf:"center"
  },
  chianInfoCon:{
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"flex-start",
    margin:5,
    marginLeft:10
  },
  chianSymbol:{
    color:"#fff",
    fontSize:16.9,
    fontWeight:"600"
  },
  chianAddress:{
    color:"gray",
    fontSize:14,
    fontWeight:"400"
  },
  baseText: {
    marginTop:10,
    marginBottom:3,
    marginLeft:10,
    fontSize: 14,
    textAlign:"left",
    color:"gray",
    fontWeight:"600"
  },
});
