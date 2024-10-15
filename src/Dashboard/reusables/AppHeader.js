import { View, Text, StyleSheet, Image, TouchableOpacity,Platform } from "react-native";
import React from "react";
import Icon from "../../icon";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import darkBlue from "../../../assets/darkBlue.png";
import { REACT_APP_LOCAL_TOKEN } from "../exchange/crypto-exchange-front-end-main/src/ExchangeConstants";
import { useSelector } from "react-redux";

export const AppHeader = ({name}) => {
  const state=useSelector((state)=>state);
  const navigation = useNavigation();
//   return (
//     <View>
//     {Platform.OS==="android"?<View style={styles.headerContainer1}>
//     <TouchableOpacity style={styles.backicon} onPress={()=>{navigation.navigate("Home")}}>
//     <Icon name={"left"} type={"antDesign"} size={23} color={"white"} style={{justifyContent:"center",alignSelf:'center',marginLeft:'3%'}}/>
//      </TouchableOpacity>
//      <View style={styles.backicon}>
//      {Platform.OS == "android" ?<Text style={styles.text}>{name}</Text>:<Text style={styles.text_ios}>{name}</Text>}
//      </View>
//      <View style={styles.backicon}>
//       <TouchableOpacity onPress={()=>{navigation.navigate("Home")}}>
//        <Image source={darkBlue} style={styles.logoImg}/>
//       </TouchableOpacity>
//      </View> 
//   </View>:<View style={styles.headerContainer1}>
//     <TouchableOpacity style={styles.backicon} onPress={()=>{navigation.navigate("Home")}}>
//     <Icon name={"left"} type={"antDesign"} size={23} color={"white"} style={{justifyContent:"center",alignSelf:'center',marginLeft:'3%'}}/>
//      </TouchableOpacity>
//      <View style={styles.backicon}>
//      <Text style={styles.text_ios}>{name}</Text>
//      </View>
//      <View style={styles.backicon}>
//       <TouchableOpacity onPress={()=>{navigation.navigate("Home")}}>
//        <Image source={darkBlue} style={styles.logoImg}/>
//       </TouchableOpacity>
//      </View> 
//   </View>}
//   </View>
//   )
// };

// const styles = StyleSheet.create({
//   mainContainer: {
//     backgroundColor: "#fff",
//     height: hp(47),
//   },
//   iconContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     width: hp(40),
//     alignSelf: "center",
//     marginTop: hp(3),
//   },
//   dollarText: {
//     textAlign: "center",
//     color: "black",
//     fontSize: 30,
//     marginTop: hp(3),
//   },
//   textwithIcon: {
//     flexDirection: "row",
//     alignSelf: "center",
//     marginTop: hp(2),
//   },
//   textColor: {
//     color: "gray",
//   },
//   iconsContainer: {
//     flexDirection: "row",
//     justifyContent: "space-evenly",
//     marginTop: hp(5),
//   },
//   iconTextContainer: {
//     flexDirection: "row",
//     justifyContent: "center",
//   },
//   iconmainContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     width: hp(42),
//     alignSelf: "center",
//     marginTop: hp(5),
//     height: hp(9),
//     alignItems: "center",
//     borderRadius: hp(2),
//     padding: hp(2),
//     backgroundColor: "#e8f0f8",
//   },
//   numberContainer: {
//     backgroundColor: "#9bbfde",
//     width: hp(4.3),
//     height: hp(4.3),
//     borderRadius: hp(10),
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   number: {
//     textAlign: "center",
//     color: "#fff",
//     backgroundColor: "#145DA0",
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: hp(10),
//   },
//   headerContainer: {
//     backgroundColor: "#010C66",
//     height: hp(10),
//     alignItems: "center",
//     justifyContent: "space-between",
//     flexDirection: "row",
//     width: wp(100),
//     paddingHorizontal: wp(5),
//   },
//   headerContainer1: {
//     backgroundColor: "#4CA6EA",
//     width:wp(100),
//     flexDirection:'row'
//   },
//   logoImg: {
//     height: hp("9"),
//     width: wp("12"),
//     marginHorizontal:wp(27)
//   },
//   text: {
//     // color: "#010C66",
//     color:"white",
//     fontWeight: "700",
//     alignSelf: "center",
//     textAlign: "center",
//     marginLeft: wp(35),
//     fontSize:17,
//   },
//   backicon:{
//     justifyContent:"center",
//     alignSelf:'center'
//   },
//   text_ios: {
//     color:"white",
//     fontWeight: "bold",
//     alignSelf: "center",
//     top:26,
//     fontSize:17,
//     marginLeft:wp(34)
//   },
// });

return (
<View style={[styles.header,{backgroundColor:state.THEME.THEME===false? "#4CA6EA":"black",borderBottomColor:state.THEME.THEME===false? "#4CA6EA":"gray",borderWidth:0.5}]}>
    <TouchableOpacity style={styles.backButton} onPress={()=>{navigation.navigate("Home")}}>
    <Icon name={"left"} type={"antDesign"} size={29} color={"white"}/>
    </TouchableOpacity>
    {Platform.OS==='android'?<Text style={[styles.headerText_android,]}>{name}</Text>:<Text style={styles.headerText}>{name}</Text>}
    <TouchableOpacity onPress={()=>{navigation.navigate("Home")}}>
    <Image source={darkBlue} style={styles.headerImage} />
    </TouchableOpacity>
  </View>  
);
};

const styles = StyleSheet.create({
header: {
  backgroundColor: '#4CA6EA',
  paddingTop: 10,
  paddingBottom: 5,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
},
backButton: {
  paddingHorizontal: 10,
},
headerText_android:{
  fontSize: 20,
  fontWeight: 'bold',
  color: 'white',
  paddingTop:3,
  paddingLeft:32
},
headerText: {
  fontSize: 20,
  fontWeight: 'bold',
  color: 'white',
  paddingTop:19,
  paddingLeft:40
},
headerImage: {
  width: 80,
  height: 60,
  borderRadius: 20,
  marginRight: 3,
}
});