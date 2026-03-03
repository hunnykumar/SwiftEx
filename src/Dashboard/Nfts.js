import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useSelector } from "react-redux";
import { Animated } from "react-native";
import Token_Import from "./Token_Import";

const Nfts = () => {
  const state = useSelector((state) => state);
  return (
    <Animated.View
      style={[styles.mainContainer, { backgroundColor: state.THEME.THEME === false ? "#ebe8e8" : "black" }]}>
      <Token_Import />
    </Animated.View>

  );
};

export default Nfts;

const styles = StyleSheet.create({
  mainContainer: {
    height: hp(100),
    backgroundColor: "#fff",
  }
});
