import React, { useState } from "react";
import { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Image,StatusBar
} from "react-native";
import { urls } from "./constants";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import Icon from "../icon";
import { alert } from "./reusables/Toasts";
import { REACT_APP_HOST } from "./exchange/crypto-exchange-front-end-main/src/ExchangeConstants";
import { useSelector } from "react-redux";
import { Wallet_screen_header } from "./reusables/ExchangeHeader";
import { Wallet_market_loading } from "./reusables/Exchange_loading";

const Market = (props) => {
  const state=useSelector((state)=>state);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState();
  const [trades, setTrades] = useState();
  const [price, setPrice] = useState();
  const [percent, setPercent] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [updatedData, setUpdatedData] = useState([])
  const [searchItem, setSearchItem] = useState('')
  const [Load_new_data,setLoad_new_data]=useState(true);
  const navigation = useNavigation();
  const fetchKline = async (
    setData,
    setLoading,
    setPercent,
    setPrice,
    setTrades,
    setImageUrl
  ) => {
    try {
      setLoad_new_data(true)
const raw = "";
const requestOptions = {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
};
     await fetch(REACT_APP_HOST+"/market-data/getcryptodata", requestOptions)
      .then((response) => response.json())
      .then((responseJson) => {
         setLoading(false);
         setData(responseJson[0].MarketData);
          setUpdatedData(responseJson[0].MarketData)
          setTrades(responseJson[0].MarketData[0].trades)
          setPrice(responseJson[0].MarketData[0].current_price);
          setPercent(responseJson[0].MarketData[0].price_change_percentage_24h);
          setImageUrl(responseJson[0].MarketData[0].image);
          setLoad_new_data(false)
    })
      .catch((error) =>{ 
       setLoading(false);
        console.error(error);
        alert("error", error);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(async () => {
      await fetchKline(
        setData,
        setLoading,
        setPercent,
        setPrice,
        setTrades,
        setImageUrl
      );
      setRefreshing(false);
    }, 2000);
  };

  useEffect(() => {
   const fetch_token_data=async()=>{
    try {
      setLoad_new_data(true)
      await fetchKline(
        setData,
        setLoading,
        setPercent,
        setPrice,
        setTrades,
        setImageUrl
      );
    } catch (error) {
      console.log("::::***-",error)
    }
   }
   fetch_token_data()
  }, []);


  return (
    <View style={{ backgroundColor: state.THEME.THEME===false?"#fff":"black" }}>
    <Wallet_screen_header title="Market" onLeftIconPress={() => navigation.goBack()} />
    {Platform.OS === 'ios' &&  <StatusBar hidden={true} />}
      <View style={{ height: hp(100) }}>
        <View style={Styles.searchContainer}>
          <Icon name="search1" type="antDesign" size={hp(2.4)} />
          <TextInput
            placeholder="Search Crypto"
            placeholderTextColor={"gray"}
            style={Styles.input}
            onChangeText={(input) => {
              setSearchItem(input)
              let UpdatedData = []
              updatedData.filter((item) => {
                console.log(item.name.toLowerCase().includes(input.toLowerCase()))
                if (item.name.toLowerCase().includes(input.toLowerCase())) {
                  UpdatedData.push(item)
                }

                setData(UpdatedData)
                return UpdatedData
              })

            }}
          />
        </View>
        {/* <View style={Styles.iconwithTextContainer1}> */}
          {/* <Text style={{ color: "gray" }}>New DApps</Text> */}
          {/* <Icon
            name={"arrowright"}
            type={"antDesign"}
            size={hp(3)}
            color={"gray"}
          /> */}
        {/* </View> */}
        {Load_new_data?<Wallet_market_loading/>:
        <View style={{height:hp(75),paddingBottom: hp(5)}}>
        <ScrollView
          alwaysBounceVertical={true}
          contentContainerStyle={{ marginBottom: hp(2) }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {data ? (
            data.map((item,index) => {
              const image = item.image;
              const color = item.price_change_24h > 0 ? "green" : "red";
              let data = item
              return (
                  <View key={index}>
                <ScrollView>
                  <TouchableOpacity
                    style={Styles.Container}
                    key={item.id}
                    onPress={() => {
                      props.navigation.navigate("CoinDetails", { data: data });
                    }}
                  >
                    <Image source={{ uri: image }} style={Styles.img} />
                    <View style={Styles.flatContainerText}>
                      <Text style={{color:state.THEME.THEME===false?"black":"#fff"}}>{item.name}</Text>
                      <Text style={{color:state.THEME.THEME===false?"black":"#fff"}}>{`$ ${item.current_price ? item.current_price.toFixed(2) : "0"
                        }`}</Text>
                      <Text style={{color:state.THEME.THEME===false?"black":"#fff"}}>{`Last 24h: ${item.price_change_percentage_24h
                          ? item.price_change_percentage_24h.toFixed(1)
                          : "0"
                        }%`}</Text>
                    </View>
                  </TouchableOpacity>
                </ScrollView>
                  </View>
              );
            })
          ) : (
            <View>
              <ActivityIndicator size="large" color="blue"/>
            </View>
          )}
        </ScrollView>
        </View>}
      </View>
    </View>
  );
};
const Styles = StyleSheet.create({
  iconwithTextContainer1: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: hp(48),
    alignSelf: "center",
    padding: hp(2),
  },
  Container: {
    width: wp(90),
    paddingHorizontal: wp(2),
    alignSelf: "center",
    marginTop: hp(3),
    alignItems: "center",
    flexDirection: "row",

  },
  flatContainerText: {
    marginHorizontal: wp(4),
  },
  img: {
    height: hp(5),
    width: wp(10),
  },
  searchContainer: {
    flexDirection: "row",
    width: wp(90),
    borderWidth: StyleSheet.hairlineWidth * 1,
    alignItems: "center",
    paddingLeft: wp(3),
    borderRadius: wp(7),
    alignSelf: "center",
    marginTop: hp(2),
    paddingVertical: hp(1),
    backgroundColor: "#D9D5F2",
    marginVertical: hp(2),
  },
  input: {
    marginHorizontal: hp(1.5),
    padding: hp(0.6),
  },
  textWidth: {
    width: "45%",
  },
});
export default Market;
