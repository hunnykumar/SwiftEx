import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import React, { useState } from "react";
import {
  Text,
  StyleSheet,
  Modal,
  View,
  Pressable,
  Image,
  TouchableOpacity,
} from "react-native";
import Home from "../../../../../../assets/Home.png";
import { LinearGradient } from "react-native-linear-gradient";
import Icon from "../../../../../icon";
import { useNavigation } from "@react-navigation/native";

const BankModel = (props) => {
  const { isVisible, onPress } = props;
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  return (
    <Modal animationType="fade" visible={isVisible}
    // statusBarTranslucent={true}
     transparent={true} 
    animationIn="slideInRight"
        animationOut="slideOutRight"
        animationInTiming={100}
        animationOutTiming={200}
        isVisible={isVisible}
        onBackdropPress={() => {
          onPress()
        }}
        onBackButtonPress={() => {
          //setShowModal(!showModal);
          onPress()
        }}
    >
     <View style={{backgroundColor:"rgb(26,26,26)",height:hp(100),opacity:0.7}}> 

     <View style={styles.modalContent}>
          <Icon
            name={"cross"}
            type={"entypo"}
            size={hp(4)}
            color={"#E96A6A"}
            style={styles.icon}
            onPress={onPress}
          />
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <Image source={Home} style={styles.homeImg} />
            <Text style={styles.hurrayText}>Hurray !</Text>
            <Text style={styles.allText}>
              You have added Bank Account Successfully!
            </Text>
            <LinearGradient
              start={[1, 0]}
              end={[0, 1]}
              style={styles.submitgradientContainer}
              colors={["rgba(70, 169, 234, 1)", "rgba(185, 116, 235, 1)"]}
            >
              <TouchableOpacity
                onPress={() => {
                 // navigation.navigate('HomeScreen');
                 onPress()
                }}
              >
                <Text style={{ color: "#fff" }}>Go To Home</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
     </View>
       
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    height: hp(53),
    width: wp(85),
    marginTop:hp(25),
    alignSelf: "center",
    borderRadius: hp(2),
    backgroundColor: "#131E3A",
    // backgroundColor:"blue"
  },
  homeImg: {
    height: hp(11),
    width: wp(21),
  },
  hurrayText: {
    fontSize: hp(2),
    color: "#fff",
    marginVertical: hp(2.5),
    alignItems: "center",
  },
  allText: {
    color: "#fff",
    width: wp(40),
    textAlign: "center",
  },
  submitgradientContainer: {
    width: wp(40),
    alignSelf: "center",
    marginTop: hp(8),
    height: hp(5),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
  },
  icon: {
    alignSelf: "flex-end",
    padding: hp(1),
  },
});
export default BankModel;
