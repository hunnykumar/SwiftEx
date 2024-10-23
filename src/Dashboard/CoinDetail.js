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
  const [timeFrame, setTimeFrame] = useState("30m");
  const [pressed, setPressed] = useState();
  const [lineColor, setlineColor] = useState();
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
      const last_Value = Data[Data.length - 1].y;
      const second_LastValue = Data[Data.length - 2].y;
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
          date: formatDate(item.x)
        })); 
        setData(ptData);
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
          date: formatDate(item.x)
        })); 
          setData(ptData)
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
            date: formatDate(item.x)
          })); 
          setData(ptData);
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
        `https://api.binance.com/api/v1/klines?symbol=${name}USDT&interval=30m&limit=35`,
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
            date: formatDate(item.x)
          })); 
          setData(ptData);
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
    <ScrollView style={{backgroundColor:state.THEME.THEME===false?"#fff":"black"}}>
    <Wallet_screen_header title="Coin-Detail" onLeftIconPress={() => navigation.goBack()} />
    {/* // <ScrollView
    //   contentContainerStyle={{ backgroundColor: "white"}}
    // > */}
      {/* <View style={{flexDirection:"row",alignItems:"center",marginHorizontal:wp(7),marginTop:hp(2)}}>
  <Image source={{uri: image}} style={{height:hp(3),width:wp(6)}}/>
  <Avatar.Image {...props} source={{ uri: image }} />
  <Text style={{marginHorizontal:wp(3)}}>wallet:{props?.route?.params?.data?.name}</Text>
</View> */}



      <View style={styles.btnView}>
        <TouchableOpacity
          style={
            pressed == "1"
              ? {
                ...styles.tabBtns,
                borderColor: "#4CA6EA",
                backgroundColor: "#4CA6EA",
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
          <Text style={{ color: pressed == "1" ? "#fff" : "grey" }}>1h</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={
            pressed == "2"
              ? {
                ...styles.tabBtns,
                borderColor: "#4CA6EA",
                backgroundColor: "#4CA6EA",
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
          <Text style={{ color: pressed == "2" ? "#fff" : "grey" }}>12h</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={
            pressed == "3"
              ? {
                ...styles.tabBtns,
                borderColor: "#4CA6EA",
                backgroundColor: "#4CA6EA",
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
          <Text style={{ color: pressed == "3" ? "#fff" : "grey" }}>3d</Text>
        </TouchableOpacity>
      </View>
      {/* <YAxis
        data={Data ? Data : data}
        style={{
          // marginRight: wp(59),
          // marginLeft: wp(-4),
          height: hp(36),
          width: wp(15),
          marginTop: hp(9),
          position: "absolute",
          zIndex: 10,
          marginLeft:wp(3),
        }}
        contentInset={{ top: 10,bottom:20 }}
        // contentInset={contentInset}
        svg={{
          fill: "gray",
          fontSize: 12,
          fontWeight: "500"
        }}
        numberOfTicks={8}
        formatLabel={(value) => `${value}`}
      />

      <XAxis
        data={Data ? Data : data}

        style={styles.xAxis}
        formatLabel={(value, index) => timeData[index]}
        contentInset={{ left: 18, right: 18 }}
        svg={{
          fill: "gray",
          fontSize: 12,
          fontWeight: "500"
        }}
      /> */}
    <View style={{
          height: hp(30),
          width: wp(70),
          marginLeft:hp(-13),
          alignSelf: "center",
        }}>
           {/* <LineChart
        style={{
          height: hp(30),
          width: wp(70),
          alignSelf: "center",
        }}
        data={Data ? Data : data}
        svg={{ stroke: "rgb(134, 65, 244)" }}
        contentInset={{ top: 10, bottom: 10 }}
      /> */}

{load===false?<ActivityIndicator color={state.THEME.THEME===false?"green":"#fff"} size={"large"} style={{marginTop:hp(13),marginLeft:110}}/>:
    <View
    style={{ height: hp(39), width: wp(95), padding: 1 ,backgroundColor: state.THEME.THEME===false?"#fff":"black",justifyContent:"center"
    }}>
 <LineChart
        areaChart
        data={Data}
        rotateLabel
        width={wp(75)}
        hideDataPoints
        spacing={10}
        color={lineColor}
        thickness={6}
        startFillColor={lineColor==="red"?"#bd3e30":"#327532"}
        endFillColor={lineColor==="red"?"#bd3e30":"#327532"}
        startOpacity={0.9}
        endOpacity={0.2}
        initialSpacing={0}
        noOfSections={6}
        yAxisColor={state.THEME.THEME===false?"#fff":"black"}
        yAxisThickness={10}
        hideRules
        yAxisTextStyle={{ color: state.THEME.THEME===false?"black":"#fff" }}
        yAxisSide='right'
        xAxisColor="lightgray"
        scrollEnabled 
        pointerConfig={{
          pointerStripHeight: 160,
          pointerStripColor: 'lightgray',
          pointerStripWidth: 2,
          pointerColor: 'lightgray',
          radius: 6,
          pointerLabelWidth: 100,
          pointerLabelHeight: 90,
          activatePointersOnLongPress: true,
          autoAdjustPointerLabelPosition: false,
          pointerLabelComponent: items => {
            return (
              <View
                style={{
                  height: 90,
                  width: 100,
                  justifyContent: 'center',
                  marginTop: -2,
                  marginLeft: -40,
                }}>
                <Text style={{ color: 'white', fontSize: 14, marginBottom: 6, textAlign: 'center' }}>
                  {items[0].date}
                </Text>

                <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: 'white' }}>
                  <Text style={{ fontWeight: 'bold', textAlign: 'center',color: 'black' }}>
                    {'$' + items[0].value.toFixed(2)}
                  </Text>
                </View>
              </View>
            );
          },
        }}
      />
    </View>}
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
    <View style={{ marginTop: hp(4) }}>
    <View style={[styles.iconText,{backgroundColor:state.THEME.THEME===false?"#f2f2f2":"black"}]}>
          <Text style={{color:state.THEME.THEME===false?"black":"#fff"}}> Last 24h :</Text>
          <View style={styles.arrowText}>
            <Text style={[styles.heading,{color:state.THEME.THEME===false?"black":"#fff"}]}>
              {props?.route?.params?.data?.price_change_percentage_24h}%
            </Text>
            <Icon name="arrow-up-right" type={"feather"} size={20}  color={state.THEME.THEME===false?"black":"#fff"} />
          </View>
        </View>
        <View style={[styles.iconText]}>
          <Text style={{color:state.THEME.THEME===false?"black":"#fff"}}>USD :</Text>
          <View style={styles.arrowText}>
            <Text style={[styles.heading,{color:state.THEME.THEME===false?"black":"#fff"}]}>$ {props?.route?.params?.data?.current_price}</Text>
            <Icon name="arrow-up-right" type={"feather"} size={20} color={state.THEME.THEME===false?"black":"#fff"} />
          </View>
        </View>

        <View style={[styles.iconText,{backgroundColor:state.THEME.THEME===false?"#f2f2f2":"black"}]}>
          <Text style={{color:state.THEME.THEME===false?"black":"#fff"}}>Market Cap : </Text>
          <Text style={[styles.heading,{color:state.THEME.THEME===false?"black":"#fff"}]}> ${props?.route?.params?.data?.market_cap}</Text>
        </View>

        <View style={[styles.iconText]}>
          <Text style={{color:state.THEME.THEME===false?"black":"#fff"}}>Total Supply :</Text>
          <Text style={[styles.heading,{color:state.THEME.THEME===false?"black":"#fff"}]}>${props?.route?.params?.data?.total_supply}</Text>
        </View>

        <View style={[styles.iconText,{backgroundColor:state.THEME.THEME===false?"#f2f2f2":"black"}]}>
          <Text style={{color:state.THEME.THEME===false?"black":"#fff"}}> 24H high :</Text>
          <Text style={[styles.heading,{color:state.THEME.THEME===false?"black":"#fff"}]}>${props?.route?.params?.data?.high_24h} </Text>
        </View>
        <View style={[styles.iconText]}>

          <Text style={{color:state.THEME.THEME===false?"black":"#fff"}}> 24H low :</Text>
          <Text style={[styles.heading,{color:state.THEME.THEME===false?"black":"#fff"}]}>${props?.route?.params?.data?.low_24h}</Text>
        </View>
        <View style={[styles.iconText,{backgroundColor:state.THEME.THEME===false?"#f2f2f2":"black"}]}>
          <Text style={{color:state.THEME.THEME===false?"black":"#fff"}}> All Time High :</Text>
          <Text style={[styles.heading,{color:state.THEME.THEME===false?"black":"#fff"}]}>${props?.route?.params?.data?.ath}</Text>
        </View>
      </View>

  {/* </ScrollView> */}
  </ScrollView>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "center",
    width: wp(88),
    marginTop: hp(1),
    // backgroundColor:"gray",
    padding:10
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
    width: wp(23),
    alignItems: "center",
    borderRadius: hp(2),
  },
  btnView: {
    display: "flex",
    flexDirection: "row",
    alignContent: "center",
    alignItems: "center",
    alignSelf: "center",
    width: wp(85),
    backgroundColor: "#dadadada",
    borderRadius: hp(2),
    marginTop: hp(2),
    // paddingVertical: hp(0.6),
    justifyContent: "space-between",
  },
  heading: { color: "black", fontSize: 14, fontWeight: "700" }
});