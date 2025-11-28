import { useIsFocused, useNavigation } from "@react-navigation/native";
import { ActivityIndicator, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useEffect, useState } from "react";
import Icon from "../../../../../../icon";
import ethereum from "../../../../../../../assets/ethereum.png";
import stellar from "../../../../../../../assets/Stellar_(XLM).png";
import { useDispatch, useSelector } from "react-redux";
import Snackbar from "react-native-snackbar";
import { SET_ASSET_DATA } from "../../../../../../components/Redux/actions/type";
import { STELLAR_URL } from "../../../../../constants";
import { Exchange_screen_header } from "../../../../../reusables/ExchangeHeader";
import * as StellarSdk from '@stellar/stellar-sdk';
import ClaimableBalanceChecker from "./ClaimableBalanceChecker";
import stellarTokens from "./Tokens.json";
import Modal from "react-native-modal";
import { colors } from "../../../../../../Screens/ThemeColorsConfig";

const Assets_manage = ({ route }) => {
    const FOCUSED = useIsFocused();
    const navigation = useNavigation();
    const dispatch_ = useDispatch();
    const [TRUST_ASSET, setTRUST_ASSET] = useState(false);
    const [Loading, setLoading] = useState(null);
    const [Loading_assets_bal, setLoading_assets_bal] = useState(false);
    const [assets, setassets] = useState([
        {
            "asset_type": "native",
            "balance": "0.0000000",
            "buying_liabilities": "0.0000000",
            "selling_liabilities": "0.0000000",
        },
    ]);
    const state = useSelector((state) => state);

    const get_stellar = async () => {
        try {
            setLoading_assets_bal(true);
            StellarSdk.Networks.TESTNET;
            const server = new StellarSdk.Horizon.Server(STELLAR_URL.URL);
            const account = await server.loadAccount(state.STELLAR_PUBLICK_KEY);
            const tokenList = stellarTokens.assets;
            const updatedAssets = account.balances.map((bal) => {
                const match = tokenList.find(
                    (res) =>
                        res.code === bal.asset_code &&
                        (res.issuer === bal.asset_issuer || !res.issuer)
                );
                return {
                    ...bal,
                    icon: match?.icon || null,
                    name: match?.name || bal.asset_code || "Unknown",
                    org: match?.org || "Unknown",
                };
            });
            setassets(updatedAssets);
            dispatch_({
                type: SET_ASSET_DATA,
                payload: updatedAssets,
            });
            setLoading_assets_bal(false);
        } catch (error) {
            console.log("Error in get_stellar", error);
            setLoading_assets_bal(false);
        }
    };
    

    const AVL_ASSETS = [
        { name: 'USDC', domain: "USDC (center.io)", img: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png", issuerAddress: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN" },
        { name: 'EURC', domain: "EURC Coin", img:  "https://assets.coingecko.com/coins/images/26045/thumb/euro-coin.png?1655394420", issuerAddress: "GB3Q6QDZYTHWT7E5PVS3W7FUT5GVAFC5KSZFFLPU25GO7VTC3NM2ZTVO" },

    ];

    const changeTrust = async (domainName, domainIssuerAddress) => {
        setLoading(domainName)
        try {
            console.log(":++++ Entered into trusting ++++:")
            const server = new StellarSdk.Horizon.Server(STELLAR_URL.URL);
            StellarSdk.Networks.TESTNET
            const account = await server.loadAccount(StellarSdk.Keypair.fromSecret(state.STELLAR_SECRET_KEY).publicKey());
            const transaction = new StellarSdk.TransactionBuilder(account, {
                fee: StellarSdk.BASE_FEE,
                networkPassphrase: StellarSdk.Networks.TESTNET,
            })
                .addOperation(
                    StellarSdk.Operation.changeTrust({
                        asset: new StellarSdk.Asset(domainName, domainIssuerAddress),
                    })
                )
                .setTimeout(30)
                .build();
            transaction.sign(StellarSdk.Keypair.fromSecret(state.STELLAR_SECRET_KEY));
            const result = await server.submitTransaction(transaction);
            console.log(`Trustline updated successfully`);
            Snackbar.show({
                text: `${domainName} added successfully`,
                duration: Snackbar.LENGTH_SHORT,
                backgroundColor: 'green',
            });
            server.loadAccount(state.STELLAR_PUBLICK_KEY)
                .then(account => {
                    console.log('Balances for account:', state.STELLAR_PUBLICK_KEY);
                    account.balances.forEach(balance => {
                        setassets(account.balances)
                        setLoading(null)
                        dispatch_({
                            type: SET_ASSET_DATA,
                            payload: account.balances,
                        })
                        get_stellar()
                    });
                })
                .catch(error => {
                    console.log('Error loading account:', error);
                    setLoading(null)
                    Snackbar.show({
                        text: `${domainName} failed to be added`,
                        duration: Snackbar.LENGTH_SHORT,
                        backgroundColor: 'red',
                    });
                    get_stellar()
                });
        } catch (error) {
            console.error(`Error changing trust:`, error);
            setLoading(null)
            Snackbar.show({
                text: `${domainName} failed to be added`,
                duration: Snackbar.LENGTH_SHORT,
                backgroundColor: 'red',
            });
            get_stellar()
        }
    };

    const removeTrustLine = async (domainName, domainIssuerAddress) => {
        setLoading(domainName)
        try {
            console.log(":++++ Entered into remove trusting ++++:")
            const server = new StellarSdk.Horizon.Server(STELLAR_URL.URL);
            StellarSdk.Networks.TESTNET
            const account = await server.loadAccount(StellarSdk.Keypair.fromSecret(state.STELLAR_SECRET_KEY).publicKey());
            const transaction = new StellarSdk.TransactionBuilder(account, {
                fee: StellarSdk.BASE_FEE,
                networkPassphrase: StellarSdk.Networks.TESTNET,
            })
                .addOperation(
                    StellarSdk.Operation.changeTrust({
                        asset: new StellarSdk.Asset(domainName, domainIssuerAddress),
                        limit:"0"
                    })
                )
                .setTimeout(30)
                .build();
            transaction.sign(StellarSdk.Keypair.fromSecret(state.STELLAR_SECRET_KEY));
            const result = await server.submitTransaction(transaction);
            console.log("Trustline remove aand updated successfully",result);
            Snackbar.show({
                text: `${domainName} removed successfully`,
                duration: Snackbar.LENGTH_SHORT,
                backgroundColor: 'green',
            });
            server.loadAccount(state.STELLAR_PUBLICK_KEY)
                .then(account => {
                    console.log('Balances for account:', state.STELLAR_PUBLICK_KEY);
                    account.balances.forEach(balance => {
                        setassets(account.balances)
                        setLoading(null)
                        dispatch_({
                            type: SET_ASSET_DATA,
                            payload: account.balances,
                        })
                        get_stellar()
                    });
                })
                .catch(error => {
                    console.log('Error loading account:', error);
                    setLoading(null)
                    Snackbar.show({
                        text: `${domainName} failed to remove.`,
                        duration: Snackbar.LENGTH_SHORT,
                        backgroundColor: 'red',
                    });
                    get_stellar()
                });
        } catch (error) {
            console.error(`Error changing trust:`, error);
            setLoading(null)
            Snackbar.show({
                text: `${domainName} failed to remove.`,
                duration: Snackbar.LENGTH_SHORT,
                backgroundColor: 'red',
            });
            get_stellar()
        }
    };

    useEffect(() => {
        setTRUST_ASSET(route?.params?.openAssetModal || false);
        setLoading_assets_bal(false)
        get_stellar()
    }, [FOCUSED])


    const theme = state.THEME.THEME ? colors.dark : colors.light;

    return (
        <>
            <Exchange_screen_header title="Assets" onLeftIconPress={() => navigation.goBack()} onRightIconPress={() => console.log('Pressed')} />

            <View style={[styles.main_con, { backgroundColor: theme.bg }]}>
                <View style={styles.assetCon}>
                    {assets.map((list, index) => {
                        return (
                            <TouchableOpacity key={index} style={[styles.assetCard, { backgroundColor: theme.cardBg }]} onPress={() => { navigation.navigate("send_recive", { bala: list.balance, assetIssuer: list.asset_type === "native" ? "native" : list?.asset_issuer, asset_name: list.asset_type === "native" ? "native" : list.asset_code === "USDC" ? "USDC" : list.asset_code }) }}>
                                <View style={{flexDirection: "row",alignItems:"center",justifyContent:"center"}}>
                                    <View style={styles.assetImgCom}>
                                        {list.asset_type === "native"?<Image source={{uri:stellarTokens?.assets[0]?.icon}} width={43} height={43}/>:
                                        list.icon===null?<Text style={[styles.assetLatter,{color:theme.headingTx}]}>{list.asset_type === "native" ? "L" : list?.asset_code[0]?.toUpperCase() }</Text>:<Image source={{uri:list.icon}} width={43} height={43}/>}
                                    </View>
                                    <View style={{ flexDirection: "column",marginLeft:10 }}>
                                        <Text style={[styles.assetName, { color: theme.headingTx }]}>{list.asset_type === "native" ? "XLM" : list.asset_code}</Text>
                                        <Text style={[styles.domainName, { color: theme.inactiveTx }]}>{list?.asset_issuer ? list?.asset_issuer?.slice(0, 6) + "......" + list?.asset_issuer?.slice(-9) : "Native Lumens"}</Text>
                                    </View>
                                </View>
                                {Loading_assets_bal === true ? <ActivityIndicator color={"#4052D6"} /> : <Text style={[styles.assetName, { color: theme.headingTx }]}>{list.balance.slice(0, 6)}</Text>}
                            </TouchableOpacity>
                        )
                    })}
                </View>
                <TouchableOpacity style={styles.addAssets} onPress={() => { setTRUST_ASSET(true) }}>
                    <Icon name={"plus"} type={"antDesign"} size={24} color={"white"} />
                    <Text style={[styles.addAssetsText, { color: "#fff" }]}> Add Asset </Text>
                </TouchableOpacity>
            </View>
            <Modal
                isVisible={TRUST_ASSET}
                onBackdropPress={() => setTRUST_ASSET(false)}
                onBackButtonPress={() => setTRUST_ASSET(false)}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                useNativeDriver
                hideModalContentWhileAnimating
                style={styles.modal}
            >
                <View style={[styles.overlay,{backgroundColor:theme.cardBg}]}>
                    <View style={styles.Body}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between",width:wp(90)}}>
                       <View style={{flexDirection:"column",paddingVertical:10}}>
                       <Text style={[styles.modal_heading,{color:theme.headingTx}]}>Add Asset</Text>
                       <Text style={[styles.modal_heading,{color:theme.inactiveTx,fontSize:16,fontWeight:"300"}]}>Enable Trustline to Hold Asset</Text>
                       </View>
                        <TouchableOpacity onPress={() => { setTRUST_ASSET(false) }}>
                            <Icon
                                name={"close-circle-outline"}
                                type={"materialCommunity"}
                                size={35}
                                color={theme.headingTx}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={{flexDirection:"row",paddingHorizontal:16,paddingVertical:10,backgroundColor:"#FEF6D8",borderRadius:13,marginVertical:10,alignItems:"center"}}>
                    <Icon name={"information-circle-outline"} type={"ionicon"} size={28} color={"#ECB742"} />
                        <Text style={{fontSize:13,color:"#ECB742",fontWeight:"300",marginLeft:4}}>{`Trustlines let your wallet accept and hold \n approved assets.`}</Text>
                    </View>
                    {AVL_ASSETS.map((list, index) => {
                        return (
                            <View key={index} style={[styles.search_bar, { flexDirection: "row", justifyContent: "space-between", alignItems: "center",backgroundColor:theme.bg }]}>
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <Image source={{ uri: list.img }} style={styles.modal_IMG} />
                                    <View>
                                        <Text style={[styles.modal_sub_heading,{color:theme.headingTx}]}>{list.name}</Text>
                                        <Text style={[styles.modal_sub_heading, { fontSize: 10, color: theme.inactiveTx }]}>{list.domain}</Text>
                                    </View>
                                </View>
                                {assets.some((list_item) => list_item.asset_code === list.name) ?
                                    <TouchableOpacity style={[styles.btn,{backgroundColor:theme.cardBg}]} disabled={Loading!==null} onPress={()=>{removeTrustLine(list.name, list.issuerAddress)}}>
                                        {Loading === list.name ? <ActivityIndicator color={"#FFF"} /> : <Text style={[styles.modal_sub_heading,{fontSize:15,color:theme.headingTx}]}>Remove</Text>}
                                    </TouchableOpacity> :
                                    <TouchableOpacity style={[styles.btn,{backgroundColor:"#4052D6"}]} onPress={() => {
                                        changeTrust(list.name, list.issuerAddress)
                                    }} disabled={Loading!==null}>
                                        {Loading === list.name ? <ActivityIndicator color={"#FFF"} /> : <Text style={[styles.modal_sub_heading,{fontSize:15,color:theme.headingTx}]}>Add Asset</Text>}
                                    </TouchableOpacity>
                                }
                            </View>
                        )
                    })}
                    </View>
                </View>
            </Modal>
            <ClaimableBalanceChecker
                publicKey={state.STELLAR_PUBLICK_KEY}
                autoFetch={true}
                isDark={state.THEME.THEME}
            />
        </>
    )
}
const styles = StyleSheet.create({
    btn: {
        width:wp(24),
        height:hp(5),
        padding:10,
        borderRadius: 10,
        marginRight: 10,
        alignItems:"center",
        justifyContent:"center"
    },
    main_con: {
        height: "100%",
    },
    search_bar: {
        marginVertical:4,
        padding: 15,
        borderRadius: 10,
        color: "#fff"
    },
    assetCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 10,
        borderRadius: 10,
        paddingHorizontal: wp(3),
        paddingVertical: hp(1.3),
        marginHorizontal:5
    },
    assetLatter:{
        fontSize:35,
        fontWeight:"800",
        textAlign:"center"
    },
    assetImgCom:{
        padding:8,
        borderRadius:13,
        backgroundColor:"rgba(0, 0, 0, 0.15)",
        width:wp(14.5),
        height:hp(7),
        justifyContent:"center",
        alignItems:"center"
    },
    assetCon: {
        width: wp(100),
        marginTop: 10,
        padding: 10,
    },
    addAssets: {
        flexDirection: "row",
        bottom: hp(10),
        position: "absolute",
        right: wp(5),
        padding: 10,
        backgroundColor: "#4052D6",
        borderRadius: 10
    },
    addAssetsText: {
        fontSize: 18,
        fontWeight: "500"
    },
    assetName: {
        textAlign: "left",
        fontSize: 18,
    },
    domainName: {
        fontSize: 14
    },
    headerHeading: {
        color: "#fff",
        textAlign: "left",
        fontSize: 20,
        fontWeight: "400",
        paddingLeft: wp(5.5),
        paddingVertical: hp(1.2),
        marginTop: hp(2)
    },
    headerContainer1_TOP: {
        backgroundColor: "#4CA6EA",
        justifyContent: "space-between",
        alignItems: "center",
        alignSelf: "center",
        flexDirection: "row",
        width: wp(100),
        paddingHorizontal: wp(2),
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
        alignSelf: "center",
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        paddingTop: hp(3),
    },
    modalContainer_option_top: {
        alignSelf: "flex-end",
        alignItems: 'center',
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
    modal: {
        justifyContent: "flex-end",
        margin: 0,
      },
    overlay: {
        justifyContent: "flex-end",
        borderTopRightRadius:10,
        borderTopLeftRadius:10,
        padding: 19,
        alignItems: 'flex-start',
        marginTop: 60,
        paddingLeft: 16
    },
    Body: {
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        alignSelf: "center",
        justifyContent:"center",
        paddingHorizontal: 5,
    },
    modal_heading: {
        fontSize: 21,
        color: "#fff",
        fontWeight: "600"
    },
    modal_sub_heading: {
        fontSize: 18,
        color: "#fff",
        fontWeight: "600"
    },
    modal_IMG: {
        height: hp(5),
        width: wp(10.6),
        marginRight: wp(2)
    },
})
export default Assets_manage;