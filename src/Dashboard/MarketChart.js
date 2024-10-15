import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Grid,
  YAxis,
  XAxis,
  AreaStackChart,
  LineChart,
} from "react-native-svg-charts";
import * as shape from "d3-shape";
import { urls } from "./constants";
import {
  View,
  Button,
  TouchableOpacity,
  StyleSheet,
  Text,
  ScrollView,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useDispatch, useSelector } from "react-redux";
import IconWithCircle from "../Screens/iconwithCircle";
import Icon from "../icon";

const MarketChart = ({ Percent, name }) => {
  const [style, setStyle] = useState("");
  const [title, setTitle] = useState("1h");
  const [Data, setData] = useState();
  const [timeFrame, setTimeFrame] = useState("30m");
  const [pressed, setPressed] = useState();
  const [timeData, setTimeData] = useState([
    "5m",
    "10m",
    "15m",
    "20m",
    "25m",
    "30m",
  ]);
  const data = [
    150, 130, 140, 135, 149, 158, 125, 105, 155, 153, 153, 144, 150, 160, 80,
  ];
  const data2 = ["2h", "4h", "8h", "12h", "18h", "24h"];

  const contentInset = { left: -100, bottom: 0 };
  const state = useSelector((state) => state);

  async function getchart(name, timeFrame) {
    if (timeFrame === "1h") {
      console.log(name);
      if (name === "USDT") {
        name = "USDC";
      }

      await fetch(
        `https://api.binance.com/api/v1/klines?symbol=${name}USDT&interval=1h&limit=5`,
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

          setData(trades);
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
        `https://api.binance.com/api/v1/klines?symbol=${name}USDT&interval=12h&limit=5`,
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

          setData(trades);
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
        `https://api.binance.com/api/v1/klines?symbol=${name}USDT&interval=1d&limit=5`,
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

          setData(trades);
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
        `https://api.binance.com/api/v1/klines?symbol=${name}USDT&interval=30m&limit=5`,
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

          setData(trades);
          console.log(trades);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }
  function chooseStyle(percent) {
    if (parseFloat(percent) === 0) {
      return setStyle("rgba(0,153,51,0.8)");
    }
    if (parseFloat(percent) < 0) {
      return setStyle("rgba(204,51,51,0.8)");
    }

    return setStyle("rgba(0,153,51,0.8)");
  }
  useEffect(async () => {
    await getchart(name.toUpperCase(), "30m");
    chooseStyle(Percent);
    //fetchKline()
  }, []);
  useEffect(async () => {
    await getchart(name.toUpperCase(), timeFrame);
    chooseStyle(Percent);
    //fetchKline()
  }, [timeFrame]);

  return (
    <ScrollView
      contentContainerStyle={{ height: hp(100), backgroundColor: "white" }}
    >
      <XAxis
        style={styles.xAxis}
        data={timeData}
        formatLabel={(value, index) => timeData[index]}
        contentInset={{ left: 18, right: 18 }}
        svg={{ fontSize: 11, fill: "black" }}
      />

      <LineChart
        style={{
          height: hp(30),
          width: wp(90),
          alignSelf: "center",
          marginTop: hp(6),
        }}
        data={Data ? Data : data}
        svg={{ stroke: "rgb(134, 65, 244)" }}
        contentInset={{ top: 10, bottom: 10 }}
      />

      <View style={styles.btnView}>
        <TouchableOpacity
          style={
            pressed == "1"
              ? { ...styles.tabBtns, borderColor: "#4CA6EA" }
              : styles.tabBtns
          }
          // title="1h" color={pressed==='1'?'green':'grey'}
          onPress={() => {
            setPressed("1");
            setTimeData(["10m", "20m", "30m", "40m", "50m", "60m"]);
            setTimeFrame("1h");
          }}
        >
          <Text style={{ color: pressed == "1" ? "#4CA6EA" : "grey" }}>1h</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={
            pressed == "2"
              ? { ...styles.tabBtns, borderColor: "#4CA6EA" }
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
          <Text style={{ color: pressed == "2" ? "#4CA6EA" : "grey" }}>
            12h
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={
            pressed == "3"
              ? { ...styles.tabBtns, borderColor: "#4CA6EA" }
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
          <Text style={{ color: pressed == "3" ? "#4CA6EA" : "grey" }}>3d</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttons}>
        <IconWithCircle name={"arrowup"} type={"antDesign"} title={"Send"} />
        <IconWithCircle
          name={"arrowdown"}
          type={"antDesign"}
          title={"Receive"}
        />
        <IconWithCircle
          name={"credit-card-outline"}
          type={"materialCommunity"}
          title={"Buy"}
        />
        <IconWithCircle
          name={"more-vertical"}
          type={"feather"}
          title={"More"}
          onPress={() => {}}
        />
      </View>
      <Text style={styles.bitcoin} numberOfLines={3}>
        Bitcoin is a cryptocurrency and worldwide payment system. It is the
        first decentralized digital currency. as the system works without a It
        is the first decentralized digital currency. as the system works without
        a
      </Text>

      <View style={styles.iconText}>
        <Text>Website</Text>
        <View style={styles.arrowText}>
          <Text>bitcoin.org</Text>
          <Icon name="arrow-up-right" type={"feather"} size={20} />
        </View>
      </View>
      <View style={styles.iconText}>
        <Text>Explore</Text>
        <View style={styles.arrowText}>
          <Text>blockchain.info</Text>
          <Icon name="arrow-up-right" type={"feather"} size={20} />
        </View>
      </View>

      <View style={styles.iconText}>
        <Text>Market Cap</Text>
        <Text>$5.68.32.96.30.000.00</Text>
      </View>

      <View style={styles.iconText}>
        <Text>Volume (24h)</Text>
        <Text>$10.92.25.76..900.00</Text>
      </View>

      <View style={styles.iconText}>
        <Text>Circulating Supply</Text>
        <Text>1.94.40.962. BTC</Text>
      </View>

      <View style={styles.iconText}>
        <Text>Total Supply</Text>
        <Text>1.94.40.962. BTC</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  tabBtns: {
    borderBottomWidth: 1,
    width: "23%",
    alignItems: "center",
    padding: 3,
  },
  btnView: {
    display: "flex",
    flexDirection: "row",
    alignContent: "center",
    alignItems: "center",
    alignSelf: "center",
    width: wp(55),
    marginTop: hp(2),
    justifyContent: "space-between",
  },
  xAxis: {
    marginTop: hp(43.5),
    position: "absolute",
    height: hp(55),
    alignSelf: "center",
    width: wp(90),
  },
  buttons: {
    marginTop: hp(7),
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  bitcoin: {
    width: wp(88),
    marginHorizontal: wp(5.3),
    marginTop: hp(3),
  },
  iconText: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "center",
    width: wp(88),
    marginTop: hp(2.3),
  },
  arrowText: {
    flexDirection: "row",
  },
});
export default MarketChart;
