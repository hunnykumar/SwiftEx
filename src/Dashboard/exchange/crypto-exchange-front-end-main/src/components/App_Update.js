import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, Dimensions, Alert, Image, Linking } from 'react-native';
import darkBlue from '../../../../../../assets/darkBlue.png'
const { width } = Dimensions.get('window');
const SLIDER_WIDTH = width - 40;
const SLIDER_BUTTON_WIDTH = 60;

export const App_Update = () => {
    const onConfirm=()=>{
        Linking.openURL("https://swiftexchange.io/")
    }
  const translateX = useRef(new Animated.Value(0)).current;
  const [isConfirmed, setIsConfirmed] = useState(false);

  const backgroundColor = translateX.interpolate({
    inputRange: [0, SLIDER_WIDTH - SLIDER_BUTTON_WIDTH],
    outputRange: ['#ddd', '#4CAF50'],
    extrapolate: 'clamp',
  });
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (event, gestureState) => {
      if (gestureState.dx >= 0 && gestureState.dx <= SLIDER_WIDTH - SLIDER_BUTTON_WIDTH) {
        translateX.setValue(gestureState.dx);
      }
    },
    onPanResponderRelease: (event, gestureState) => {
      if (gestureState.dx >= SLIDER_WIDTH - SLIDER_BUTTON_WIDTH - 10) {
        setIsConfirmed(true);
        Animated.spring(translateX, {
          toValue: SLIDER_WIDTH - SLIDER_BUTTON_WIDTH,
          useNativeDriver: true,
        }).start(() => onConfirm && onConfirm());
      } else {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  return (
    <View style={styles.container}>
        <View style={{height:"90%",width:"100%",alignItems:"center",justifyContent:"center"}}>
        <Image source={darkBlue} style={styles.img}/>
        <Text style={styles.text_color}>SwiftEx Update Available!</Text>
        <Text style={[styles.text_color,{fontWeight:"600"}]}>Update now to enjoy new features, better performance, and improved security. </Text>

        </View>
        <View>
        <Animated.View style={[styles.sliderBackground, { backgroundColor }]}>
        <Text style={styles.sliderText}>
          {isConfirmed ? 'Starting' : 'Slide to start download'}
        </Text>
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.sliderButton,
            { transform: [{ translateX }] },
          ]}
        >
          <Text style={styles.buttonText}>{'→'}</Text>
        </Animated.View>
      </Animated.View>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 50,
    backgroundColor:"black"
  },
  img:{
    width:"50%",
    height:"40%",
  },
  text_color:{
    fontSize:16,
    color:"#fff",
    width:"90%",
    textAlign:"center",
    fontWeight:"800",
    paddingVertical:"3%"
  },
  sliderBackground: {
    width: SLIDER_WIDTH,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sliderText: {
    position: 'absolute',
    alignSelf: 'center',
    color: '#555',
    fontSize: 16,
  },
  sliderButton: {
    width: SLIDER_BUTTON_WIDTH,
    height: 50,
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
  },
});
