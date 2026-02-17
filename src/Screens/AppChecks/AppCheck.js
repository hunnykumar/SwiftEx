import { View, Text, StyleSheet, Image, TouchableOpacity, BackHandler } from 'react-native';
import darkBlue from '../../../assets/darkBlue.png'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
export const AppCheck = ({ route }) => {
  const indexId = route.params?.info || 0;
  const info = [
    {
      heading: "Currently Unavailable in Your Area",
      subHeading: "This service has not yet launched in your region. Stay tuned — we hope to serve your area in the near future."
    },
    {
      heading: "We're Currently Experiencing Issues",
      subHeading: "We are currently investigating a service disruption affecting some users. We apologize for the inconvenience and appreciate your understanding while we resolve this issue."
    }
  ]
  return (
    <View style={styles.container}>
      <View style={styles.upperCon}>
        <Image source={darkBlue} style={styles.imageCon} />
        <Text style={styles.headingText}>{info[indexId].heading}</Text>
        <Text style={styles.subHeadingText}>{info[indexId].subHeading}</Text>
      </View>
      <TouchableOpacity style={styles.btnCon} onPress={() =>  BackHandler.exitApp() }>
        <Text style={styles.btnTxt}>Okay</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "black"
  },
  imageCon: {
    width: wp(65),
    height: hp(25),
  },
  headingText: {
    fontSize: 18,
    color: "#fff",
    width: "90%",
    textAlign: "center",
    fontWeight: "800",
    paddingVertical: hp(2)
  },
  subHeadingText: {
    fontSize: 15,
    color: "#fff",
    width: "90%",
    textAlign: "center",
    fontWeight: "600",
    marginTop: hp(-1)
  },
  upperCon: {
    height: hp(80),
    width: wp(100),
    alignItems: "center",
    justifyContent: "center"
  },
  btnCon: {
    height: hp(6),
    justifyContent: "center",
    borderRadius: 20,
    width: wp(95),
    backgroundColor: "#4052D6"
  },
  btnTxt: {
    color: "#fff",
    fontSize: 20,
    textAlign: "center",
    fontWeight: "400"
  }
});
