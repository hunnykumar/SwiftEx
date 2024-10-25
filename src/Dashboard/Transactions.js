import React, { useEffect, useState } from "react";
import Icon from 'react-native-vector-icons/FontAwesome'
import { useIsFocused, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useSelector } from "react-redux";
import { Avatar, Card, Title, Paragraph } from "react-native-paper";
import Bnbimage from "../../assets/bnb-icon2_2x.png";
import Etherimage from "../../assets/ethereum.png";
import stellar_img from "../../assets/Stellar_(XLM).png";
import Xrpimage from "../../assets/xrp.png";
import Maticimage from "../../assets/matic.png";
import title_icon from "../../assets/title_icon.png";
import AsyncStorageLib from "@react-native-async-storage/async-storage";
import { Wallet_screen_header } from "./reusables/ExchangeHeader";

const Transactions = (props) => {
  const navi=useNavigation();
  const [transactions, setTransactions] = useState("");
  const state = useSelector((state) => state);
  const isFocused=useIsFocused();
  const getTransactions = async () => {
    const user = await AsyncStorageLib.getItem("user");
    await AsyncStorageLib.getItem(`${user}-transactions`).then(
      (transactions) => {
        const data = JSON.parse(transactions);
        if (data) {
          setTransactions(data.reverse());
        }
      }
    );
    /*  const token = await state.token
        const user = await state.user
        
try{
     let   response = await fetch(`http://${urls.testUrl}/user/getTransactions`, {
    method: 'POST',
    headers: {
             Accept: 'application/json',
             'Content-Type': 'application/json'
    },
   body: JSON.stringify({
    token:token,
    user:user})
   }).then((response) => response.json())
   .then((responseJson) => {
    console.log(responseJson.responseData)
    if(responseJson.responseData){

      setTransactions(responseJson.responseData.reverse())
    }
   
    
    
  
  }).catch((error)=>{
    console.log(error)
  })
}catch(e){
  console.log(e)
  alert(e)
}
*/
  };
  let LeftContent = (props) => <Avatar.Image {...props} source={title_icon} />;
  let multiCoinLeftContent = (props) => (
    <Avatar.Image {...props} source={title_icon} />
  );
  let EtherLeftContent = (props) => (
    <Avatar.Image {...props} source={Etherimage} />
  );
  let BnbLeftContent = (props) => <Avatar.Image {...props} source={Bnbimage} />;
  let XrpLeftContent = (props) => <Avatar.Image {...props} source={Xrpimage} />;
  let MaticLeftContent = (props) => (
    <Avatar.Image {...props} source={Maticimage} />
  );
  useEffect(() => {
    const fetch_transactions=async()=>{
      try {
        await getTransactions();
       } catch (error) {
        console.log("***",error)
       }
    }
    fetch_transactions()
  }, [isFocused]);

  return (
    <View
      style={{
        height: hp(100),
        backgroundColor: state.THEME.THEME===false?"#fff":"black",
      }}
    >
      <Wallet_screen_header title="Transactions" onLeftIconPress={() => navi.goBack()} />
      <View style={[styles.footer,{backgroundColor: state.THEME.THEME===false?"#fff":"black"}]}>
        <View elevation={5} style={{ height: hp(100) }}>
          <ScrollView
            alwaysBounceVertical={true}
            style={{ marginBottom: hp(10) }}
          >
  
            {transactions[0] ? (
              transactions.map((item) => {
                const hash = item.hash;
                console.log(item);
                let LeftContent;
                console.log(item.walletType);
                if (item.chainType === "XLM") {
                  LeftContent = stellar_img;
                } else if (item.walletType === "Ethereum") {
                  LeftContent = Etherimage;
                } else if (item.walletType === "BSC") {
                  LeftContent = Bnbimage;
                } else if (item.walletType == "Xrp") {
                  LeftContent = Xrpimage;
                } else if (item.walletType == "Matic") {
                  LeftContent = Maticimage;
                } else if (item.walletType === "Multi-coin"||item.walletType === "") {
                  if (item.chainType === "Eth") {
                    LeftContent = Etherimage;
                  } else if (item.chainType === "BSC") {
                    LeftContent = Bnbimage;
                  } else if (item.chainType === "Matic") {
                    LeftContent = Maticimage;
                  } else if (item.chainType === "Xrp") {
                    LeftContent = Xrpimage;
                  } else {
                    LeftContent = multiCoinLeftContent; //props => <Avatar.Image {...props}  source={{ uri: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png?1644979850' }} />
                  }
                } else {
                  let multiCoinLeftContent = (props) => (
                    <Avatar.Image {...props} source={title_icon} />
                  );

                  LeftContent = multiCoinLeftContent; //props => <Avatar.Image {...props}  source={{ uri: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png?1644979850' }} />
                }
                const data = {
                  hash: hash,
                  walleType: item.walletType,
                  chainType: item.chainType,
                };
                return (
                  <TouchableOpacity
                    key={item.hash}
                    onPress={() => {
                      if (!item.chainType && !item.walletType) {
                        return alert(
                          "Chain not supported for checking In-App transaction details "
                        );
                      }
                      props.navigation.navigate("TxDetail", { data });
                    }}
                  >
                    <View style={styles.flatView}>
                      <Image source={LeftContent} style={styles.img} />
                      <View style={{ marginHorizontal: wp(3) }}>
                        <View style={{flexDirection:"row",width:wp(70),justifyContent:"space-between"}}>
                          <Text style={{color: state.THEME.THEME===false?"black":"#fff"}}>{item.type}</Text>
                          {item.type==="Send"?Platform.OS==="android"?<View style={{transform:[{rotate:'46deg'}]}}><Icon name="arrow-up" size={23} color="red"/></View>:<View style={{transform:[{rotate:'46deg'}]}}><Icon name="arrow-up" size={23} color="red"/></View>:<></>}
                          {item.type==="Recieved"?Platform.OS==="android"?<View style={{transform:[{rotate:'230deg'}],marginLeft:"91%"}}><Icon name="arrow-up" size={23} color="green"/></View>:<View style={{transform:[{rotate:'230deg'}],marginLeft:"91%"}}><Icon name="arrow-up" size={23} color="green"/></View>:<></>}
                          {item.type==="Swap"? <Icon type={"fa"} name="exchange" size={23} color="green" />:<></>}                
                        </View>
                        <Text style={[styles.text,{color: state.THEME.THEME===false?"black":"#fff"}]} numberOfLines={1}>
                          {item.hash}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text
                style={{
                  color: state.THEME.THEME===false?"black":"#fff",
                  textAlign: "center",
                  fontSize: 19,
                  marginTop: hp(40),
                }}
              >
                No transactions yet!
              </Text>
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

export default Transactions;

const styles = StyleSheet.create({
  Amount: {
    display: "flex",
    alignItems: "center",
    textAlign: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    color: "black",
    fontSize: hp("3"),
    padding: 26,
  },
  noteHeader: {
    backgroundColor: "#42f5aa",
    alignItems: "center",
    justifyContent: "center",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  footer: {
    flex: 1,
    backgroundColor: "white",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    borderRadius: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "grey",
    width: wp("95"),
    margin: 10,
    borderRadius: 10,
    shadowColor: "#000",
    height: hp("5"),
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,

    elevation: 24,
  },

  textInput2: {
    borderWidth: 1,
    borderColor: "grey",
    width: wp("40"),
    margin: 10,
    borderRadius: 10,
    shadowColor: "#000",
    height: hp("7"),
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,

    elevation: 24,
  },

  addButton: {
    position: "absolute",
    zIndex: 11,
    right: 20,
    bottom: 30,
    backgroundColor: "red",
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },
  addButton2: {
    position: "absolute",
    zIndex: 11,
    left: 20,
    bottom: 40,
    backgroundColor: "green",
    width: 80,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 18,
  },
  flatView: {
    width: wp(90),
    padding: hp(1),
    flexDirection: "row",
    alignSelf: "center",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth * 1,
    borderColor: "gray",
    marginTop: hp(2),
    alignItems: "center",
  },
  img: {
    height: hp(5),
    width: wp(9),
    borderRadius: hp(3),
  },
  text: {
    color: "gray",
    fontSize: 12,
    width: wp(75),
    marginVertical: hp(0.5),
  },
});
