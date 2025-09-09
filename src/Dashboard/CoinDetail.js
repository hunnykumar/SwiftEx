import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
  SafeAreaView,
} from "react-native";
import * as shape from "d3-shape";
import { useDispatch, useSelector } from "react-redux";
import {
  Avatar,
  Card,
  Title,
  Paragraph,
  CardItem,
  WebView,
} from "react-native-paper";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
// import Chart from "./Chart";
import MarketChart from "./MarketChart";
import { urls } from "./constants";
import IconWithCircle from "../Screens/iconwithCircle";
import Icon from "../icon";
import { Area, Chart, HorizontalAxis, Line, Tooltip, VerticalAxis } from "react-native-responsive-linechart";
import { delay } from "lodash";
import { useNavigation } from "@react-navigation/native";
import { Wallet_screen_header } from "./reusables/ExchangeHeader";
import { LineChart } from "react-native-gifted-charts";

export const CoinDetails = (props) => {
  const navigation=useNavigation();
  const [load,setload]=useState(false);
  const [trades, setTrades] = useState();
  const [percent, setPercent] = useState(1);
  console.log(props?.route?.params?.data);
  const image = props?.route?.params?.data?.image;
  // const data = props?.route?.params?.data?.name;
  const state = useSelector((state) => state);
  const [Data, setData] = useState();
  const [chartData, setchartData] = useState([]);
  const [timeFrame, setTimeFrame] = useState("30m");
  const [pressed, setPressed] = useState(0);
  const [lineColor, setlineColor] = useState();
  const [points_data,setpoints_data]=useState();
  const [points_data_time,setpoints_data_time]=useState();
  const [timeData, setTimeData] = useState([
    "5m",
    "10m",
    "15m",
    "20m",
    "25m",
    "30m",
  ]);

  const data2 = ["2h", "4h", "8h", "12h", "18h", "24h"];

  const contentInset = { left: -100, bottom: 0 };
  function chooseStyle(percent) {
    if (parseFloat(percent) === 0) {
      return setStyle("rgba(0,153,51,0.8)");
    }
    if (parseFloat(percent) < 0) {
      return setStyle("rgba(204,51,51,0.8)");
    }

    return setStyle("rgba(0,153,51,0.8)");
  }
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getHours()}:${date.getMinutes()}`;  // Format as HH:mm
  };
   
  useEffect(() => {
    const fetch = async () => {
      try {
        await getChart(props?.route?.params?.data?.symbol.toUpperCase(), "30m");
        chooseStyle(percent);
        //fetchKline()
      } catch (error) {
        console.log("====.", error)
      }
    }
    fetch()
  }, []);
  useEffect(() => {
   const time_fetch=async()=>{
    try {
      await getChart(props?.route?.params?.data?.symbol.toUpperCase(), timeFrame);
      chooseStyle(percent);
      //fetchKline()
    } catch (error) {
      console.log("}{{{{",error)
    }
   }
   time_fetch()
  }, [timeFrame]);
  useEffect(()=>{
    const fetch_color=async()=>{
     try {
      const last_Value = Data[Data.length - 1].value;
      const second_LastValue = Data[Data.length - 2].value;
      const line_Color = last_Value > second_LastValue ? "green" : "red";
      setlineColor(line_Color)
     } catch (error) {
      console.log("*----",error)
     }
    }
    fetch_color()
  },[Data])

  // useEffect(()=>{
  //   setTimeout(()=>{
  //     // setload("true");
  //   },500)
  // })

  async function getChart(name, timeFrame) {
    if (timeFrame === "1h") {
      console.log(name);
      if (name === "USDT") {
        name = "USDC";
      }

      await fetch(
        `https://api.binance.com/api/v1/klines?symbol=${name}USDT&interval=1h&limit=35`,
        {
          method: "GET",
        }
      )
        .then((resp) => resp.json())
        .then((resp) => {
          const trades = resp.map((interval) => parseFloat(interval[1]));
          console.log(resp);
          const firstTrade = trades[0];
          const lastTrade = trades.slice(-1)[0];
          const percent = (
            ((lastTrade - firstTrade) / firstTrade) *
            100
          ).toFixed(2);
          const transformedData = resp.map(item => ({
            x: new Date(item[0]), // Use the timestamp for x
            y: parseFloat(item[4]) // Use the closing price for y
        }));
        const ptData = transformedData.map(item => ({
          value: item.y,
          date: new Date(item.x).toLocaleTimeString()
        })); 
        const pt_Data = resp.map(item => ({
          x: new Date(parseInt(item[0])).getTime(),
          y: parseFloat(item[4])
        }));
        setData(ptData);
          setchartData(pt_Data)
        setpoints_data(ptData[ptData?.length-1]?.value);
        setpoints_data_time(ptData[ptData?.length-1]?.date);
          console.log("----1st---",transformedData)
          delay(()=>{
            setload("true");
          },1000);
          console.log(trades);
        })
        .catch((err) => {
          console.log(err);
        });
    } else if (timeFrame === "12h") {
      console.log(name);
      if (name === "USDT") {
        name = "USDC";
      }

      await fetch(
        `https://api.binance.com/api/v1/klines?symbol=${name}USDT&interval=12h&limit=35`,
        {
          method: "GET",
        }
      )
        .then((resp) => resp.json())
        .then((resp) => {
          const trades = resp.map((interval) => parseFloat(interval[1]));
          console.log(resp);
          const firstTrade = trades[0];
          const lastTrade = trades.slice(-1)[0];
          const percent = (
            ((lastTrade - firstTrade) / firstTrade) *
            100
          ).toFixed(2);

          const transformedData = resp.map(item => ({
            x: new Date(item[0]), // Use the timestamp for x
            y: parseFloat(item[4]) // Use the closing price for y
        }));
        const ptData = transformedData.map(item => ({
          value: item.y,
          date: new Date(item.x).toLocaleTimeString()
        })); 
        const pt_Data = resp.map(item => ({
          x: new Date(parseInt(item[0])).getTime(),
          y: parseFloat(item[4])
        }));
        setData(ptData);
          setchartData(pt_Data)
          setpoints_data(ptData[ptData?.length-1]?.value);
          setpoints_data_time(ptData[ptData?.length-1]?.date);
          console.log("---2nd----",transformedData)
          delay(()=>{
            setload("true");
          },1000);
          console.log(trades);
        })
        .catch((err) => {
          console.log(err);
        });
    } else if (timeFrame === "1d") {
      console.log(name);
      if (name === "USDT") {
        name = "USDC";
      }

      await fetch(
        `https://api.binance.com/api/v1/klines?symbol=${name}USDT&interval=1d&limit=35`,
        {
          method: "GET",
        }
      )
        .then((resp) => resp.json())
        .then((resp) => {
          const trades = resp.map((interval) => parseFloat(interval[1]));
          console.log(resp);
          const firstTrade = trades[0];
          const lastTrade = trades.slice(-1)[0];
          const percent = (
            ((lastTrade - firstTrade) / firstTrade) *
            100
          ).toFixed(2);
          const transformedData = resp.map(item => ({
            x: new Date(item[0]), // Use the timestamp for x
            y: parseFloat(item[4]) // Use the closing price for y
        }));
          const ptData = transformedData.map(item => ({
            value: item.y,
            date: new Date(item.x).toLocaleTimeString()
          })); 
          const pt_Data = resp.map(item => ({
            x: new Date(parseInt(item[0])).getTime(),
            y: parseFloat(item[4])
          }));
          setData(ptData);
          setchartData(pt_Data)
          setpoints_data(ptData[ptData?.length-1]?.value);
          setpoints_data_time(ptData[ptData?.length-1]?.date);
          console.log("----3rd---",transformedData)
          delay(()=>{
            setload("true");
          },1000);
          console.log(trades);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      console.log(name);
      if (name === "USDT") {
        name = "USDC";
      }

      await fetch(
        `https://api.binance.com/api/v1/klines?symbol=${name}USDT&interval=1m&limit=35`,
        {
          method: "GET",
        }
      )
        .then((resp) => resp.json())
        .then((resp) => {
          const trades = resp.map((interval) => parseFloat(interval[1]));
          console.log(resp);
          const firstTrade = trades[0];
          const lastTrade = trades.slice(-1)[0];
          const percent = (
            ((lastTrade - firstTrade) / firstTrade) *
            100
          ).toFixed(2);

const transformedData = resp.map(item => ({
                    x: new Date(item[0]), // Use the timestamp for x
                    y: parseFloat(item[4]) // Use the closing price for y
                }));
          const ptData = transformedData.map(item => ({
            value: item.y,
            date: new Date(item.x).toLocaleTimeString()
          })); 
          const pt_Data = resp.map(item => ({
            x: new Date(parseInt(item[0])).getTime(),
            y: parseFloat(item[4])
          }));
          setData(ptData);
          setchartData(pt_Data)
          setpoints_data(ptData[ptData?.length-1]?.value);
          setpoints_data_time(ptData[ptData?.length-1]?.date);
          console.log("----4th---",transformedData)
          delay(()=>{
            setload("true");
          },1000);
          console.log(trades);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }




  const data = [
    150, 130, 140, 135, 149, 158, 125, 105, 155, 153, 153, 144, 150, 160, 80,
  ];
  async function getchart(name) {
    const token = await state.token;
    if (name == "USDT") {
      name = "USD";
    }
    if (name == "WETH") {
      name = "ETH";
    }
    const data = await fetch(`http://${urls.testUrl}/user/getChart`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: name,
        token: token,
      }),
    })
      .then((response) => response.json())
      .then((responseJson) => {
        //console.log(responseJson)
        setTrades(responseJson.trades);
      })
      .catch((e) => {
        console.log(e);
      });
  }

  useEffect(() => {
   const fetch_chart=async()=>{
    try {
      getchart(props?.route?.params?.data?.symbol, timeFrame);
    } catch (error) {
      console.log(":::....",error)
    }
   }
   fetch_chart()
  }, []);

  let LeftContent = (props) => {
    return <Avatar.Image {...props} source={{ uri: image }} />;
  };
  const color =
    props?.route?.params?.data?.price_change_24h > 0 ? "green" : "red";







  return (
    <View style={{backgroundColor:state.THEME.THEME===false?"#fff":"black"}}>
    <Wallet_screen_header title="Coin-Detail" onLeftIconPress={() => navigation.goBack()} />
   
      <View style={{ alignItems: "flex-start", marginHorizontal: wp(7), marginTop: hp(2) }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image source={{ uri: image }} style={{ height: hp(3), width: wp(6) }} />
          <Text style={{ marginHorizontal: wp(1),color: state.THEME.THEME === false ? "black" : "#fff",fontSize:19,fontWeight:"400" }}>{props?.route?.params?.data?.name}</Text>
        </View>
        <Text style={{ color: state.THEME.THEME === false ? "black" : "#fff", fontSize: 34, fontWeight: "600", marginVertical: hp(0.1) }}>$ {points_data} </Text>
        <Text style={{ color: state.THEME.THEME === false ? "black" : "#fff", fontSize: 13, fontWeight: "600", marginVertical: hp(0.1) }}>{points_data_time} </Text>
        <View style={{flexDirection:"row",alignItems:"center"}}>
          <Icon name={props?.route?.params?.data?.priceChangePercentage24h.toFixed(1) > 0 ?"trending-up":"trending-down"} type={"materialCommunity"} size={20} color={props?.route?.params?.data?.priceChangePercentage24h.toFixed(1) > 0 ? "green" : "red"} />
          <Text style={{ color: props?.route?.params?.data?.priceChangePercentage24h.toFixed(1) > 0 ? "green" : "red", fontSize: 13, fontWeight: "600", marginVertical: hp(0.1) }}> {props?.route?.params?.data?.priceChangePercentage24h.toFixed(1)}%</Text>
        </View>

      </View>

  
    <View style={{
          height: hp(30),
          width: wp(70),
          marginLeft:hp(-13),
          alignSelf: "center",
        }}>
{load===false?<ActivityIndicator color={state.THEME.THEME===false?"green":"#fff"} size={"large"} style={{marginTop:hp(13),marginLeft:110}}/>:
    <View
    style={{ height: hp(28), width: wp(95), padding: 1 ,backgroundColor: state.THEME.THEME===false?"#fff":"black",justifyContent:"center"
    }}>
            {/* <LineChart
              hideRules
              data={Data}
              hideDataPoints
              adjustToWidth
              spacing={wp(90) / Data.length-1}
              isAnimated={true}
              curved
              color={lineColor}
              xAxisLabelsHeight={-15}
              hideYAxisText
              yAxisOffset={Data[0].value}
              height={50}
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
    </View>}
    </View>
    <View style={styles.btnView}>
    <TouchableOpacity
          style={
            pressed == "0"
              ? {
                ...styles.tabBtns,
                backgroundColor: "#2164C1",
              }
              : styles.tabBtns
          }
          onPress={() => {
            setPressed("0");
            setTimeData(["10m", "20m", "30m", "40m", "50m", "60m"]);
            setTimeFrame("1m");
          }}
        >
          <Text style={{ color: pressed == "0" ? "#fff" : "grey",fontWeight:"bold" }}>1m</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={
            pressed == "1"
              ? {
                ...styles.tabBtns,
                backgroundColor: "#2164C1",
              }
              : styles.tabBtns
          }
          // title="1h" color={pressed==='1'?'green':'grey'}
          onPress={() => {
            setPressed("1");
            setTimeData(["10m", "20m", "30m", "40m", "50m", "60m"]);
            setTimeFrame("1h");
          }}
        >
          <Text style={{ color: pressed == "1" ? "#fff" : "grey",fontWeight:"bold" }}>1h</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={
            pressed == "2"
              ? {
                ...styles.tabBtns,
                backgroundColor: "#2164C1",
              }
              : styles.tabBtns
          }
          // title="12h"
          // color={pressed === "2" ? "green" : "grey"}
          onPress={() => {
            setPressed("2");
            setTimeData(["2h", "4h", "6h", "8h", "10h", "12h"]);
            setTimeFrame("12h");
          }}
        >
          <Text style={{ color: pressed == "2" ? "#fff" : "grey",fontWeight:"bold" }}>12h</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={
            pressed == "3"
              ? {
                ...styles.tabBtns,
                backgroundColor: "#2164C1",
              }
              : styles.tabBtns
          }
          // title="1d"
          // color={pressed === "3" ? "green" : "grey"}
          onPress={() => {
            setPressed("3");
            setTimeData(["2h", "4h", "8h", "12h", "18h", "24h"]);
            setTimeFrame("1d");
          }}
        >
          <Text style={{ color: pressed == "3" ? "#fff" : "grey",fontWeight:"bold" }}>3d</Text>
        </TouchableOpacity>
      </View>
      {/* <AreaChart
        style={{
          height: hp(30),
          width: wp(90),
          alignSelf: "center",
          marginTop: hp(6),
        }}
        // data={NewData}
        data={Data ? Data : data}
        contentInset={{ top: 30, bottom: 30 }}
        curve={shape.curveNatural}
        svg={{ fill: "rgba(134, 65, 244, 0.8)" }}
      >
        <Grid />
      </AreaChart> */}
      <View style={{height:hp(40),marginTop:8}}>
      <ScrollView style={{paddingBottom:hp(10),backgroundColor: state.THEME.THEME === false ? "#F4F4F4" : "black" }}>
      <View style={[styles.market_data,{borderColor:state.THEME.THEME === false ? "#F4F4F4" : "black",borderTopColor:state.THEME.THEME === false ? "#F4F4F4" : "black"}]}>
        <Text style={{ color: state.THEME.THEME === false ? "black" : "#fff", fontSize: 17,paddingBottom:hp(1.6),fontWeight:"600" }}>{props?.route?.params?.data?.name} Price (24H) </Text>
        <View style={{flexDirection:"row"}}>
        <View style={[styles.iconText]}>
          <Text style={{  color: state.THEME.THEME === false ? "black" : "#fff"}}>Price USD</Text>
            <Text style={[styles.heading, { color: state.THEME.THEME === false ? "black" : "#fff" }]}>${props?.route?.params?.data?.current_price}</Text>
          <View style={styles.arrowText}>
          </View>
        </View>

        <View style={[styles.iconText]}>
          <Text style={{  color: state.THEME.THEME === false ? "black" : "#fff"}}>24H high </Text>
          <Text style={[styles.heading, { color: state.THEME.THEME === false ? "black" : "#fff" }]}>${props?.route?.params?.data?.high_24h}
          <Icon name="arrow-up-right" type={"feather"} size={20} color={state.THEME.THEME===false?"black":"#fff"} /></Text>
        </View>
        </View>

        <View style={{flexDirection:"row"}}>
          <View style={[styles.iconText]}>
           <Text style={{  color: state.THEME.THEME === false ? "black" : "#fff"}}>24H low </Text>
           <Text style={[styles.heading, { color: state.THEME.THEME === false ? "black" : "#fff" }]}>${props?.route?.params?.data?.low_24h}
           <Icon name="arrow-down-left" type={"feather"} size={20} color={state.THEME.THEME===false?"black":"#fff"} /></Text>
          </View>
          <View style={[styles.iconText]}>
           <Text style={{  color: state.THEME.THEME === false ? "black" : "#fff"}}>Price change 24H </Text>
           <Text style={[styles.heading, { color: state.THEME.THEME === false ? "black" : "#fff",color:Number.isSafeInteger(props?.route?.params?.data?.priceChangePercentage24h)?"green":"red"}]}>{props?.route?.params?.data?.priceChangePercentage24h}%</Text>
          </View>
        </View>
        <View style={[styles.iconText]}>
          <Text style={{  color: state.THEME.THEME === false ? "black" : "#fff"}}>All Time High </Text>
          <Text style={[styles.heading, { color: state.THEME.THEME === false ? "black" : "#fff" }]}>${props?.route?.params?.data?.ath}</Text>
        </View>
       
      </View>

      <View style={[styles.market_data, { marginTop:hp(1),marginBottom:hp(2),borderColor:state.THEME.THEME === false ? "#F4F4F4" : "black"}]}>
        <Text style={{ color: state.THEME.THEME === false ? "black" : "#fff", fontSize: 17,paddingBottom:hp(1.6),fontWeight:"600" }}>Market stats</Text>
        
        <View style={{flexDirection:"row"}}>
         <View style={[styles.iconText]}>
          <Text style={{  color: state.THEME.THEME === false ? "black" : "#fff"}}>Market Cap Rank </Text>
          <Text style={[styles.heading, { color: state.THEME.THEME === false ? "black" : "#fff" }]}>{props?.route?.params?.data?.market_cap_rank}</Text>
         </View>
         <View style={[styles.iconText]}>
          <Text style={{  color: state.THEME.THEME === false ? "black" : "#fff"}}>Market Cap </Text>
          <Text style={[styles.heading, { color: state.THEME.THEME === false ? "black" : "#fff" }]}> ${props?.route?.params?.data?.market_cap}</Text>
          </View>
        </View>

        <View style={{flexDirection:"row"}}>
          <View style={[styles.iconText]}>
           <Text style={{  color: state.THEME.THEME === false ? "black" : "#fff"}}>Volume </Text>
           <Text style={[styles.heading, { color: state.THEME.THEME === false ? "black" : "#fff" }]}>${props?.route?.params?.data?.total_volume}</Text>
          </View>
          <View style={[styles.iconText]}>
           <Text style={{  color: state.THEME.THEME === false ? "black" : "#fff"}}>Total Supply </Text>
           <Text style={[styles.heading, { color: state.THEME.THEME === false ? "black" : "#fff" }]}>${props?.route?.params?.data?.total_supply}</Text>
          </View>
        </View>

        </View>
      </ScrollView>
      </View>



  {/* </ScrollView> */}
  </View>
  );
};

const styles = StyleSheet.create({
  buttons: {
    marginTop: hp(7),
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  bitcoin: {
    width: wp(88),
    marginHorizontal: wp(5.3),
    marginTop: hp(5),
  },
  iconText: {
    alignSelf: "flex-start",
    width: wp(50),
    marginVertical:hp(0.6)
  },
  arrowText: {
    flexDirection: "row",
  },
  xAxis: {
    marginTop: hp(47),
    position: "absolute",
    // height: hp(55),
    alignSelf: "center",
    width: wp(76),

  },
  tabBtns: {
    borderColor: "gray",
    paddingVertical: hp(1),
    width: wp(18),
    alignItems: "center",
    borderRadius: hp(2),
  },
  btnView: {
    display: "flex",
    flexDirection: "row",
    alignContent: "center",
    alignItems: "center",
    alignSelf: "center",
    width: wp(90),
    marginTop: hp(-2),
    justifyContent: "space-between",
  },
  heading: { color: "black", fontSize: 14, fontWeight: "600" },
  market_data: {
    marginTop: hp(1),
    paddingHorizontal: wp(1),
    paddingVertical:hp(1),
    borderTopColor: "#75747433",
    borderWidth: 1.8,
    width: wp(95),
    alignSelf: "center"
  }
});