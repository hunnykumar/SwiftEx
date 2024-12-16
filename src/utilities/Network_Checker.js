import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  Animated 
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useSelector } from 'react-redux';

const { width } = Dimensions.get('window');

const Network_Checker = () => {
  const THEME = useSelector((state) => state?.THEME?.THEME);
  const [isConnected, setIsConnected] = useState(true);
  const [animationStage, setAnimationStage] = useState(0);
  const pulseAnimation = new Animated.Value(1);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setAnimationStage(prev => (prev + 1) % 4);
    }, 500);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const renderNetworkBars = () => {
    return [1, 2, 3, 4].map((bar, index) => (
      <View 
        key={bar}
        style={[
          styles.networkBar, 
          {
            backgroundColor: index < animationStage + 1 
              ? '#22c55e'  // green-500
              : 'rgba(220, 38, 38, 0.3)',  // red-600 with opacity
            height: bar * 40
          }
        ]}
      />
    ));
  };

  if (isConnected) return null; // Don't render if connected

  return (
      <View style={[styles.content,{backgroundColor:THEME===false?"#fff":"black"}]}>
        <Animated.View style={[styles.networkSignal, { transform: [{ scale: pulseAnimation }] }]}>
          {renderNetworkBars()}
        </Animated.View>
        <Text style={styles.errorTitle}>
        No Internet Connection
        </Text>
        <Text style={styles.errorSubtitle}>It looks like you're offline.</Text>
        <Text style={styles.infoText}>Please check your connection and try again.</Text>
      </View>
  );
};

const styles = StyleSheet.create({
  content: {
    justifyContent:"center",
    alignItems: 'center',
    width: '100%',
    height:"100%",
    backgroundColor:"#0B2A58"
  },
  networkSignal: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 25,
    height: 160,
  },
  networkBar: {
    width: width * 0.05,
    marginHorizontal: 4,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 13,
  },
  errorSubtitle: {
    fontSize: 18,
    color: '#d1d5db',
    marginBottom: 5,
    textAlign: 'center',
  },
  infoText: {
    color: 'gray',
    textAlign: 'center',
    fontSize: 15,
  }
});

export default Network_Checker;
