import { Keyboard, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "../../../../../../icon";
import {
   widthPercentageToDP as wp,
   heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { useEffect } from "react";

const Subscription = () => {
   const FOCUSED = useIsFocused();
   const navigation = useNavigation();
   const [avl_plan, setavl_plan] = useState([
      { id: 1, month: "1 month", save_on_price: 16, org_price: "5", current_price: "Free", type: "Mothly", subscriber_type: "" },
      { id: 2, month: "3 month", save_on_price: 16, org_price: "15", current_price: "14.6", type: "Quarter", subscriber_type: "MOST POPULAR" },
      { id: 3, month: "Yearly", save_on_price: 16, org_price: "60", current_price: "58", type: "Yearly", subscriber_type: "BEST VALUE" }
   ]);
   const [higlight, sethiglight] = useState(0)

   useEffect(() => {
      sethiglight(0)
   }, [FOCUSED])

   const manage_function_call = async (higligh) => {
      if (higligh===0) {
         navigation.navigate("exchange");
      }
      else{
         navigation.navigate("Subcription_payment",{ID:higligh});
      }
   }
   return (
      <View style={styles.content} onPress={() => { Keyboard.dismiss() }}>
         <Icon
            name={"left"}
            type={"antDesign"}
            size={30}
            color={"white"}
            style={styles.top_back}
            onPress={() => navigation.navigate("Home")}
         />
         <Text style={styles.top_heading}>Choose Your Plan</Text>

         <View style={styles.plan_container} >
            {avl_plan.map((list, index) => {
               return (
                  <TouchableOpacity style={[styles.plan_info, { backgroundColor: higlight === index ? "rgba(42, 84, 156, 1)rgba(43, 82, 147, 1)" : "#011434", }]} onPress={() => { sethiglight(index) }} onLongPress={()=>{navigation.navigate("Subscription_det",{ID:index})}}>
                     <View>
                        {
                           higlight === index &&
                           <View style={styles.Check_box}>
                           <Icon name={"check"} type={"materialCommunity"} size={30} color={"#fff"}/>
                           </View>
                        }
                        <View style={{ flexDirection: "row", justifyContent: list.id !== 1 && "center", alignItems: "center", marginTop: list.id !== 1 && hp(3), marginHorizontal: wp(3) }}>
                           <Text style={styles.comman_text}>{list.month}</Text>
                           {list.id !== 1 && <View style={styles.sub_type}>
                              <Text style={{ fontSize: 11, textAlign: "center" }}>{list.subscriber_type}</Text>
                           </View>}
                        </View>
                        <Text style={[styles.comman_text_1, { fontWeight: "300", fontSize: 16, marginHorizontal: wp(3) }]}>+Save {list.save_on_price}%</Text>
                        {list.id === 1 &&
                           <View style={{ width: wp(60), marginHorizontal: wp(3) }}>
                              <Text style={styles.sub_txt}>
                                 Enjoy free access for a limited time!{'\n'}
                                 Don't miss out on this opportunity to experience all
                                 premium features at no cost for a short period.
                              </Text>
                           </View>}
                     </View>
                     <View style={[styles.right_container, { marginTop: hp(2), marginRight: wp(2) }]}>
                        <View style={{ position: "relative" }}>
                           <Text style={[styles.comman_text_1,{color:"silver"}]}>${list.org_price}</Text>
                           <View style={[styles.line_half, { width: list.id === 3 ? wp(16) : list.id === 2 ? wp(15) : wp(12), }]} />
                        </View>
                        <Text style={styles.comman_text_1}>${list.current_price}</Text>
                        <Text style={[styles.comman_text_1, { fontSize: 13, fontWeight: "400" }]}>{list.type}</Text>
                     </View>
                  </TouchableOpacity>
               )
            })}
            <Text style={styles.note_txt}>
               Upon Purchasing This Subscription Plan, Your{'\n'}Subscription Will Be Instantly Activated,And{'\n'}Your Premium Account Will Grant You Full Access To All Exclusive Features. You Can Cancel This Plan At Any Time
            </Text>
            <TouchableOpacity style={styles.btn} onPress={() => { manage_function_call(higlight) }}>
               <Text style={styles.btn_txt}>Continue to Purchase</Text>
            </TouchableOpacity>
            <Text style={styles.btom_txt}>Terms And Conditions / Privacy Police</Text>
         </View>
      </View>
   )
}
export default Subscription;
const styles = StyleSheet.create({
   content: {
      flex: 1,
      backgroundColor: "#011434",
   },
   top_back: {
      marginLeft: wp(4.3),
      marginTop: hp(3)
   },
   top_heading: {
      marginTop: hp(4),
      fontSize: 30,
      fontWeight: "600",
      color: "#fff",
      marginHorizontal: wp(6)
   },
   plan_container: {
      width: wp(90),
      alignSelf: "center",
      marginTop: hp(2)
   },
   plan_info: {
      width: wp(90),
      height: hp(15),
      marginTop: 14,
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 6,
      borderRadius: 10,
      borderColor: "#2F9CDC",
      borderWidth: 1
   },
   comman_text: {
      color: "#fff",
      fontSize: 26,
      fontWeight: "800"
   },
   comman_text_1: {
      color: "#fff",
      fontSize: 24,
      fontWeight: "800"
   },
   sub_type: {
      backgroundColor: "rgba(230, 114, 41, 1)rgba(183, 154, 30, 1)",
      height: hp(2.5),
      borderRadius: 5,
      padding: 4,
      marginLeft: wp(4)
   },
   right_container: {
      alignItems: "center"
   },
   sub_txt: {
      fontSize: 10,
      color: "#fff"
   },
   note_txt: {
      fontSize: 15,
      color: "gray",
      marginTop: hp(3)
   },
   btn: {
      alignSelf: "center",
      backgroundColor: "rgba(47, 125, 255, 1)rgba(0, 77, 206, 1)",
      paddingHorizontal: wp(13),
      paddingVertical: 15,
      borderRadius: 20,
      marginTop: hp(4)
   },
   btn_txt: {
      fontSize: 20,
      color: "#fff",
      fontWeight: "600"
   },
   btom_txt: {
      fontSize: hp(1.6),
      color: "rgba(255, 255, 255, 0.77)",
      fontWeight: "600",
      alignSelf: "center",
      marginTop: hp(4)
   },
   line_half: {
      height: "39%",
      top: hp(0.5),
      borderBottomColor: "silver",
      borderBottomWidth: 2,
      position: "absolute",
      marginLeft: wp(-2)
   },
   Check_box: {
      top: hp(5),
      height:hp(4),
      width:wp(8.5),
      backgroundColor:"rgba(230, 114, 41, 1)rgba(230, 161, 32, 1)",
      borderRadius:24,
      position: "absolute",
      marginLeft: wp(-6),
      alignContent:"center",
      justifyContent:"center"
   }
});