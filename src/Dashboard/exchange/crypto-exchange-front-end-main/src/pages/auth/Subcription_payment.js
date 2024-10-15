import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "../../../../../../icon";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useState } from "react";
import { useEffect } from "react";
import upi_img from "../../../../../../../assets/upi_img.png"
import rupay from "../../../../../../../assets/rupay.png"
import mastercard from "../../../../../../../assets/mastercard.png"
import visa from "../../../../../../../assets/visa.png"
import phonepe from "../../../../../../../assets/phonepe.png"
import paytm from "../../../../../../../assets/paytm.png"
import googlepay from "../../../../../../../assets/google-pay.png"




const Subcription_payment = ({ route }) => {
    const { ID } = route.params;
    const FOCUSED = useIsFocused();
    const navigation = useNavigation();
    const [expire_plan, setexpire_plan] = useState("");
    const [avl_plan, setavl_plan] = useState([
        { id: 1, month: "1 month", save_on_price: 16, org_price: "5", current_price: "Free", type: "Mothly", subscriber_type: "" },
        { id: 2, month: "3 month", save_on_price: 16, org_price: "15", current_price: "$ 14.6", type: "Quarter", subscriber_type: "MOST POPULAR" },
        { id: 3, month: "Yearly", save_on_price: 16, org_price: "60", current_price: "$ 58", type: "Yearly", subscriber_type: "BEST VALUE" }
    ]);
    const [avl_payment, setavl_payment] = useState([
        { id: 1, url_img: phonepe, text_upi: "PhonePe UPI" },
        { id: 2, url_img: paytm, text_upi: "Paytm UPI" },
        { id: 3, url_img: googlepay, text_upi: "Google Pay" },
        { id: 4, url_img: googlepay, text_upi: "Enter UPI id" },
    ]);
    const [selected, setselected] = useState(0);
    const PlanExpire = (time_line) => {
        let today = new Date();
        let expire_date = new Date(today);

        switch (time_line) {
            case '1 month':
                expire_date.setMonth(today.getMonth() + 1);
                break;
            case '3 month':
                expire_date.setMonth(today.getMonth() + 3);
                break;
            case 'Yearly':
                expire_date.setFullYear(today.getFullYear() + 1);
                break;
            default:
                console.log('Invalid subscription time line.');
                return;
        }

        const day = expire_date.getDate();
        const year = expire_date.getFullYear();
        const months = [
            "January", "February", "March", "April", "May", "June", "July",
            "August", "September", "October", "November", "December"
        ];
        const month = months[expire_date.getMonth()];
        return `Valid till ${day} ${month} ${year}`;
    }
    useEffect(() => {
        const res = PlanExpire(avl_plan[ID].month)
        setexpire_plan(res);
    }, [FOCUSED])
    return (
        <View style={styles.content} onPress={() => { Keyboard.dismiss() }}>
            <Icon
                name={"left"}
                type={"antDesign"}
                size={30}
                color={"white"}
                style={styles.top_back}
                onPress={() => navigation.goBack()}
            />
            <Text style={styles.top_heading}>Payment</Text>
            <View style={styles.plan_container} >
                <View style={styles.plan_details}>
                    <View style={styles.Check_box}>
                        <Icon name={"check"} type={"materialCommunity"} size={33} color={"#fff"} />
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginHorizontal: wp(5) }}>
                        <View style={[styles.right_container, { alignItems: "flex-start", }]}>
                            <Text style={styles.comman_text}>{avl_plan[ID].month}</Text>
                            <Text style={styles.expire_text}>{expire_plan}</Text>
                        </View>

                        <View style={[styles.right_container, { marginRight: wp(2) }]}>
                            <Text style={styles.comman_text_1}>{avl_plan[ID].current_price}</Text>
                            <Text style={[styles.comman_text_1, { fontSize: 13, fontWeight: "400" }]}>{avl_plan[ID].type}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.payment_methods} >
                    <Image source={upi_img} style={{ height: hp(3), width: wp(20) }} />
                    {avl_payment.map((list, index) => {
                        return (
                            <TouchableOpacity style={styles.payment_method_selection} onPress={() => { setselected(index) }}>
                                {list.id === 4 ? <Icon name={"add-circle-outline"} type={"ionicon"} size={26} color={"white"} /> : <Image source={list.url_img} style={{ height: hp(4), width: list.id === 1 ? wp(26) : wp(10), marginLeft: list.id === 1 && wp(-5) }} />}
                                <Text style={[styles.comman_text_1, { fontSize: 13, fontWeight: "600", marginLeft: list.id === 1 && wp(-8) }]}>{list.text_upi}</Text>
                                <TouchableOpacity style={{ height: hp(2), width: wp(4.5), borderColor: "#fff", borderWidth: wp(0.5), borderRadius: 10, backgroundColor: selected === index ? "green" : "#011434" }} onPress={() => { setselected(index) }} />
                            </TouchableOpacity>
                        )
                    })}
                </View>

            </View>
            <View style={styles.cards_con}>
                <TouchableOpacity style={styles.cards_con_add} onPress={() => { setselected(4) }}>
                    <Icon name={"card-outline"} type={"ionicon"} size={26} color={"white"} />
                    <Text style={[styles.comman_text_1, { fontSize: 13, fontWeight: "600", paddingHorizontal: wp(10) }]}>credit/Debit/ATM Card</Text>
                    <TouchableOpacity style={{ height: hp(2), width: wp(4.5), borderColor: "#fff", borderWidth: wp(0.5), borderRadius: 10, backgroundColor: selected === 4 ? "green" : "#011434" }} onPress={() => { setselected(4) }} />
                </TouchableOpacity>
                <View style={styles.cards_ads_con}>
                    <Image source={visa} style={{ height: hp(3), width: wp(20) }} />
                    <Image source={mastercard} style={{ height: hp(3), width: wp(10) }} />
                    <Image source={rupay} style={{ height: hp(3), width: wp(20) }} />
                </View>
            </View>

            <View style={styles.bottom_pay_con}>
                <View style={styles.bottom_pay_price_con}>
                    <Text style={styles.bottom_pay_price_txt}>{avl_plan[ID].current_price}</Text>
                    <Text style={[styles.bottom_pay_price_txt, { fontSize: 15, fontWeight: "300" }]}>To be paid now</Text>
                </View>

                <TouchableOpacity style={styles.btn} onPress={()=>{navigation.navigate("exchange");}}>
                    <Text style={styles.btn_txt}>Proceed to Pay</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}
export default Subcription_payment;

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
        width: wp(95),
        alignSelf: "center",
        marginTop: hp(2),
        padding: 10
    },
    plan_details: {
        backgroundColor: "rgba(42, 84, 156, 1)rgba(43, 82, 147, 1)",
        borderRadius: 10,
        paddingVertical: wp(5)
    },
    comman_text: {
        color: "#fff",
        fontSize: 26,
        fontWeight: "800"
    },
    expire_text: {
        color: "orange",
        fontSize: 12,
        fontWeight: "500",
        marginTop: hp(0.2)
    },
    comman_text_1: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "800"
    },
    right_container: {
        alignItems: "center",
        paddingVertical: hp(0.5),
        paddingLeft: wp(2)
    },
    Check_box: {
        alignContent:"center",
        justifyContent:"center",
        top: hp(3),
        height: hp(4),
        width: wp(8.6),
        backgroundColor: "rgba(230, 114, 41, 1)rgba(230, 161, 32, 1)",
        borderRadius: 24,
        position: "absolute",
        marginLeft: wp(-4),
    },
    payment_methods: {
        borderColor: "gray",
        borderWidth: 1,
        borderRadius: 10,
        paddingVertical: hp(2),
        paddingHorizontal: wp(3.5),
        top: hp(3)
    },
    payment_method_selection: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomColor: "silver",
        borderBottomWidth: 2,
        width: wp(82),
        marginTop: hp(2)
    },
    cards_con: {
        marginTop: hp(4),
        width: wp(90),
        borderColor: "gray",
        borderWidth: 1,
        alignSelf: "center",
        borderRadius: 10,
    },
    cards_con_add: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: wp(90),
        alignItems: "center",
        paddingVertical: hp(1)
    },
    cards_ads_con: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: hp(1),
        width: wp(60),
        alignSelf: "center",
        paddingBottom: hp(1.5)
    },
    bottom_pay_con:{
        width:wp(98),
        alignSelf:"center",
        flexDirection:"row",
        paddingHorizontal:wp(-1),
        justifyContent:"space-around",
        top:hp(13)
    },
    bottom_pay_price_con:{
        justifyContent:"center",
        alignItems:"flex-start"
    },
    bottom_pay_price_txt:{
        fontSize:31,
        fontWeight:"800",
        color:"#fff"
    },
    btn: {
       backgroundColor: "rgba(47, 125, 255, 1)rgba(0, 77, 206, 1)",
       paddingHorizontal: wp(9),
       paddingVertical: 19,
       borderRadius: 20
    },
    btn_txt: {
       fontSize: 17,
       color: "#fff",
       fontWeight: "600"
    },
});