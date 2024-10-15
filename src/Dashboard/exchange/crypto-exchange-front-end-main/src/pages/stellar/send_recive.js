import { useIsFocused, useNavigation } from "@react-navigation/native";
import { Alert, Image, Linking, Modal, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { REACT_APP_LOCAL_TOKEN } from "../../ExchangeConstants";
import { useEffect, useRef, useState } from "react";
import Icon from "../../../../../../icon";
import darkBlue from "../../../../../../../assets/darkBlue.png";
import Bridge from "../../../../../../../assets/Bridge.png";
import QRCode from "react-native-qrcode-svg";
import AsyncStorageLib from "@react-native-async-storage/async-storage";
import { useSelector } from "react-redux";
import { RNCamera } from 'react-native-camera';


const send_recive = ({route}) => {
    const {bala,asset_name}=route.params;
    console.log("---------------------------------",bala,asset_name)
  const cameraRef = useRef(null);
    const state = useSelector((state) => state);
    const FOCUSED = useIsFocused();
    const navigation = useNavigation();
    const [modalContainer_menu, setmodalContainer_menu] = useState(false);
    const [mode_selected, setmode_selected] = useState("SED");
    const [recepi_address, setrecepi_address] = useState("");
    const [recepi_memo, setrecepi_memo] = useState("");
    const [recepi_amount, setrecepi_amount] = useState("");
    const [qrData, setQrData] = useState('');

    const [qrvalue, setqrvalue] = useState("");
    const [isModalVisible, setModalVisible] = useState(false);
    const onBarCodeRead = (e) => {
        if (e.data !== qrData) { 
          setQrData(e.data);
          Alert.alert("QR Code ","QR Code Decoded successfully..");
          setrecepi_address("");
          setrecepi_address(e.data);
          toggleModal();
        }
      };
    const toggleModal = () => {
        setModalVisible(!isModalVisible);
      };

    const get_data=async()=>{
        // const storedData = await AsyncStorageLib.getItem('myDataKey');
        //     const parsedData = JSON.parse(storedData);
        //     const matchedData = parsedData.filter(item => item.Ether_address === state.wallet.address);
        //     const publicKey = matchedData[0].publicKey;
            setqrvalue(state.STELLAR_PUBLICK_KEY)
    }
    useEffect(() => {
        get_data()
        setmode_selected("SED");
    }, [FOCUSED])
    return (
        <>
            <View style={styles.headerContainer1_TOP}>
                <View
                    style={{
                        justifyContent: "space-around",
                        flexDirection: "row",
                        alignItems: "center",
                    }}
                >
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon
                            name={"left"}
                            type={"antDesign"}
                            size={28}
                            color={"white"}
                        />
                    </TouchableOpacity>
                </View>

                {Platform.OS === "android" ? (
                    <Text style={[styles.text_TOP, { marginStart: wp(28) }]}>Transaction</Text>
                ) : (
                    <Text style={[styles.text_TOP, styles.text1_ios_TOP]}>Transaction</Text>
                )}

                <TouchableOpacity onPress={() => navigation.navigate("Home")}>
                    <Image source={darkBlue} style={[styles.logoImg_TOP, { marginLeft: Platform.OS==="android"?wp(16):wp(13) }]} />
                </TouchableOpacity>

                <View style={{ alignItems: "center" }}>

                    <TouchableOpacity
                        onPress={() => {
                            setmodalContainer_menu(true)
                        }}
                    >
                        <Icon
                            name={"menu"}
                            type={"materialCommunity"}
                            size={30}
                            color={"#fff"}
                        />
                    </TouchableOpacity>
                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={modalContainer_menu}>

                        <TouchableOpacity style={styles.modalContainer_option_top} onPress={() => { setmodalContainer_menu(false) }}>
                            <View style={styles.modalContainer_option_sub}>

                                <TouchableOpacity style={styles.modalContainer_option_view}>
                                    <Icon
                                        name={"anchor"}
                                        type={"materialCommunity"}
                                        size={30}
                                        color={"gray"}
                                    />
                                    <Text style={styles.modalContainer_option_text}>Anchor Settings</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.modalContainer_option_view}>
                                    <Icon
                                        name={"badge-account-outline"}
                                        type={"materialCommunity"}
                                        size={30}
                                        color={"gray"}
                                    />
                                    <Text style={styles.modalContainer_option_text}>KYC</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.modalContainer_option_view}>
                                    <Icon
                                        name={"playlist-check"}
                                        type={"materialCommunity"}
                                        size={30}
                                        color={"gray"}
                                    />
                                    <Text style={styles.modalContainer_option_text}>My Subscription</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.modalContainer_option_view} onPress={() => {
                                    console.log('clicked');
                                    const LOCAL_TOKEN = REACT_APP_LOCAL_TOKEN;
                                    AsyncStorage.removeItem(LOCAL_TOKEN);
                                    setmodalContainer_menu(false)
                                    navigation.navigate('exchangeLogin');
                                }}>
                                    <Icon
                                        name={"logout"}
                                        type={"materialCommunity"}
                                        size={30}
                                        color={"#fff"}
                                    />
                                    <Text style={[styles.modalContainer_option_text, { color: "#fff" }]}>Logout</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.modalContainer_option_view} onPress={() => { setmodalContainer_menu(false) }}>
                                    <Icon
                                        name={"close"}
                                        type={"materialCommunity"}
                                        size={30}
                                        color={"#fff"}
                                    />
                                    <Text style={[styles.modalContainer_option_text, { color: "#fff" }]}>Close Menu</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </Modal>
                </View>
            </View>

            <View style={styles.main_con}>
                <View style={styles.mode_con}>
                    <TouchableOpacity style={[styles.mode_sele, { backgroundColor: mode_selected === "SED" ? "green" : "#011434" }]} onPress={() => { setmode_selected("SED") }}>
                        <Text style={styles.mode_text}>Send</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.mode_sele, { backgroundColor: mode_selected === "RVC" ? "green" : "#011434" }]} onPress={() => { setmode_selected("RVC") }}>
                        <Text style={styles.mode_text}>Receive</Text>
                    </TouchableOpacity>
                </View>
                {
                    mode_selected === "SED" ?
                        <>
                            <View style={[styles.text_input,{flexDirection:"row",alignItems:"center"}]}>
                            <TextInput placeholder="Enter stellar address" placeholderTextColor={"gray"} value={recepi_address} style={{height:"100%",width:"80%",fontSize:19,color:"#fff"}}  onChangeText={(value) => { setrecepi_address(value) }} />
                           <TouchableOpacity onPress={()=>{toggleModal();}}>
                            <Icon
                            name={"qrcode-scan"}
                            type={"materialCommunity"}
                            size={28}
                            color={"white"}
                            />
                            </TouchableOpacity>
                            </View>
                            <Text style={[styles.mode_text, { textAlign: "left", marginLeft: 19, fontSize: 16, marginTop: 10 }]}>Available: {bala}</Text>
                            <Text style={[styles.mode_text, { textAlign: "left", marginLeft: 19, fontSize: 18, marginTop: 15 }]}>Amount</Text>
                            <TextInput placeholder="Enter amount" placeholderTextColor={"gray"} value={recepi_amount} style={[styles.text_input,{marginTop: 2}]} onChangeText={(value) => { setrecepi_amount(value) }} />
                            <Text style={[styles.mode_text, { textAlign: "left", marginLeft: 19, fontSize: 18, marginTop: 15 }]}>Transaction memo</Text>
                            <TextInput placeholder="Enter transaction memo" placeholderTextColor={"gray"} value={recepi_memo} style={[styles.text_input,{marginTop: 2}]} onChangeText={(value) => { setrecepi_memo(value) }} />

                            <TouchableOpacity disabled={recepi_address.length <= 0} style={[styles.mode_sele, { height: 60, backgroundColor: recepi_address.length <= 0 ? "#011434" : "green", marginTop: 40, alignSelf: "center" }]} onPress={() => { }}>
                                <Text style={styles.mode_text}>Send</Text>
                            </TouchableOpacity>
                        </> :
                        <View style={styles.QR_con}>
                            <View style={{ alignSelf: "center", marginTop: hp(5) }}>
                                <QRCode
                                    value={qrvalue ? qrvalue : "NA"}
                                    size={250}
                                    color="black"
                                    backgroundColor="white"
                                    logo={{
                                        url: "https://raw.githubusercontent.com/AboutReact/sampleresource/master/logosmalltransparen.png",
                                    }}
                                    logoSize={30}
                                    logoMargin={2}
                                    logoBorderRadius={15}
                                />
                            </View>
                            <Text style={styles.addressTxt}>
                                {qrvalue ? qrvalue : ""}
                            </Text>
                        </View>
                }
            <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={toggleModal}
      >
        {/* <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <View style={{ backgroundColor: '#145DA0', padding: 20, borderRadius: 10,width:"90%",height:"50%" }}>
            <Text style={{color:"white",fontWeight:"700",alignSelf:"center",fontSize:19}} onPress={()=>{
              toggleModal();
            }}>Scan QR.</Text>
              <View style={styles.QR_scan_con}>
                <RNCamera
                  ref={cameraRef}
                  style={styles.preview}
                  onBarCodeRead={onBarCodeRead}
                  captureAudio={false}
                >
                  <View style={styles.rectangleContainer}>
                    <View style={styles.rectangle} />
                  </View>
                </RNCamera>
              </View>
          </View>
        </View> */}
       <RNCamera
      ref={cameraRef}
      style={styles.preview}
      onBarCodeRead={onBarCodeRead}
      captureAudio={false}
    >{({ status }) => {
        console.log("****----",status)
        if (status==="NOT_AUTHORIZED")
        {
          setModalVisible(false),
          Alert.alert("Camera Permissions Required.","Please enable camera permissions in settings to scan QR code.",
          [
            {text:"Close",style:"cancel"},
            {text:"Open",onPress:()=>{
                Linking.openSettings()
            }},
          ])
        }
        if(status==="READY")
        {
            setModalVisible(true)
        }
        return (
         <>
         <View style={styles.header}>
            <TouchableOpacity onPress={()=>{setModalVisible(false)}}>
      <Icon name="arrow-left" size={24} color="#fff" style={styles.backIcon}/>
            </TouchableOpacity>
      <Text style={[styles.title,{marginTop:Platform.OS==="ios"?hp(5):0}]}>Scan QR Code</Text>
    </View>
      <View style={styles.rectangleContainer}>
        <View style={styles.rectangle}>
          <View style={styles.innerRectangle} />
        </View>
      </View>
         </>
          )
        }}
    </RNCamera>
        
      </Modal>
            </View>
        </>
    )
}
const styles = StyleSheet.create({
    main_con: {
        backgroundColor: "#011434",
        height: "100%"
    },
    QR_con: {
        alignSelf: "center",
        marginTop: hp(10),
        backgroundColor: "#fff",
        height: 390,
        width: 300,
        borderRadius: 10
    },
    addressTxt: {
        marginTop: hp(3),
        width: wp(65),
        alignSelf: "center",
        color: "black",
        fontWeight: "600"
    },
    mode_con: {
        height: 60,
        width: "100%",
        flexDirection: "row",
        alignSelf: "center",
        justifyContent: "space-around",
        marginTop: 10
    },
    text_input: {
        alignSelf: "center",
        color: "#fff",
        height: 50,
        width: "95%",
        fontSize: 20,
        borderWidth: 1.9,
        borderColor: "rgba(72, 93, 202, 1)rgba(67, 89, 205, 1)",
        borderRadius: 19,
        paddingLeft: 10,
        marginTop: 19
    },
    mode_text: {
        color: "#fff",
        textAlign: "center",
        fontSize: 21,
        fontWeight: "bold",
    },
    mode_sele: {
        height: "90%",
        width: "45%",
        borderWidth: 1.9,
        borderColor: "rgba(72, 93, 202, 1)rgba(67, 89, 205, 1)",
        borderRadius: 19,
        justifyContent: "center"
    },
    headerContainer1_TOP: {
        backgroundColor: "#4CA6EA",
        justifyContent: "space-between",
        alignItems: "center",
        alignSelf: "center",
        flexDirection: "row",
        width: wp(100),
        paddingHorizontal: wp(0.3),
    },
    logoImg_TOP: {
        height: hp("8"),
        width: wp("12"),
        marginLeft: wp(22),
    },
    text_TOP: {
        color: "white",
        fontSize: 19,
        fontWeight: "bold",
        alignSelf: "center",
        marginStart: wp(34)
    },
    text1_ios_TOP: {
        // alignSelf:"center",
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        paddingTop:hp(3),
        marginStart: wp(29)
    },
    modalContainer_option_top: {
        // flex: 1,
        alignSelf: "flex-end",
        alignItems: 'center',
        // backgroundColor: 'rgba(0, 0, 0, 0.3)',
        width: "100%",
        height: "60%",
    },
    modalContainer_option_sub: {
        alignSelf: "flex-end",
        backgroundColor: 'rgba(33, 43, 83, 1)',
        padding: 10,
        borderRadius: 10,
        width: "65%",
        height: "70%"
    },
    modalContainer_option_view: {
        flexDirection: "row",
        marginTop: 25,
        alignItems: "center",
    },
    modalContainer_option_text: {
        fontSize: 20,
        fontWeight: "bold",
        color: "gray",
        marginStart: 5
    },
    QR_scan_con:{
        width:wp(80),
        height:hp(40),
        borderRadius:5,
        justifyContent:"center",
        alignItems:"center"
      },
      preview: {
        flex:1
      },
      rectangleContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      rectangle: {
        height: 250,
        width: 250,
        borderWidth: 2,
        borderColor: 'white',
        borderRadius: 10,
      },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 16,
        height: 60,
      },
      backIcon: {
        marginRight:wp(28),
      },
      title: {
        fontSize: 18,
        fontWeight: 'bold',
        color:"#fff"
      },
})
export default send_recive;