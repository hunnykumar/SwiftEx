import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

export function Exchange_single_loading () {
    const shimmerAnimation = useRef(new Animated.Value(0)).current;
  
    useEffect(() => {
      const startShimmer = () => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(shimmerAnimation, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(shimmerAnimation, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      };
  
      startShimmer();
    }, []);
  
    const shimmerTranslateX = shimmerAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [-200, 200],
    });
  
    return (
       <View style={styles.loadBlock}>
          <Animated.View
            style={[
              styles.shimmer,
              { transform: [{ translateX: shimmerTranslateX }] },
            ]}
          />
        </View>
    );
  };

export function Wallet_market_loading () {
    const shimmerAnimation = useRef(new Animated.Value(0)).current;
    const obje=[0,1,2,3,4,5,6,7,8,9];
  
    useEffect(() => {
      const startShimmer = () => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(shimmerAnimation, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(shimmerAnimation, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      };
  
      startShimmer();
    }, []);
  
    const shimmerTranslateX = shimmerAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [-200, 200],
    });
  
  return (
    <>
      {obje.map((list,index) => {
        return (
          <View style={styles.Wallet_container}>
            <View style={styles.loadCircle}>
              <Animated.View
                style={[
                  styles.shimmer,
                  { transform: [{ translateX: shimmerTranslateX }] },
                ]}
              />
            </View>
            <View style={{width:"99%"}}>
              <View style={styles.Wallet_loadBlock}>
                <Animated.View
                  style={[
                    styles.shimmer,
                    { transform: [{ translateX: shimmerTranslateX }] },
                  ]}
                />
              </View>
              <View style={styles.Wallet_loadBlock}>
                <Animated.View
                  style={[
                    styles.shimmer,
                    { transform: [{ translateX: shimmerTranslateX }] },
                  ]}
                />
              </View>
            </View>
          </View>
        )
      })}
    </>
  );
};  

export function Exchange_profile_loading () {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startShimmer = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnimation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startShimmer();
  }, []);

  const shimmerTranslateX = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View style={styles.container}>
         <View style={styles.loadCircle}>
        <Animated.View
          style={[
            styles.shimmer,
            { transform: [{ translateX: shimmerTranslateX }] },
          ]}
        />
      </View>
      <View style={styles.loadBlock}>
        <Animated.View
          style={[
            styles.shimmer,
            { transform: [{ translateX: shimmerTranslateX }] },
          ]}
        />
      </View>
      <View style={styles.loadBlock}>
        <Animated.View
          style={[
            styles.shimmer,
            { transform: [{ translateX: shimmerTranslateX }] },
          ]}
        />
      </View>
      <View style={styles.loadBlock}>
        <Animated.View
          style={[
            styles.shimmer,
            { transform: [{ translateX: shimmerTranslateX }] },
          ]}
        />
      </View>
    </View>
  );
};

export function Charts_Loadings () {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startShimmer = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnimation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startShimmer();
  }, []);

  const shimmerTranslateX = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View style={styles.load_block_container}>
      <View style={styles.load_block}>
        <Animated.View
          style={[
            styles.load_block_shimmer,
            { transform: [{ translateX: shimmerTranslateX }] },
          ]}
        />
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  Wallet_container:{
    flexDirection:"row",
    alignContent:"center",
    paddingHorizontal:"5%",
    width:"99%"
  },
  Wallet_loadBlock:{
    height: 25,
    width:"50%",
    marginHorizontal:10,
    marginVertical:3,
    backgroundColor: 'gray',
    opacity:5,
    borderRadius: 13,
    overflow: 'hidden',
  },
  container: {
    padding: 20,
    backgroundColor:"#011434",
    width:"99%"
  },
  loadBlock: {
    height: 29,
    backgroundColor: 'silver',
    borderRadius: 4,
    marginBottom: 10,
    overflow: 'hidden',
  },
  loadCircle: {
    width: 60,
    height: 60,
    backgroundColor: 'gray',
    opacity:5,
    borderRadius: 30,
    overflow: 'hidden',
    alignSelf:"center",
    marginBottom:19
  },
  shimmer: {
    width: 200,
    height: '100%',
    backgroundColor: '#f0f0f0',
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0.5,
  },
  load_block_container: {
    backgroundColor:"#011434",
    width:'90%',
  },
  load_block: {
    height: 250,
    backgroundColor: 'silver',
    borderRadius: 4,
    marginBottom: 10,
    overflow: 'hidden',
  },
  load_block_shimmer:{
    width: 200,
    height: '100%',
    backgroundColor: '#f0f0f0',
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0.5,
  },
});