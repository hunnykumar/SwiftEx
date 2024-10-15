import React from 'react'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Nfts from '../Dashboard/Nfts';
import Token from '../Dashboard/Token';


const WalletTopTab = () => {
    const Tab = createMaterialTopTabNavigator();
    return (
      <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#145DA0',
        tabBarInactiveTintColor: 'black',
        tabBarStyle: {
          backgroundColor: '#fff',
        },
        tabBarLabelStyle: {
          textAlign: 'center',
          fontSize: 12
        },
        tabBarIndicatorStyle: {
          borderBottomColor: '#145DA0',
          borderBottomWidth: 1,
        },
      }}>
        <Tab.Screen name="Token" component={Token} />
        <Tab.Screen name="Nfts" component={Nfts}        />
      </Tab.Navigator>
    );
  };

export default WalletTopTab