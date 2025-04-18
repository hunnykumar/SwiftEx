import { ActivityIndicator, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import darkBlue from "../../assets/darkBlue.png"
import brridge_new from "../../assets/brridge_new.png"
import Icon from "../icon"
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import RecieveAddress from "./Modals/ReceiveAddress";
import { useState } from "react";
import { useEffect } from "react";
import { REACT_APP_HOST, REACT_APP_LOCAL_TOKEN } from "./exchange/crypto-exchange-front-end-main/src/ExchangeConstants";
import AsyncStorageLib from "@react-native-async-storage/async-storage";
import { GET, authRequest } from "./exchange/crypto-exchange-front-end-main/src/api";
import { delay } from "lodash";
import { alert } from "./reusables/Toasts";
import { Grid, LineChart, XAxis, YAxis } from "react-native-svg-charts";
import { Area, Chart, HorizontalAxis, Line, Tooltip, VerticalAxis } from "react-native-responsive-linechart";
import { useSelector } from "react-redux";
const Asset_info = ({ route }) => {
  const state = useSelector((state) => state);
    const FOUCUSED = useIsFocused();
    const { asset_type } = route.params;
    const navigation = useNavigation()
    const [visible, setVisible] = useState(false);
    const [iconType, seticonType] = useState("");
    const [open, setOpen] = useState(false);
    const [Loading, setLoading] = useState(false);
    const [chart_show, setchart_show] = useState(true);
    const [final, setfinal] = useState([]);
    const [chart, setchart] = useState([]);
    const [Profile, setProfile] = useState({
        isVerified: false,
        firstName: "jane",
        lastName: "doe",
        email: "xyz@gmail.com",
        phoneNumber: "93400xxxx",
        isEmailVerified: false,
    });
    const [token, settoken] = useState("");
    const [timeData, setTimeData] = useState([
        "5m",
        "10m",
        "15m",
        "20m",
        "25m",
        "30m",
    ]);
    const [tooltip_info_0, settooltip_info_0] = useState(false);
    const [tooltip_info_1, settooltip_info_1] = useState(false);
    const [tooltip_info_2, settooltip_info_2] = useState(false);
    useEffect(() => {
        const timeoutId = setTimeout(()=>{hide_tooltips()}, 2000);
        return () => clearTimeout(timeoutId);
      }, [tooltip_info_0,tooltip_info_1,tooltip_info_2]);
      const hide_tooltips=()=>{
        settooltip_info_0(false)
        settooltip_info_1(false)
        settooltip_info_2(false)
      }

      useEffect(() => {
        const fetch_inisitiol=async()=>{
            try {
                settooltip_info_0(false)
                settooltip_info_1(false)
                settooltip_info_2(false)
                const token_1 = await AsyncStorageLib.getItem(REACT_APP_LOCAL_TOKEN);
                settoken(token_1)
                setchart_show(true)
                setLoading(true)
                setVisible(false);
                seticonType("");
                setTimeout(() => {
                    handle_asset_call(asset_type)
                getChart(asset_type)
                }, 500);
            } catch (error) {
                console.log("error fetch chart",error)
            }
        }
        fetch_inisitiol()
    }, [])
    // useEffect(async() => {
    //     settooltip_info_0(false)
    //     settooltip_info_1(false)
    //     settooltip_info_2(false)
    //     const token_1 = await AsyncStorageLib.getItem(REACT_APP_LOCAL_TOKEN);
    //     settoken(token_1)
    //     setchart_show(true)
    //     setLoading(true)
    //     setVisible(false);
    //     seticonType("");
    //     setTimeout(() => {
    //         handle_asset_call(asset_type)
    //     getChart(asset_type)
    //     }, 500);
    // }, [])

    const handle_asset_call = async (asset_type) => {
        asset_type === "XLM" ? feth_detial_Xlm() : fetchKline()
    }

    async function feth_detial_Xlm() {
        const myHeaders = new Headers();
        myHeaders.append("Cookie", "__cf_bm=jRWWuUDURQauf2.SdUFF5sQR5mN9SPjAeIRyk2xz6BE-1720688680-1.0.1.1-PZT64WLNsnH8o3HpegJCfI1zfCFYFPay83.rJCKEWPD4psmNDHv0RqDAqcW3JDmDYjs2CK.PPlu3jEWIruNWzQ");

        const requestOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
        };

        fetch("https://api.coingecko.com/api/v3/coins/stellar", requestOptions)
            .then((response) => response.json())
            .then((result) => {
                let temp=[
                    {
                        current_price:result.market_data.current_price.usd,
                        high_24h:result.market_data.high_24h.usd,
                        low_24h:result.market_data.low_24h.usd,
                        market_cap:result.market_data.market_cap.usd,
                        total_volume:result.market_data.total_volume.usd,
                        total_supply:result.market_data.total_supply,
                        price_change_percentage_24h:result.market_data.price_change_percentage_24h,
                    }
                ];
                setfinal(temp)
                delay(() => {
                    setLoading(false);
                }, 100)
            }
            )
            .catch((error) => console.error(error));
    }

    async function getChart(name) {

        await fetch(
            `https://api.binance.com/api/v1/klines?symbol=${name}USDT&interval=1h&limit=5`,
            {
                method: "GET",
            }
        )
            .then((resp) => resp.json())
            .then((resp) => {
                const trades = resp.map((interval) => parseFloat(interval[1]));
                //   setchart(trades)
                const firstTrade = trades[0];
                const lastTrade = trades.slice(-1)[0];
                const percent = (
                    ((lastTrade - firstTrade) / firstTrade) *
                    100
                ).toFixed(2);
                //   setchart(trades)
                const transformedData = resp.map(item => ({
                    x: new Date(item[0]), // Use the timestamp for x
                    y: parseFloat(item[4]) // Use the closing price for y
                }));

                console.log("8******************_____", transformedData);
                setchart(transformedData)
                setchart_show(false)
            })
            .catch((err) => {
                console.log(err);
            });
    }

    const fetchKline = async () => {
        try {
            const raw = "";
            const requestOptions = {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            };
            await fetch(REACT_APP_HOST + "/market-data/getcryptodata", requestOptions)
                .then((response) => response.json())
                .then((responseJson) => {
                    res_find(responseJson[0].MarketData)
                })
                .catch((error) => {
                    console.error(error);
                    alert("error", "Somthing went worng");
                });
        } catch (error) {
            console.log(error);
        }
    };
    const res_find = async (Data) => {
        let find_temp = "";
        find_temp = asset_type;
        const filteredData = Data.filter(item => item.symbol === find_temp.toLowerCase());
        setfinal(filteredData);
        delay(() => {
            setLoading(false);
        }, 100);

    }
    const trade_bridge = async () => {
        // const LOCAL_TOKEN = REACT_APP_LOCAL_TOKEN;
        // const token = await AsyncStorageLib.getItem(REACT_APP_LOCAL_TOKEN);
        token ? navigation.navigate("classic",{Asset_type:asset_type==="XLM"?"ETH":asset_type}) : navigation.navigate("exchangeLogin")
    }
    const cashout_manage = async () => {
        // const LOCAL_TOKEN = REACT_APP_LOCAL_TOKEN;
        // const token = await AsyncStorageLib.getItem(LOCAL_TOKEN);
        token ? navigation.navigate("payout") : navigation.navigate("exchangeLogin")
    }
    const trade_manage = async () => {
        // const LOCAL_TOKEN = REACT_APP_LOCAL_TOKEN;
        // const token = await AsyncStorageLib.getItem(LOCAL_TOKEN);
        token ? await for_trading() : navigation.navigate("exchangeLogin")
    }
    const for_trading = async () => {
        try {
            const { res, err } = await authRequest("/users/getUserDetails", GET);
            if (err) return [navigation.navigate("exchangeLogin")];
            setProfile(res);
            await getOffersData()
        } catch (err) {
            console.log(err)
        }
    };
    const getOffersData = async () => {
        try {
            // const { res, err } = await authRequest("/offers", GET);
            // if (err) return console.log(`${err.message}`);
            //  setOffers(res);
        } catch (err) {
            console.log(err)
        }

        navigation.navigate("newOffer_modal", {
            user: { Profile },
            open: { open },
            getOffersData: { getOffersData }
        });

    }


    return (
        <>
            <View style={[styles.container,{backgroundColor:state.THEME.THEME===false?"#4CA6EA":"black",borderBottomColor:"gray",borderWidth:0.5}]}>
                <TouchableOpacity onPress={(() => navigation.goBack())}>
                    <Icon type={'antDesign'} name='left' size={29} color={'white'} style={styles.icon} />
                </TouchableOpacity>
                <Text style={styles.text}>{asset_type}</Text>
                <TouchableOpacity onPress={(() => navigation.navigate("Home"))}>
                    <Image source={darkBlue} style={styles.image} />
                </TouchableOpacity>
            </View>
            <ScrollView style={[styles.main_con,{backgroundColor:state.THEME.THEME===false?"#fff":"black"}]}>
                <View style={[styles.chart_con,{backgroundColor:state.THEME.THEME===false?"#fff":"black"}]}>
                    {chart_show === false ? <Chart
                        style={{ height: hp(35), width: wp(99), padding: 1 }}
                        data={chart}
                        padding={{ left: 40, bottom: 30, right: 20, top: 30 }}
                        xDomain={{ min: new Date(chart[0].x).getTime(), max: new Date(chart[chart.length - 1].x).getTime() }}
                        yDomain={{ min: Math.min(...chart.map(d => d.y)), max: Math.max(...chart.map(d => d.y)) }}
                    >
                        <VerticalAxis tickCount={10} theme={{ grid:{visible:false},labels: { formatter: (v) => v.toFixed(2),label:{color:state.THEME.THEME===false?"black":"#fff"} } }} />
                        <HorizontalAxis tickCount={10} theme={{
                            grid:{visible:false},
                            labels: {
                                formatter: (v) => {
                                    const date = new Date(v);
                                    return `${date.getHours()}:${date.getMinutes()}`;
                                },
                                label:{color:state.THEME.THEME===false?"black":"#fff"}
                            },
                        }} />
                        <Area theme={{ gradient: { from: { color: '#44bd32' }, to: { color: '#44bd32', opacity: 0.2 } } }} />
                        <Line
                            tooltipComponent={<Tooltip theme={{ label: {
                                color: 'white',
                                fontSize: 12,
                                fontWeight: 700,
                                textAnchor: 'middle',
                                opacity: 1,
                                dx: 0,
                                dy: 16.5,
                              },
                              shape: {
                                width: 50,
                                height: 20,
                                dx: 0,
                                dy: 20,
                                rx: 4,
                                color: 'black',
                              },
                              }}/>}
                            theme={{ stroke: { color: '#44bd32', width: 5 }, scatter: { default: { width: 8, height: 8, rx: 4, color: '#44ad32' }, selected: { color: 'red' } } }}
                        />
                    </Chart> : <ActivityIndicator color={state.THEME.THEME===false?"green":"#fff"} size={"large"} />}

                </View>
                <View style={[styles.opt_con,{backgroundColor:state.THEME.THEME===false?"#fff":"black",borderColor:"gray",borderWidth:0.5}]}>
                    <TouchableOpacity onPress={() => { settooltip_info_0(true),settooltip_info_1(false),settooltip_info_2(false) }} style={styles.tooltip_con}>
                        {tooltip_info_0 ? <View style={[styles.tooltip_con_txt,{backgroundColor:state.THEME.THEME===false?"#fff":"black"}]}>
                            <Text style={{color:state.THEME.THEME===false?"black":"#fff",textAlign:"center"}}>Allbridge enables cross-chain asset transfers between multiple blockchain networks.</Text>
                        </View> :
                            <Icon
                                name={"information-outline"}
                                type={"materialCommunity"}
                                color={"rgba(129, 108, 255, 0.97)"}
                                size={21}
                            />}
                    </TouchableOpacity>
                    <TouchableOpacity disabled={chart_show&&Loading} style={styles.opt_cons} onPress={() => {
                        asset_type === "XLM" ? navigation.navigate("SendXLM") :
                            navigation.navigate("Send", {
                                token: asset_type === "ETH" ? "Ethereum" : asset_type,
                            })
                    }}>
                        <Icon type={'materialCommunity'} name='arrow-top-right' size={25} color={chart_show&&Loading?"gray":"#4CA6EA"} style={styles.opt_icon} />
                        <Text style={[styles.opt_text,{color:state.THEME.THEME===false?"black":"#fff"}]}>Send</Text>
                    </TouchableOpacity>
                    <TouchableOpacity  style={styles.opt_cons} disabled={chart_show&&Loading||asset_type==="XRP"} onPress={async() => { await trade_bridge() }}>
                        <Image source={brridge_new} style={styles.image_brige} />
                        {/* <Icon type={'materialCommunity'} name='swap-horizontal-variant' size={25} color={"#4CA6EA"} style={styles.opt_icon} /> */}
                        <Text style={[styles.opt_text,{color:state.THEME.THEME===false?"black":"#fff"}]}>Bridge & Trade</Text>
                    </TouchableOpacity>
                    <TouchableOpacity disabled={chart_show&&Loading} style={styles.opt_cons} onPress={() => {
                        setVisible(true);
                        seticonType(asset_type);
                    }}>
                        <Icon type={'materialCommunity'} name='arrow-bottom-left' size={25} color={chart_show&&Loading?"gray":"#4CA6EA"} style={styles.opt_icon} />
                        <Text style={[styles.opt_text,{color:state.THEME.THEME===false?"black":"#fff"}]}>Request</Text>
                    </TouchableOpacity>
                </View>
                <View style={[styles.opt_other,{backgroundColor:state.THEME.THEME===false?"#fff":"black"}]}>
                    <View style={[styles.T_C_con,{backgroundColor:state.THEME.THEME===false?"#fff":"black"}]}>
                    <TouchableOpacity onPress={() => { settooltip_info_0(false),settooltip_info_1(true),settooltip_info_2(false) }} style={[styles.tooltip_con,{marginLeft: wp(30),}]}>
                        {tooltip_info_1 ? <View style={[styles.tooltip_con_txt,{backgroundColor:state.THEME.THEME===false?"#fff":"black"}]}>
                            <Text style={{color:state.THEME.THEME===false?"black":"#fff",textAlign:"center"}}>Trading involves buying, selling, or exchanging cryptocurrencies for profit.</Text>
                        </View> :
                            <Icon
                                name={"information-outline"}
                                type={"materialCommunity"}
                                color={"rgba(129, 108, 255, 0.97)"}
                                size={21}
                            />}
                    </TouchableOpacity>
                        <TouchableOpacity disabled={chart_show&&Loading} style={styles.opt_other_cons} onPress={async() => { await  trade_manage() }}>
                            <Icon type={'materialCommunity'} name='chart-timeline-variant' size={25} color={chart_show&&Loading?"gray":"#4CA6EA"} style={styles.opt_icon} />
                            <Text style={[styles.opt_other_text,{color:state.THEME.THEME===false?"black":"#fff"}]}>Trade</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { settooltip_info_0(false),settooltip_info_1(false),settooltip_info_2(true) }} style={[styles.tooltip_con,{marginLeft: wp(70),}]}>
                        {tooltip_info_2 ? <View style={[styles.tooltip_con_txt,{backgroundColor:state.THEME.THEME===false?"#fff":"black",marginLeft: wp(-20)}]}>
                            <Text style={{color:state.THEME.THEME===false?"black":"#fff",textAlign:"center"}}>Cashout involves converting assets or cryptocurrencies into fiat money.</Text>
                        </View> :
                            <Icon
                                name={"information-outline"}
                                type={"materialCommunity"}
                                color={"rgba(129, 108, 255, 0.97)"}
                                size={21}
                            />}
                    </TouchableOpacity>
                        <TouchableOpacity disabled={chart_show&&Loading} style={styles.opt_other_cons} onPress={async() => { await cashout_manage() }}>
                            <Icon type={'materialCommunity'} name='cash' size={25} color={chart_show&&Loading?"gray":"#4CA6EA"} style={styles.opt_icon} />
                            <Text style={[styles.opt_other_text,{color:state.THEME.THEME===false?"black":"#fff"}]}>Cashout</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.horizontalLine} />
                    {Loading === true ? <ActivityIndicator color={state.THEME.THEME===false?"green":"#fff"} size={"large"} style={{ alignSelf: "center" }} /> :
                        final.map((list, index) => {
                            return (
                                <>
                                    <Text style={[styles.opt_market_head, { marginTop: hp(1),color:state.THEME.THEME===false?"black":"#fff" }]}>{asset_type} price (24H)</Text>
                                    <View style={{ flexDirection: "row", padding: 4 }}>
                                        <View style={{ width: wp(40) }}>
                                            <Text style={[styles.opt_market_head, { fontSize: 14,color:state.THEME.THEME===false?"black":"#fff" }]}>Price</Text>
                                            <Text style={[styles.opt_market_head, { marginTop: -10, fontSize: 15,color:state.THEME.THEME===false?"black":"#fff" }]}>{asset_type === "XLM" ? list.current_price : asset_type === "XLM" ? list.current_price : list.current_price} price (24H)</Text>
                                        </View>
                                        <View>
                                            <Text style={[styles.opt_market_head, { fontSize: 14,color:state.THEME.THEME===false?"black":"#fff" }]}>Price (USD)</Text>
                                            <Text style={[styles.opt_market_head, { marginTop: -10, fontSize: 15,color:state.THEME.THEME===false?"black":"#fff" }]}>{asset_type === "XLM" ? list.current_price : list.current_price}$</Text>
                                        </View>
                                    </View>
                                    <View style={{ flexDirection: "row", marginLeft: 1.9 }}>
                                        <View style={{ width: wp(40) }}>
                                            <Text style={[styles.opt_market_head, { fontSize: 14,color:state.THEME.THEME===false?"black":"#fff" }]}>24H high</Text>
                                            <Text style={[styles.opt_market_head, { marginTop: -10, fontSize: 15,color:state.THEME.THEME===false?"black":"#fff" }]}>{asset_type === "XLM" ? list.high_24h : list.high_24h}$</Text>
                                        </View>
                                        <View>
                                            <Text style={[styles.opt_market_head, { fontSize: 14,color:state.THEME.THEME===false?"black":"#fff" }]}>24H low</Text>
                                            <Text style={[styles.opt_market_head, { marginTop: -10, fontSize: 15,color:state.THEME.THEME===false?"black":"#fff" }]}>{asset_type === "XLM" ? list.low_24h : list.low_24h}$</Text>
                                        </View>
                                    </View>

                                    {/* Market */}
                                    <View style={styles.horizontalLine} />
                                    <Text style={[styles.opt_market_head, { marginTop: hp(1), marginLeft: 1 ,color:state.THEME.THEME===false?"black":"#fff"}]}>Market stats</Text>
                                    <View style={{ flexDirection: "row", padding: 4 }}>
                                        <View style={{ width: wp(40) }}>
                                            <Text style={[styles.opt_market_head, { fontSize: 14,color:state.THEME.THEME===false?"black":"#fff" }]}>Market cap</Text>
                                            <Text style={[styles.opt_market_head, { marginTop: -10, fontSize: 15,color:state.THEME.THEME===false?"black":"#fff" }]}>{asset_type === "XLM" ? list.market_cap : list.market_cap}$</Text>
                                        </View>
                                        <View>
                                            <Text style={[styles.opt_market_head, { fontSize: 14,color:state.THEME.THEME===false?"black":"#fff" }]}>Volume</Text>
                                            <Text style={[styles.opt_market_head, { marginTop: -10, fontSize: 15,color:state.THEME.THEME===false?"black":"#fff" }]}>{asset_type === "XLM" ? list.total_volume : list.total_volume}</Text>
                                        </View>
                                    </View>
                                    <View style={{ flexDirection: "row", marginLeft: 1.9 }}>
                                        <View style={{ width: wp(40) }}>
                                            <Text style={[styles.opt_market_head, { fontSize: 14,color:state.THEME.THEME===false?"black":"#fff" }]}>Supply</Text>
                                            <Text style={[styles.opt_market_head, { marginTop: -10, fontSize: 15,color:state.THEME.THEME===false?"black":"#fff" }]}>{asset_type === "XLM" ? list.total_supply : list.total_supply}</Text>
                                        </View>
                                        <View>
                                            <Text style={[styles.opt_market_head, { fontSize: 14,color:state.THEME.THEME===false?"black":"#fff" }]}>Price changes % 24h</Text>
                                            <Text style={[styles.opt_market_head, { marginTop: -10, fontSize: 15,color:state.THEME.THEME===false?"black":"#fff" }]}>{asset_type === "XLM" ? list.price_change_percentage_24h : list.price_change_percentage_24h}</Text>
                                        </View>
                                    </View>
                                </>
                            )
                        })}

                </View>
                <RecieveAddress
                    modalVisible={visible}
                    setModalVisible={setVisible}
                    iconType={iconType}
                />

            </ScrollView>
        </>
    )
}
const styles = StyleSheet.create({
    container: {
        backgroundColor: "#4CA6EA",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        height: Platform.OS === "ios" ? hp(8.5) : hp(10), // Adjust as needed
        paddingHorizontal:  Platform.OS === "ios" ? wp(3.5):wp(2),
    },
    icon: {
        paddingVertical: hp(1.9),
    },
    text: {
        color: "white",
        fontSize: Platform.OS === "ios" ? 19 : 17,
        fontWeight: Platform.OS === "ios" ? "normal" : "bold",
        textAlign: "center",
        flex: 1,
        marginLeft: 19.5,
        marginTop:Platform.OS === "ios" ?hp(4):hp(0)
    },
    image: {
        height: hp(9),
        width: wp(12),
    },
    image_brige: {
        marginTop: hp(1.3),
        height: hp(3),
        width: wp(9),
        marginBottom: hp(1)
    },
    main_con: {
        height: hp(100),
        width: wp(100),
        backgroundColor: "#e6e6e6"
    },
    chart_con: {
        height: hp(39),
        width: wp(100),
        backgroundColor: "#e6e6e6",
        padding: 4
    },
    opt_con: {
        height: hp(10.5),
        flexDirection: "row",
        width: wp(95),
        backgroundColor: "#fff",
        alignSelf: "center",
        borderRadius: 10,
        marginTop: -25,
        justifyContent: "space-around",
        alignItems: "center"
    },
    opt_other: {
        // height: hp(9.5),
        width: wp(95),
        backgroundColor: "#fff",
        alignSelf: "center",
        borderRadius: 10,
        marginTop: 13,
        alignItems: "flex-start",
        paddingLeft: 19,
        marginBottom: hp(3),
        paddingBottom: hp(1)
    },
    T_C_con: {
        flexDirection: "row",
        width: wp(80),
        height: hp(10),
        backgroundColor: "#fff",
        alignItems: "flex-start",
        justifyContent: "space-around",
    },
    opt_text: {
        color: "black",
        fontSize: 13
    },
    opt_icon: {
        paddingVertical: hp(1),
    },
    opt_cons: {
        alignItems: "center",
    },
    opt_other_text: {
        color: "black",
        fontSize: 14,
        marginLeft: 10
    },
    opt_market_head: {
        color: "black",
        fontSize: 16,
        padding: 5,
        fontWeight: "500"
    },
    opt_other_cons: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "center",
        borderColor: "#4CA6EA",
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: wp(3),
        width: wp(30)
    },
    horizontalLine: {
        height: 1,
        width: wp(80),
        backgroundColor: 'gray',
        marginVertical: 5,
        marginTop: hp(2)
    },
    tooltip_con: {
        position: "absolute",
        zIndex: 10,
        alignSelf: "flex-start",
        marginLeft: wp(40),
        marginTop: hp(2)
    },
    tooltip_con_txt:{
        marginTop: hp(-2),
        width:wp(35),
        borderRadius:14,
        borderColor: "#4CA6EA",
        borderWidth:3
    }
});

export default Asset_info;