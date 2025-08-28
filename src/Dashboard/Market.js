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
import monkey from "../../assets/monkey.png"
import apiHelper from "./exchange/crypto-exchange-front-end-main/src/apiHelper";


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
      setLoad_new_data(true)
      const result = await apiHelper.get(REACT_APP_HOST+"/v1/market-data");
      if (result.success) {
        setLoading(false);
        setData(result.data.marketData);
         setUpdatedData(result.data.marketData)
         setTrades(result.data.marketData[0].trades)
         setPrice(result.data.marketData[0].currentPrice);
         setPercent(result.data.marketData[0].priceChangePercentage24h);
         setImageUrl(result.data.marketData[0].image);
         setLoad_new_data(false)
      } else {
        setLoading(false);
        console.log(error);
        alert("error", error);
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
          <Icon name="search1" type="antDesign" size={25} color={"black"} />
          <TextInput
            placeholder="Search Crypto"
            placeholderTextColor={"gray"}
            style={[Styles.input,{width:wp(80),fontSize:18}]}
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
            <RefreshControl tintColor={"#4CA6EA"} refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {data.length>0 ? (
            data.map((item,index) => {
              const image = item.image;
              const color = item.priceChange24h > 0 ? "green" : "red";
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
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <View style={[Styles.imgCon,{backgroundColor: state.THEME.THEME === false ?"#F2F0EF":"#171616"}]}>
                          <Image source={{ uri: image }} style={Styles.img} />
                        </View>
                        <View style={Styles.flatContainerText}>
                          <Text style={{ color: state.THEME.THEME === false ? "black" : "#fff" }}>{item.name}</Text>
                          <Text style={{ color: "gray", fontSize: 12, marginTop: hp(0.4) }}>{item?.symbol?.toUpperCase()}</Text>
                        </View>
                      </View>
                      <View style={Styles.flatContainerPrice}>
                      <Text style={{color:state.THEME.THEME===false?"black":"#fff"}}>{`$ ${item.currentPrice ? item.currentPrice.toFixed(2) : "0"
                        }`}</Text>
                        <View style={{flexDirection:"row",alignItems:"center"}}>
                          {/* Number.isSafeInteger(item.priceChangePercentage24h) */}
                          <Icon name={Number.isSafeInteger(item.priceChangePercentage24h)?"menu-down":"menu-down"} type="materialCommunity" size={20} color={Number.isSafeInteger(item.priceChangePercentage24h)?"green":"red"} />
<Text style={{color:Number.isSafeInteger(item.priceChangePercentage24h)?"green":"red",fontSize:13}}>{`${item.priceChangePercentage24h
                          ? item.priceChangePercentage24h.toFixed(3)
                          : "0"
                        }%`}</Text>
                        </View>
                        </View>
                  </TouchableOpacity>
                </ScrollView>
                  </View>
              );
            })
          ) : (
            <View>
                <Image source={monkey} style={Styles.monkey_img}/>
                <Text style={{color:state.THEME.THEME===false?"black":"#fff",alignSelf:"center",fontSize:18,marginTop:hp(2)}}>No results found.</Text>
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
    justifyContent:"space-between"

  },
  flatContainerText: {
    marginHorizontal: wp(2),
  },
  flatContainerPrice: {
    alignItems:"flex-end"
  },
  img: {
    height: hp(5),
    width: wp(11),
  },
  imgCon: {
    height: hp(6),
    width: wp(13),
    justifyContent:"center",
    alignItems:"center",
    borderRadius:10
  },
  monkey_img:{
    width:hp(20),
    height:hp(20),
    alignSelf:"center",
    marginTop:hp(13)
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
