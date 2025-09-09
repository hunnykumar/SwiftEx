import React, { useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
} from "react-native";
import { TextInput, Checkbox } from "react-native-paper";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Animated } from "react-native";
import title_icon from "../../../assets/title_icon.png";
import { useDispatch, useSelector } from "react-redux";
import {
  Avatar,
  Card,
  Title,
  Paragraph,
  CardItem,
  WebView,
} from "react-native-paper";
import Bnbimage from "../../../assets/bnb-icon2_2x.png";
import Etherimage from "../../../assets/ethereum.png";
import Xrpimage from "../../../assets/xrp.png";
import Maticimage from "../../../assets/matic.png";
import TokenHeader from "./TokenHeader";
import SearchComponent from "./SearchComponent";
import PancakeList from "../tokens/pancakeSwap/PancakeList.json";
import tokenList from "../tokens/tokenList.json";
import chooseSwap from "../tokens/chooseSwap.json";
import "react-native-get-random-values";
import "@ethersproject/shims";
import { SwapHeader, WalletHeader } from "../header";
import { Wallet_screen_header } from "../reusables/ExchangeHeader";
var ethers = require("ethers");
const xrpl = require("xrpl");
const { ChainId, Fetcher, WETH, Route } = require("@uniswap/sdk");
const { toChecksumAddress } = require("ethereum-checksum-address");
const axios = require("axios");
//'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png?1644979850'
const TokenList = ({
  setVisible,
  setCoin0,
  setCoin1,
  data,
  coinType,
  walletType,
  setSwapType,
}) => {
  const [Data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("Tokens");
  const [loading, setLoading] = useState(false);
  const [scrollYValue, setScrollYValue] = useState(new Animated.Value(0));
  const [page, setPage] = useState(1);
  const state=useSelector((state)=>state);
  const clampedScroll = Animated.diffClamp(
    Animated.add(
      scrollYValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
        extrapolateLeft: "clamp",
      }),
      new Animated.Value(0)
    ),
    0,
    50
  );
  const dispatch = useDispatch();

  let LeftContent = (props) => <Avatar.Image {...props} source={title_icon} />;

  const fetchMoreData = () => {
    setLoading(true);
    const data = Data;

    if (data) {
      console.log(data.length);
      setLoading(false);
      setData([...Data, data]);
      setData(data);
      setPage(page + 1);
    }
  };

  const renderFooter = () => (
    <View style={style.footerText}>
      {loading && <ActivityIndicator />}
      {!Data && <Text style={{color:state.THEME.THEME===false?"black":"#fff"}}>No more data at the moment</Text>}
    </View>
  );

  const renderEmpty = () => (
    <View style={style.emptyText}>
      <Text style={{color:state.THEME.THEME===false?"black":"#fff"}}>No Data at the moment</Text>
    </View>
  );

  const ListCard = React.memo(({ item }) => {
    //console.log(item.symbol)
    //console.log(item)
    let address;

    if (walletType === "Ethereum") {
      if (item.symbol === "WBTC") {
        address = "0xC04B0d3107736C32e19F1c62b2aF67BE61d63a05";
      } else if (item.symbol === "USDC") {
        address = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
      } else if (item.symbol === "DAI") {
        //0xdf1742fe5b0bfc12331d8eaec6b478dfdbd31464
        address = "0xDF1742fE5b0bFc12331D8EAec6b478DfDbD31464";
        //address = "0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60";
      } else if (item.symbol === "USDT") {
        address = "0xC2C527C0CACF457746Bd31B2a698Fe89de2b6d49";
      } else if (item.symbol === "WETH") {
        address = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";
      } else if (item.symbol === "UNI") {
        address = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984";
      } else {
        address = toChecksumAddress(item.address);
      }
    } else if (walletType === "BSC") {
      if (item.symbol === "USDT") {
        address = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd";
      } else if (item.symbol === "ETH") {
        address = "0xd66c6B4F0be8CE5b39D52E0Fd1344c389929B378";
      } else if (item.symbol === "DAI") {
        address = "0xEC5dCb5Dbf4B114C9d0F65BcCAb49EC54F6A0867";
      } else if (item.symbol === "WBNB") {
        address = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
      } else if (item.symbol === "BNB") {
        address = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
      } else if (item.symbol === "BUSD") {
        address = "0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee";
      } else {
        address = toChecksumAddress(item.address);
      }
    } else if (walletType === "Multi-coin") {
      if (item.chainId === 1 || item.chainId === 5) {
        setSwapType("ETH");
        if (item.symbol === "WBTC") {
          address = "0xC04B0d3107736C32e19F1c62b2aF67BE61d63a05";
        } else if (item.symbol === "USDC") {
          address = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
        } else if (item.symbol === "DAI") {
          address = "0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60";
        } else if (item.symbol === "USDT") {
          address = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
        } else if (item.symbol === "WETH") {
          address = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";
        } else if (item.symbol === "UNI") {
          address = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984";
        } else if (item.symbol === "ETH") {
          address = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";
        } else {
          address = toChecksumAddress(item.address);
        }
      } else if (item.chainId === 56) {
        setSwapType("BSC");
        if (item.symbol === "USDT") {
          address = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd";
        } else if (item.symbol === "ETH") {
          address = "0xd66c6B4F0be8CE5b39D52E0Fd1344c389929B378";
        } else if (item.symbol === "DAI") {
          address = "0xEC5dCb5Dbf4B114C9d0F65BcCAb49EC54F6A0867";
        } else if (item.symbol === "WBNB") {
          address = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
        } else if (item.symbol === "BNB") {
          address = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
        } else if (item.symbol === "BUSD") {
          address = "0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee";
        } else {
          address = toChecksumAddress(item.address);
        }
      }
    }
    LeftContent = (props) => {
      return <Avatar.Image {...props} source={{ uri: item.logoURI }} />;
    };
    return (
      <TouchableOpacity
        key={item.address}
        style={{
          flexDirection: "row",
          borderBottomWidth: 0.3,
          borderColor: "gray",
          width: wp(90),
          paddingVertical: hp(2),
          alignItems: "center",
         
        }}
        onPress={() => {
          setVisible(false);
          console.log("pressed");
          if (coinType == "0") {
            setVisible(false);
            setCoin0({
              name: item.name,
              address: address,
              symbol: item.symbol,
              ChainId: item.chainId,
              logoUri: item.logoURI,
            });
          } else {
            setVisible(false);
            setCoin1({
              name: item.name,
              address: address,
              symbol: item.symbol,
              ChainId: item.chainId,
              logoUri: item.logoURI,
            });
          }
          console.log(address);
        }}
      >
       

        <Image source={{uri:item.logoURI}} style={{ height: hp(4), width: wp(8) }} />
        <View
          style={{
            marginHorizontal: wp(4),
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width:'80%',
          }}
        >
          <View>
            <Text style={{color:state.THEME.THEME===false?"black":"#fff"}}>{item.name}</Text>
            <Text style={{ color: "gray", fontSize: 12 }}>{item.symbol==="WETH"?"ETH":item.symbol}</Text>
          </View>
          <Text>{item.chainId == 56 ? "bnb" : "eth"}</Text>
        </View>
      </TouchableOpacity>
    );
  });

  useEffect(() => {
    setData(data);
  }, []);

  return (
    <View style={{ width: wp(100),height:hp(100),marginTop:hp(2.3) }}>
      <Wallet_screen_header title="Tokens" onLeftIconPress={() => {setVisible(false)}} />
      {/* <TokenHeader setVisible={setVisible} name={name} /> */}
      <View style={[style.Body,{backgroundColor:state.THEME.THEME===false?"#fff":"black"}]}>
        <SearchComponent
          clampedScroll={clampedScroll}
          data={data}
          setSearch={setSearch}
          setData={setData}
        />

        {!Data ? (
          <View style={style.loading}>
            <ActivityIndicator size="large" color={"black"} />
          </View>
        ) : (
          <FlatList
            style={{ marginTop: hp(9),marginBottom:hp(10) }}
            contentContainerStyle={{ flexGrow: 1 }}
            data={Data}
            renderItem={({ item }) => {
              return <ListCard item={item} />;
            }}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            keyExtractor={(item) => item.address}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmpty}
            onEndReachedThreshold={0.1}
            onEndReached={fetchMoreData}
          />
        )}
      </View>
    </View>
  );
};

export default TokenList;

const style = StyleSheet.create({
  Body: {
    display: "flex",
    backgroundColor: "white",
    height: hp(98),
    width: wp(100),

    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    alignItems: "center",
    textAlign: "center",
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "200",
    color: "black",
    marginTop: hp(5),
  },
  welcomeText2: {
    fontSize: 15,
    fontWeight: "200",
    color: "white",
    marginTop: hp(1),
  },
  Button: {
    marginTop: hp(10),
  },
  tinyLogo: {
    width: wp("5"),
    height: hp("5"),
    padding: 30,
    marginTop: hp(10),
  },
  Text: {
    marginTop: hp(5),
    fontSize: 15,
    fontWeight: "200",
    color: "white",
  },
  input: {
    height: hp("5%"),
    marginBottom: hp("2"),
    color: "black",
    marginTop: hp("2"),
    width: wp("70"),
    paddingRight: wp("7"),
    backgroundColor: "white",
  },
  Box: {
    height: hp("15%"),
    width: wp("75"),
    fontSize: 20,
    fontWeight: "200",
    color: "white",
    marginTop: hp(1),
    display: "flex",
    alignItems: "center",
    alignContent: "center",
    backgroundColor: "white",
  },
  Box2: {
    height: hp("15%"),
    width: wp("75"),
    fontSize: 20,
    fontWeight: "200",
    color: "white",
    marginTop: hp(1),
    display: "flex",
    alignItems: "center",
    alignContent: "center",
    backgroundColor: "white",
  },
  Box3: {
    height: hp("15%"),
    width: wp("75"),
    fontSize: 20,
    fontWeight: "200",
    color: "white",
    marginTop: hp(2),
    display: "flex",
    alignItems: "center",
    alignContent: "center",
    backgroundColor: "white",
    borderTopWidth: 1,
  },
  title: {
    fontSize: 25,
    fontWeight: "700",
    marginVertical: 15,
    marginHorizontal: 10,
  },
  loading: {
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  emptyText: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

/*
<Animated.ScrollView
        style={{ width:wp(100),
          paddingTop: 55}}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollYValue } } }],
          // { useNativeDriver: true },
          () => { },          // Optional async listener
        )}
        contentInsetAdjustmentBehavior="automatic"
        pagingEnabled={true}
        >
        {Data?Data.slice(0.300).map((item)=>{
          let key = 0
          key++
            const image = item.logoURI
            //console.log(item.symbol)
           LeftContent = (props) => {
           return <Avatar.Image {...props} source={{ uri: image }} />
          }
            //console.log(item)
            return(

  <TouchableOpacity key={item.address}  style={{
    height: hp('15%'),
        width:wp('75'),
        fontSize:20,
        fontWeight:'200',
        color:'white',
        marginTop:hp(1),
        display:'flex', 
        alignItems:'center', 
        alignContent:'center',
        backgroundColor:'white',
        display:search===''?'flex':item.name.includes(search)?'flex':'none'
  }} onPress={async()=>{
    let address
   

    if(walletType==='Ethereum'){

      if(item.symbol==='WBTC'){
        address = "0xC04B0d3107736C32e19F1c62b2aF67BE61d63a05"
      }else if(item.symbol==='USDC'){
        address = "0x07865c6E87B9F70255377e024ace6630C1Eaa37F"
      }else if(item.symbol==='DAI'){
        address = "0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60"
      }else if(item.symbol==='USDT'){
        address = "0x7016353707A91BA5c9bd4D3098DBb730236df68c"
      }else if(item.symbol==='WETH'){
        address = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"
      }else if(item.symbol==='UNI'){
        address = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"
      }
      else{
        address = toChecksumAddress(item.address)
      }
    }else if(walletType==='BSC'){
      if(item.symbol==='USDT'){
        address = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd"
      }else if(item.symbol==='ETH'){
        address = "0xd66c6B4F0be8CE5b39D52E0Fd1344c389929B378"
      }else if(item.symbol==='DAI'){
        address = "0xEC5dCb5Dbf4B114C9d0F65BcCAb49EC54F6A0867"
      }else if(item.symbol==='WBNB'){
        address = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
      }else if(item.symbol==='BNB'){
        address = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
      }else if(item.symbol==='BUSD'){
        address = "0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee"
      }
      else{
        address = toChecksumAddress(item.address)
      }
    }else if(walletType==='Multi-coin'){
      if(item.chainId===1||item.chainId===5){

        setSwapType('ETH')
        if(item.symbol==='WBTC'){
          address = "0xC04B0d3107736C32e19F1c62b2aF67BE61d63a05"
        }else if(item.symbol==='USDC'){
          address = "0x07865c6E87B9F70255377e024ace6630C1Eaa37F"
        }else if(item.symbol==='DAI'){
          address = "0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60"
        }else if(item.symbol==='USDT'){
          address = "0x7016353707A91BA5c9bd4D3098DBb730236df68c"
        }else if(item.symbol==='WETH'){
          address = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"
        }
        else if(item.symbol==='UNI'){
          address = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"
        }
        else{
          address = toChecksumAddress(item.address)
        }
      }else if(item.chainId===56){
        setSwapType('BSC')
        if(item.symbol==='USDT'){
          address = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd"
        }else if(item.symbol==='ETH'){
          address = "0xd66c6B4F0be8CE5b39D52E0Fd1344c389929B378"
        }else if(item.symbol==='DAI'){
          address = "0xEC5dCb5Dbf4B114C9d0F65BcCAb49EC54F6A0867"
        }else if(item.symbol==='WBNB'){
          address = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
        }else if(item.symbol==='BNB'){
          address = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
        }else if(item.symbol==='BUSD'){
          address = "0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee"
        }
        else{
          address = toChecksumAddress(item.address)
        }
      }
    }
      if(coinType=='0'){
        setCoin0({name:item.name,
      address:address, symbol:item.symbol,ChainId:item.chainId})
      setVisible(false)
    }else{
      setCoin1({name:item.name,
        address:address, symbol:item.symbol,ChainId:item.chainId})
      setVisible(false)
    }
    console.log(address)
   
}}>

<Card style={{width:wp(100), height:hp(10), backgroundColor:'white', borderRadius:10,marginLeft:wp(20),display:search===''?'flex':item.name.includes(search)?'flex':'none'}}>
<Card.Title titleStyle={{ color: "black" }}  title={item.name}  left={LeftContent}  />
<Card.Content style={{display:'flex',flexDirection:'row',color:'#fff'}}>
<Title style={{color:'#fff'}}></Title>



</Card.Content>


</Card>
 
  </TouchableOpacity>

  
)
}):<View >
<Text style={{color:'blue'}}>please wait</Text>
<ActivityIndicator size="large" color="blue" />
</View>}
</Animated.ScrollView>

  
*/
