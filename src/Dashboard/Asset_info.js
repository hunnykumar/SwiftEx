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
import { Area, Chart, HorizontalAxis, Line, Tooltip, VerticalAxis } from "react-native-responsive-linechart";
import { useSelector } from "react-redux";
import { Wallet_screen_header } from "./reusables/ExchangeHeader";
import { LineChart } from "react-native-gifted-charts";
import Ether_image from "../../assets/ethereum.png";
import Stellar_image from "../../assets/Stellar_(XLM).png";
import Bnb_image from "../../assets/bnb-icon2_2x.png";


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
    const [lineColor, setlineColor] = useState();
    const [points_data,setpoints_data]=useState();
    const [points_data_time,setpoints_data_time]=useState();
    const [Profile, setProfile] = useState({
        isVerified: false,
        firstName: "jane",
        lastName: "doe",
        email: "xyz@gmail.com",
        phoneNumber: "93400xxxx",
        isEmailVerified: false,
    });
    const [token, settoken] = useState("");
    const [chartData, setchartData] = useState([]);
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
            `https://api.binance.com/api/v1/klines?symbol=${name}USDT&interval=1m&limit=30`,
            {
                method: "GET",
            }
        )
            .then((resp) => resp.json())
            .then((resp) => {
                const transformedData = resp.map(item => {
                    const timestamp = new Date(item[0]).toLocaleTimeString(); // Converts epoch to readable date
                    const closePrice = parseFloat(item[4]); // Close price
                    return { date: timestamp, value: closePrice };
                  });

                console.log("8******************_____", transformedData);
                setchart(transformedData)
                setpoints_data(transformedData[transformedData?.length-1]?.value);
                setpoints_data_time(transformedData[transformedData?.length-1]?.date);
                const chart_Data = resp.map(item => ({
                    x: new Date(parseInt(item[0])).getTime(),
                    y: parseFloat(item[4])
                  }));
                  setchartData(chart_Data)
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
            const { res, err } = await authRequest("/users/:id", GET);
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

    useEffect(()=>{
        const fetch_color=async()=>{
         try {
          const last_Value = chart[chart.length - 1].value;
          const second_LastValue = chart[chart.length - 2].value;
          const line_Color = last_Value > second_LastValue ? "green" : "red";
          setlineColor(line_Color)
         } catch (error) {
          console.log("*----",error)
         }
        }
        fetch_color()
      },[chart])
    return (
        <>
        <Wallet_screen_header title={asset_type} onLeftIconPress={() => navigation.goBack()} />
            <View style={[styles.main_con,{backgroundColor:state.THEME.THEME===false?"#fff":"black"}]}>
               <View style={{flexDirection:"row",paddingHorizontal:wp(4),paddingVertical:hp(0.3),alignItems:"center"}}>
               <Image source={asset_type==="ETH"?Ether_image:asset_type==="XLM"?Stellar_image:Bnb_image} style={{width:wp(6.5),height:hp(3)}}/>
               <Text style={[styles.chart_top,{color: state.THEME.THEME === false ? "black" : "#fff",fontSize:13,marginHorizontal:hp(0.3)}]}>{asset_type==="ETH"?"Ethereum":asset_type==="XLM"?"Lumens":"Binance"}</Text>
               </View>
                <Text style={[styles.chart_top,{color: state.THEME.THEME === false ? "black" : "#fff",marginVertical: hp(-0.5),}]}>$ {!points_data?0.00:points_data} </Text>
                <Text style={[styles.chart_top,{color: state.THEME.THEME === false ? "black" : "#fff",fontSize:13}]}>{points_data_time} </Text>
                <View style={[styles.chart_con,{backgroundColor:state.THEME.THEME===false?"#fff":"black"}]}>
                    {chart_show === false ? 
                        <View>
                            {/* <LineChart
                                hideRules
                                data={chart}
                                hideDataPoints
                                adjustToWidth
                                spacing={wp(90) / chart.length - 1}
                                isAnimated={true}
                                curved
                                color={lineColor}
                                xAxisLabelsHeight={-15}
                                hideYAxisText
                                yAxisOffset={chart[0].value}
                                height={asset_type==="XLM"?50:hp(14)}
                                yAxisColor={state.THEME.THEME === false ? "#fff" : "black"}
                                xAxisColor={state.THEME.THEME === false ? "#fff" : "black"}
                                pointerConfig={{
                                    pointerStripColor: lineColor,
                                    pointerColor: lineColor,
                                    pointerLabelComponent: item => {
                                        setpoints_data(item[0].value)
                                        setpoints_data_time(item[0].date)
                                    }
                                }}
                            /> */}
                            <Chart
                                style={{ width: wp(98), height: 230 }}
                                data={chartData}
                                padding={{ left: 10, bottom: 30, right: 20, top: 30 }}
                                xDomain={{
                                    min: Math.min(...chartData.map(d => d.x)),
                                    max: Math.max(...chartData.map(d => d.x))
                                }}
                                yDomain={{
                                    min: Math.min(...chartData.map(d => d.y)) - (0.1 * (Math.max(...chartData.map(d => d.y)) - Math.min(...chartData.map(d => d.y)))), // 10% padding below
                                    max: Math.max(...chartData.map(d => d.y)) + (0.1 * (Math.max(...chartData.map(d => d.y)) - Math.min(...chartData.map(d => d.y)))) // 10% padding above
                                }}
                            >
                                <Line
                                    tooltipComponent={
                                        <Tooltip theme={{
                                            formatter: ({ y, x }) => {
                                                setpoints_data(y), setpoints_data_time(x)
                                                setpoints_data_time(new Date(parseInt(x)).toLocaleString())
                                            },
                                            shape: {
                                                width: 0,
                                                height: 0,
                                                dx: 0,
                                                dy: 0,
                                                color: 'black',
                                            }
                                        }} />
                                    }
                                    theme={{
                                        stroke: { color: lineColor || '#44bd32', width: 2 },
                                        scatter: {
                                            selected: { width: 10, height: 11, rx: 5, color: '#2F7DFF' }
                                        }
                                    }}
                                    smoothing="bezier"
                                />
                            </Chart>
                        </View>
                     : <ActivityIndicator color={state.THEME.THEME===false?"green":"#fff"} size={"large"} />}

                </View>
                <View style={[styles.opt_con,{backgroundColor:state.THEME.THEME===false?"#fff":"black"}]}>
                    <TouchableOpacity onPress={() => { settooltip_info_0(true),settooltip_info_1(false),settooltip_info_2(false) }} style={[styles.tooltip_con,{marginLeft: wp(50)}]}>
                        {tooltip_info_0 ? <View style={[styles.tooltip_con_txt,{backgroundColor:state.THEME.THEME===false?"#fff":"black"}]}>
                            <Text style={{color:state.THEME.THEME===false?"black":"#fff",textAlign:"center"}}>Allbridge enables cross-chain asset transfers between multiple blockchain networks.</Text>
                        </View> :
                            <Icon
                                name={"information"}
                                type={"materialCommunity"}
                                color={"#2F7DFF"}
                                size={21}
                            />}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { settooltip_info_0(false),settooltip_info_1(true),settooltip_info_2(false) }} style={[styles.tooltip_con,{marginLeft: wp(70)}]}>
                        {tooltip_info_1 ? <View style={[styles.tooltip_con_txt,{backgroundColor:state.THEME.THEME===false?"#fff":"black",}]}>
                            <Text style={{color:state.THEME.THEME===false?"black":"#fff",textAlign:"center"}}>Trading involves buying, selling, or exchanging cryptocurrencies for profit.</Text>
                        </View> :
                            <Icon
                                name={"information"}
                                type={"materialCommunity"}
                                color={"#2F7DFF"}
                                size={21}
                            />}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { settooltip_info_0(false),settooltip_info_1(false),settooltip_info_2(true) }} style={[styles.tooltip_con,{marginLeft: wp(89),}]}>
                        {tooltip_info_2 ? <View style={[styles.tooltip_con_txt,{backgroundColor:state.THEME.THEME===false?"#fff":"black", marginLeft:wp(-30),}]}>
                            <Text style={{color:state.THEME.THEME===false?"black":"#fff",textAlign:"center"}}>Cashout involves converting assets or cryptocurrencies into fiat money.</Text>
                        </View> :
                            <Icon
                                name={"information"}
                                type={"materialCommunity"}
                                color={"#2F7DFF"}
                                size={21}
                            />}
                    </TouchableOpacity>
                    <TouchableOpacity disabled={chart_show&&Loading} style={styles.opt_cons} onPress={() => {
                        asset_type === "XLM" ? navigation.navigate("SendXLM") :
                            navigation.navigate("Send", {
                                token: asset_type === "ETH" ? "Ethereum" : asset_type,
                            })
                    }}>
                        <View style={styles.opt_icon}>
                        <Icon type={'materialCommunity'} name='arrow-top-right' size={25} color={chart_show&&Loading?"gray":"#4CA6EA"}/>
                        </View>
                        <Text style={[styles.opt_text,{color:state.THEME.THEME===false?"black":"#fff"}]}>Send</Text>
                    </TouchableOpacity>
                    <TouchableOpacity disabled={chart_show&&Loading} style={styles.opt_cons} onPress={() => {
                        setVisible(true);
                        seticonType(asset_type);
                    }}>
                        <View style={styles.opt_icon}>
                        <Icon type={'materialCommunity'} name='arrow-bottom-left' size={25} color={chart_show&&Loading?"gray":"#4CA6EA"}  />
                        </View>
                        <Text style={[styles.opt_text,{color:state.THEME.THEME===false?"black":"#fff"}]}>Request</Text>
                    </TouchableOpacity>
                    <TouchableOpacity  style={styles.opt_cons} disabled={chart_show&&Loading||asset_type==="XRP"} onPress={async() => { await trade_bridge() }}>
                    <View style={styles.opt_icon}>
                        <Image source={brridge_new} style={styles.image_brige} />
                        </View>
                        <Text style={[styles.opt_text,{color:state.THEME.THEME===false?"black":"#fff",textAlign:"center"}]}>Bridge &{`\n`}Trade</Text>
                    </TouchableOpacity>

                    <TouchableOpacity disabled={chart_show&&Loading} style={styles.opt_cons} onPress={async() => { await  trade_manage() }}>
                        <View style={styles.opt_icon}>
                            <Icon type={'materialCommunity'} name='chart-timeline-variant' size={25} color={chart_show && Loading ? "gray" : "#4CA6EA"} />
                        </View>
                        <Text style={[styles.opt_text,{color:state.THEME.THEME===false?"black":"#fff"}]}>Trade</Text>
                    </TouchableOpacity>

                       <TouchableOpacity disabled={chart_show&&Loading}  style={styles.opt_cons} onPress={async() => { await cashout_manage() }}>
                        <View style={styles.opt_icon}>
                            <Icon type={'materialCommunity'} name='cash' size={25} color={chart_show && Loading ? "gray" : "#4CA6EA"} />
                        </View>
                        <Text style={[styles.opt_text,{color:state.THEME.THEME===false?"black":"#fff"}]}>Cashout</Text>
                    </TouchableOpacity>
                  
                </View>
                <View style={[styles.opt_other,{backgroundColor:state.THEME.THEME===false?"#fff":"black"}]}>
                    <ScrollView style={{paddingBottom:hp(10)}}>
                    {/* <View style={styles.horizontalLine} /> */}
                    {Loading === true ? <ActivityIndicator color={state.THEME.THEME===false?"green":"#fff"} size={"large"} style={{ alignSelf: "center" }} /> :
                        final.map((list, index) => {
                            return (
                                <>
                                    <View style={[styles.opt_other_con,{backgroundColor:state.THEME.THEME===false?"#fff":"black"}]}>
                                    <Text style={[styles.opt_market_head, { marginTop: hp(1),color:state.THEME.THEME===false?"black":"#fff" }]}>{asset_type} price (24H)</Text>
                                        <View style={{ padding: 4 }}>
                                        <View style={{ flexDirection: "row",alignItems:"center" }}>
                                            <Text style={[styles.opt_market_head, {paddingLeft:0, fontSize: 14, color: "gray",width:wp(35) }]}>Price</Text>
                                            <Text style={[styles.opt_market_head, {paddingLeft:0, fontSize: 15, color: state.THEME.THEME === false ? "black" : "#fff" }]}>{asset_type === "XLM" ? list.current_price : asset_type === "XLM" ? list.current_price : list.current_price} price (24H)</Text>
                                            </View>
                                            <View style={{ flexDirection: "row",alignItems:"center" }}>
                                            <Text style={[styles.opt_market_head, {paddingLeft:0, fontSize: 14, color: "gray",width:wp(35) }]}>Price (USD)</Text>
                                            <Text style={[styles.opt_market_head, {paddingLeft:0, fontSize: 15, color: state.THEME.THEME === false ? "black" : "#fff" }]}>$ {asset_type === "XLM" ? list.current_price : list.current_price}</Text>
                                            </View>
                                            <View style={{ flexDirection: "row",alignItems:"center" }}>
                                            <Text style={[styles.opt_market_head, {paddingLeft:0, fontSize: 14, color: "gray",width:wp(35) }]}>24H high</Text>
                                            <Text style={[styles.opt_market_head, {paddingLeft:0, fontSize: 15, color: state.THEME.THEME === false ? "black" : "#fff" }]}>$ {asset_type === "XLM" ? list.high_24h : list.high_24h}</Text>
                                            </View>
                                            <View style={{ flexDirection: "row",alignItems:"center" }}>
                                            <Text style={[styles.opt_market_head, {paddingLeft:0, fontSize: 14, color: "gray",width:wp(35) }]}>24H low</Text>
                                            <Text style={[styles.opt_market_head, {paddingLeft:0, fontSize: 15, color: state.THEME.THEME === false ? "black" : "#fff" }]}>$ {asset_type === "XLM" ? list.low_24h : list.low_24h}</Text>
                                            </View>
                                        </View>
                                </View>
                                    {/* Market */}
                                    <View style={[styles.opt_other_con,{backgroundColor:state.THEME.THEME===false?"#fff":"black"}]}>
                                    <Text style={[styles.opt_market_head, { marginTop: hp(1), marginLeft: 1 ,color:state.THEME.THEME===false?"black":"#fff"}]}>Market stats</Text>
                                        <View style={{ padding: 4 }}>

                                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                <Text style={[styles.opt_market_head, { paddingLeft: 0, fontSize: 14, color: "gray", width: wp(35) }]}>Market cap</Text>
                                                <Text style={[styles.opt_market_head, { paddingLeft: 0, fontSize: 15, color: state.THEME.THEME === false ? "black" : "#fff" }]}>$ {asset_type === "XLM" ? list.market_cap : list.market_cap}</Text>
                                            </View>
                                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                <Text style={[styles.opt_market_head, { paddingLeft: 0, fontSize: 14, color: "gray", width: wp(35) }]}>Volume</Text>
                                                <Text style={[styles.opt_market_head, { paddingLeft: 0, fontSize: 15, color: state.THEME.THEME === false ? "black" : "#fff" , width: wp(35) }]}>{asset_type === "XLM" ? list.total_volume : list.total_volume}</Text>
                                            </View>

                                            <View style={{ flexDirection: "row", alignItems: "center" }}>


                                                <Text style={[styles.opt_market_head, { paddingLeft: 0, fontSize: 14, color: "gray", width: wp(35) }]}>Supply</Text>
                                                <Text style={[styles.opt_market_head, { paddingLeft: 0, fontSize: 15, color: state.THEME.THEME === false ? "black" : "#fff" , width: wp(40) }]}>{asset_type === "XLM" ? list.total_supply : list.total_supply}</Text>
                                            </View>
                                            <View style={{ flexDirection: "row",alignItems:"center" }}>
                                            <Text style={[styles.opt_market_head, { paddingLeft: 0, fontSize: 14, color: "gray", width: wp(35) }]}>changes 24h</Text>
                                            <Text style={[styles.opt_market_head, { paddingLeft: 0, fontSize: 15, color: state.THEME.THEME === false ? "black" : "#fff" , width: wp(35) }]}>{asset_type === "XLM" ? list.price_change_percentage_24h : list.price_change_percentage_24h}</Text>
                                        </View>
                                    </View>
                                    </View>
                                </>
                            )
                        })}
                    </ScrollView>
                </View>
                <RecieveAddress
                    modalVisible={visible}
                    setModalVisible={setVisible}
                    iconType={iconType}
                />

            </View>
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
        width: wp(99),
        backgroundColor: "#fff",
        alignSelf: "center",
        borderRadius: 10,
        marginTop: -65,
        justifyContent: "space-around",
        alignItems: "center"
    },
    opt_other: {
        width: wp(99),
        height:hp(40),
        alignSelf: "center",
        alignItems: "center",
        paddingLeft: 14,
    },
    opt_other_con: {
        width: wp(90),
        borderRadius: 10,
        alignItems: "flex-start",
        paddingLeft: 10,
        borderColor:"gray",
        borderWidth:1,
        paddingBottom:10,
        marginTop:10
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
        width:wp(11),
        height:hp(5),
        borderRadius:wp(10),
        justifyContent:"center",
        alignItems:"center",
        backgroundColor:"#2F7DFF1A"
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
        marginLeft: wp(47),
        marginTop: hp(1)
    },
    tooltip_con_txt:{
        marginTop: hp(-10),
        marginLeft:wp(-19),
        width:wp(35),
        borderRadius:14,
        borderColor: "#4CA6EA",
        borderWidth:3
    },
    chart_top:{
        fontSize: 34,
        fontWeight: "600",
        marginVertical: hp(0.1),
        marginHorizontal:wp(5)
    }
});

export default Asset_info;