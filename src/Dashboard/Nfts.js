import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Text, Button, Image, TouchableOpacity, Modal, FlatList, TextInput } from "react-native";
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
import { LineChart } from "react-native-svg-charts";
import { useDispatch, useSelector } from "react-redux";
import darkBlue from "../../assets/darkBlue.png"
import Etherimage from "../../assets/ethereum.png";
import monkey from "../../assets/monkey.png"
import wl from "../../assets/wl.jpg"
import { Animated, LayoutAnimation, Platform, UIManager } from "react-native";
// import profile from "../../assets/profile.jpg"
import { style } from "@mui/system";
import Icon from "../icon";
import { Paste } from "../utilities/utilities";

const Nfts = () => {
  const state2 = useSelector((state) => state.walletBalance);

  const state = useSelector((state) => state);
  const [Route,setRoute]=useState('')
  const [open_offer,setopen_offer]=useState(false)
  const [open_chain,setopen_chain]=useState(false)
  const [balance, getBalance] = useState(0);
  const [contract_text, setcontract_text] = useState('');
  const [View_assets,setView_assets]=useState(false);

  useEffect(()=>{
    setView_assets(false)
    setcontract_text('')
  },[])

  if (Platform.OS === "android") {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const translation = useRef(new Animated.Value(0)).current;

  useEffect( () => {
   const fetch_nfts=async()=>{
    try {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
      }).start();
  
      Animated.timing(translation, {
        toValue: 1,
        delay: 0.1,
        useNativeDriver: true,
      }).start();
      const bal = await state.walletBalance;
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  
      if (bal) {
        getBalance(bal);
      }
    } catch (error) {
      console.log("--nfts--",error)
    }
   }

   fetch_nfts()
  }, [state2]);

  let LeftContent = (props) => (
    <Avatar.Image
      {...props}
      source={{
        uri: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png?1644979850",
      }}
    />
  );
  let LeftContent2 = (props) => <Avatar.Image {...props} source={Etherimage} />;
  const chooseItemList_1 = [
    {id:1,name:"ETH",img:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png"},
    {id:2,name:"BNB",img:"https://tokens.pancakeswap.finance/images/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c.png"},
  ]

  const ETH_COIN = [
    {id:1,name:"USDC",img:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"},
    {id:2,name:"DAI",img:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png"},
  ]
  const BNB_COIN = [
    {id:1,name:"BUSD",img:"https://assets.coingecko.com/coins/images/9576/thumb/BUSD.png?1568947766"},
    {id:2,name:"USDC",img:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"},
  ]
  const chooseRenderItem_1 = ({ item }) => (
    <TouchableOpacity onPress={() => {setRoute(item.name),setopen_offer(false),setopen_chain(true)}} style={[styles.chooseItemContainer,{borderRadius:5,height:hp(6),justifyContent:"flex-start"}]}>
       <Image source={ { uri: item.img }} style={{width:wp(6.9),height:hp(3.5)}}/>
      <Text style={[styles.chooseItemText]}>{item.name}</Text>
    </TouchableOpacity>
  );
  const token_show = ({ item }) => (
    <View style={[styles.chooseItemContainer,{borderRadius:5,height:hp(6),justifyContent:"flex-start",justifyContent:"space-between"}]}>
      <View style={{flexDirection:"row"}}>
      <Image source={ { uri: item.img }} style={{width:wp(6.5),height:hp(3)}}/>
      <Text style={[styles.chooseItemText]}>{item.name}</Text>
      </View>
      <TouchableOpacity onPress={() => {setRoute(item.name),setopen_chain(false)}} style={{borderRadius:10,borderColor:"#4CA6EA",borderWidth:1,paddingHorizontal:wp(2)}}>
      <Text style={[styles.chooseItemText,{marginLeft:wp(0)}]}>Add</Text>
      </TouchableOpacity>

    </View>
  );
  return (
    <Animated.View
      style={[styles.mainContainer,{backgroundColor:state.THEME.THEME===false?"#fff":"black"}]}>
       
{/* <Image source={monkey} style={styles.img}/>
<Text style={[styles.text,{color:state.THEME.THEME===false?"black":"#fff"}]}>Collectibles will appear here</Text>
<TouchableOpacity style={styles.btnContainer}>
  <Text style={styles.btnText}>Receive</Text>
</TouchableOpacity> */}
      {/* <TouchableOpacity style={[styles.drop_down_con]} onPress={()=>{setopen_offer(true)}}> */}
      <View style={[styles.drop_down_con]}>
          <View style={{flexDirection:"row",justifyContent:"center",alignItems:"center"}}>
          <Image source={{uri:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png"}} style={[styles.img_icon,{ height: hp(3.6), width: wp(7.6)}]} />
          <Text style={[styles.text,{color:state.THEME.THEME===false?"black":"#fff",marginLeft:5}]}>Ethereum</Text>
          </View>
          <Icon type={"materialCommunity"} name="menu-down" size={hp(2.9)} color={state.THEME.THEME===false?"#fff":"black"} style={{margin:hp(2),}}/>
      </View>
      {!View_assets?<>
      <View style={[styles.drop_down_con,{paddingLeft:1,fontSize:14,color:state.THEME.THEME===false?"black":"#fff"}]}>
      <TextInput editable={false} style={[{paddingLeft:10,fontSize:14,color:state.THEME.THEME===false?"black":"#fff",width:wp(75),height:hp(8),
    marginTop:hp(0),}]} placeholder="Contract Address" placeholderTextColor={"gray"} value={contract_text} />
        <TouchableOpacity onPress={()=>{Paste(setcontract_text)}}>
          <Text style={{color: "blue", marginHorizontal: wp(3)}}>PASTE</Text>
        </TouchableOpacity>
      </View>

<View style={{flexDirection:"row",justifyContent:"space-around"}}>
<TouchableOpacity disabled={!contract_text} style={[styles.Add_asset_btn,{justifyContent:"center",backgroundColor:!contract_text?"gray":"green"}]} onPress={()=>{setcontract_text("")}}>
    <Text style={[styles.text,{ fontSize:17,textAlign:"center",margin:hp(0),color:state.THEME.THEME===false?"#fff":"#fff"}]}>Add Asset</Text>
</TouchableOpacity>
<TouchableOpacity style={[styles.Add_asset_btn,{justifyContent:"center",marginRight:wp(4),backgroundColor:"green"}]} onPress={()=>{setView_assets(true)}}>
    <Text style={[styles.text,{ fontSize:17, textAlign:"center",margin:hp(0),color:state.THEME.THEME===false?"#fff":"#fff"}]}>View</Text>
</TouchableOpacity>
</View></>
:
<>
<View style={[styles.drop_down_View]}>
<View style={{flexDirection:"row",justifyContent:"space-between",marginBottom:-20}}>
            <View style={{flexDirection:"row",justifyContent:"center",alignItems:"center"}}>
              <Text style={[styles.text,{color:state.THEME.THEME===false?"black":"#fff",margin:hp(1)}]}>Tokens</Text>
            </View>
          <Text style={[styles.text,{color:state.THEME.THEME===false?"black":"#fff"}]}>Balance</Text>
          </View>

          <View style={{flexDirection:"row",justifyContent:"space-between"}}>
            <View style={{flexDirection:"row",justifyContent:"center",alignItems:"center"}}>
              <Image source={{uri:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"}} style={styles.img_icon} />
              <Text style={[styles.text,{color:state.THEME.THEME===false?"black":"#fff",margin:hp(1)}]}>USDC</Text>
            </View>
          <Text style={[styles.text,{color:state.THEME.THEME===false?"black":"#fff"}]}>0.00</Text>
          </View>

          <View style={{flexDirection:"row",justifyContent:"space-between"}}>
          <View style={{flexDirection:"row",justifyContent:"center",alignItems:"center"}}>
          <Image source={{uri:"https://tokens.pancakeswap.finance/images/0x55d398326f99059fF775485246999027B3197955.png"}} style={styles.img_icon} />
          <Text style={[styles.text,{color:state.THEME.THEME===false?"black":"#fff",margin:hp(1)}]}>USDT</Text>
          </View>
          <Text style={[styles.text,{color:state.THEME.THEME===false?"black":"#fff"}]}>0.00</Text>
          </View>
      </View>
      <TouchableOpacity style={[styles.Add_asset_btn,{alignSelf:"flex-end",justifyContent:"center",marginRight:wp(4),marginTop:hp(1),}]} onPress={()=>{setView_assets(false)}}>
    <Text style={[styles.text,{ fontSize:17, textAlign:"center",margin:hp(0),color:state.THEME.THEME===false?"black":"#fff"}]}>Back</Text>
</TouchableOpacity>
</>}

      <Modal
        animationType="slide"
        transparent={true}
        visible={open_offer}
      >
        <TouchableOpacity style={styles.chooseModalContainer} onPress={() => setopen_offer(false)}>
          <View style={[styles.chooseModalContent]}>
            <FlatList
              data={chooseItemList_1}
              renderItem={chooseRenderItem_1}
              keyExtractor={(item) => item.id.toString()}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={open_chain}
      >
        <TouchableOpacity style={styles.chooseModalContainer} onPress={() => setopen_chain(false)}>
          <View style={[styles.chooseModalContent]}>
            <FlatList
              data={Route==="ETH"?ETH_COIN:BNB_COIN}
              renderItem={token_show}
              keyExtractor={(item) => item.id.toString()}
            />
          </View>
        </TouchableOpacity>
      </Modal>



    </Animated.View>
   
  );
};

export default Nfts;

const styles = StyleSheet.create({
  mainContainer: {
    height: hp(100),
    backgroundColor: "#fff",
    paddingLeft:wp(3)
  },
  chooseModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  chooseModalContent: {
    backgroundColor: 'rgba(33, 43, 83, 1)',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxHeight: '80%',
  },
  chooseItemText: {
    fontSize: 19,
    color: '#fff',
    marginLeft:wp(3)
  },
  drop_down_con:{
    width:wp(94),
    height:hp(8),
    marginTop:hp(3),
    borderColor: "#4CA6EA",
    borderWidth:1,
    borderRadius:10,
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center"
  },
  drop_down_View:{
    width:wp(94),
    marginTop:hp(1.5),
    borderColor: "#4CA6EA",
    borderWidth:1,
    borderRadius:10,
    justifyContent:"space-between",
  },
  Add_asset_btn:{
    width:wp(40),
    height:hp(6),
    marginTop:hp(3),
    borderColor: "#4CA6EA",
    borderWidth:1,
    borderRadius:10,
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center"
  },
  img:{
    width:hp(10),
    height:hp(10),
    alignSelf:"center",
    marginTop:hp(10)
  }, 
  chooseItemContainer: {
    marginVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'rgba(28, 41, 77, 1)',
    borderWidth: 0.9,
    borderBottomColor: '#fff',
    marginBottom: 4,
  },
  text:{
    margin:hp(2),
    textAlign:"left",
    fontSize:hp(2)
  },
  btnContainer:{
    marginTop:hp(2),
    alignSelf:"center",
    width:wp(30),
    padding:hp(2),
    backgroundColor:"#e8f0f8",
    borderRadius:hp(10)
  },
  btnText:{
    textAlign:"center"
  },
  img_icon: { height: hp(3.3), width: wp(7.4), borderWidth: 1, borderRadius: hp(3),marginLeft:wp(2) }
});
