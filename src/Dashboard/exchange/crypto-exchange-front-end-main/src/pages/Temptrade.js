import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Exchange_screen_header } from '../../../../reusables/ExchangeHeader';
import { useNavigation } from '@react-navigation/native';

const Temptrade = () => {
  const [selectedTab, setSelectedTab] = useState('Buy');
  const [selectedOrderType, setSelectedOrderType] = useState('Limit');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');

  const orderTypes = ['Limit', 'Market', 'Stop Limit'];
  const orderTabs = ['Cross', 'Buy', 'Sell'];
  const percentOptions = ['25%', '50%'];

  // Order book data with volume
  const sellOrders = [
    { price: '23.9860', amount: '$83,661', volume: 22.5 },
    { price: '0.1372', amount: '$83,660', volume: 13.7 },
    { price: '0.0824', amount: '$83,659', volume: 8.2 },
    { price: '0.8685', amount: '$83,658', volume: 44.3 },
    { price: '77.7119', amount: '$83,657', volume: 31.6 },
    { price: '30.0564', amount: '$83,655', volume: 15.9 },
  ];

  const buyOrders = [
    { price: '0.0017', amount: '$83,654', volume: 8.6 },
    { price: '0.2213', amount: '$83,653', volume: 15.2 },
    { price: '0.0297', amount: '$83,649', volume: 23.7 },
    { price: '0.1991', amount: '$83,648', volume: 35.1 },
    { price: '0.0059', amount: '$83,647', volume: 18.9 },
    { price: '0.0859', amount: '$83,640', volume: 27.4 },
  ];

  // Find maximum volume to normalize depth bars
  const maxSellVolume = Math.max(...sellOrders.map(order => order.volume));
  const maxBuyVolume = Math.max(...buyOrders.map(order => order.volume));
const navigation=useNavigation()
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
     <Exchange_screen_header title="Trade" onLeftIconPress={() => navigation.goBack()} onRightIconPress={() => console.log('Pressed')} />

      {/* Trading Pair Selection */}
      <View style={styles.tradingPairContainer}>
        <View style={styles.currencyTags}>
          <TouchableOpacity style={styles.currencyTag}>
            <Text style={styles.currencyTagText}>BTC</Text>
            <Text style={styles.currencyTagSubtext}>Aggregators</Text>
          </TouchableOpacity>
          
          <View style={styles.exchangeIcon}>
            <Icon name="swap-horizontal" size={18} color="white" />
          </View>
          
          <TouchableOpacity style={styles.currencyTag}>
            <Text style={styles.currencyTagText}>USDC</Text>
            <Text style={styles.currencyTagSubtext}>Center.io</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.pairSelector}>
          <Text style={styles.pairSelectorText}>BTC/USDC</Text>
          <Icon name="chevron-down" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Order Type Selection */}
      <View style={styles.tabContainer}>
        {orderTabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              selectedTab === tab && (
                tab === 'Buy' ? styles.buyTab : 
                tab === 'Sell' ? styles.sellTab : 
                styles.selectedTab
              )
            ]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text 
              style={[
                styles.tabText,
                selectedTab === tab && (
                  tab === 'Buy' ? styles.buyTabText : 
                  tab === 'Sell' ? styles.sellTabText : 
                  styles.selectedTabText
                )
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Order Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.quantityControls}>
          <TouchableOpacity style={styles.controlButton}>
            <Icon name="chevron-back" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <Text style={styles.controlButtonText}>-</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <Text style={styles.controlButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.orderTypeSelector}>
          {orderTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.orderTypeButton,
                selectedOrderType === type && styles.selectedOrderType
              ]}
              onPress={() => setSelectedOrderType(type)}
            >
              <Text style={styles.orderTypeText}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Main Content Area - Order Book on Left, Inputs on Right */}
      <View style={styles.mainContentArea}>
        {/* Order Book - Left Side */}
        <View style={styles.orderBookContainer}>
          <View style={styles.sellOrdersContainer}>
            {sellOrders.map((order, index) => (
              <View key={`sell-${index}`} style={styles.orderRow}>
                {/* Depth visualization for sell orders */}
                <View style={styles.depthVisualizationContainer}>
                  <View 
                    style={[
                      styles.sellDepthBar, 
                      { width: `${(order.volume / maxSellVolume) * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={[styles.orderPrice, styles.sellPrice]}>{order.price}</Text>
                <Text style={styles.orderAmount}>{order.amount}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.spreadContainer}>
            <Text style={styles.spreadLabel}>Spread</Text>
            <Text style={styles.spreadValue}>0.00%</Text>
          </View>
          
          <View style={styles.buyOrdersContainer}>
            {buyOrders.map((order, index) => (
              <View key={`buy-${index}`} style={styles.orderRow}>
                {/* Depth visualization for buy orders */}
                <View style={styles.depthVisualizationContainer}>
                  <View 
                    style={[
                      styles.buyDepthBar, 
                      { width: `${(order.volume / maxBuyVolume) * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={[styles.orderPrice, styles.buyPrice]}>{order.price}</Text>
                <Text style={styles.orderAmount}>{order.amount}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Inputs - Right Side */}
        <View style={styles.inputsContainer}>
          {/* Amount Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputLabelContainer}>
              <Text style={styles.inputLabel}>Amount</Text>
              <Icon name="information-circle-outline" size={16} color="#8A8D98" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter Amount..."
              placeholderTextColor="#4A4D57"
              value={amount}
              onChangeText={setAmount}
            />
            <View style={styles.percentButtons}>
              {percentOptions.map((percent) => (
                <TouchableOpacity key={percent} style={styles.percentButton}>
                  <Text style={styles.percentButtonText}>{percent}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Limit Price Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputLabelContainer}>
              <Text style={styles.inputLabel}>Limit Price</Text>
              <Icon name="information-circle-outline" size={16} color="#8A8D98" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter price..."
              placeholderTextColor="#4A4D57"
              value={price}
              onChangeText={setPrice}
            />
          </View>
        </View>
      </View>

      {/* Position Info */}
      <View style={styles.positionInfoContainer}>
        <View style={styles.positionInfoRow}>
          <Text style={styles.positionInfoLabel}>Liquidation Price</Text>
          <Text style={styles.positionInfoValue}>-</Text>
        </View>
        <View style={styles.positionInfoRow}>
          <Text style={styles.positionInfoLabel}>Position Margin</Text>
          <Text style={styles.positionInfoValue}>-</Text>
        </View>
        <View style={styles.positionInfoRow}>
          <Text style={styles.positionInfoLabel}>Position Leverage</Text>
          <Text style={styles.positionInfoValue}>-</Text>
        </View>
        <View style={styles.positionInfoRow}>
          <Text style={styles.positionInfoLabel}>Estimated Rewards X</Text>
          <Text style={styles.positionInfoValue}>-</Text>
        </View>
      </View>

      {/* Create Offer Button */}
      <TouchableOpacity style={styles.createOfferButton}>
        <Text style={styles.createOfferButtonText}>Create offer</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#011434',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  placeholder: {
    width: 24,
  },
  tradingPairContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  currencyTags: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyTag: {
    backgroundColor: '#252836',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 4,
  },
  currencyTagText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  currencyTagSubtext: {
    color: '#8A8D98',
    fontSize: 10,
  },
  exchangeIcon: {
    padding: 4,
    marginHorizontal: 4,
  },
  pairSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252836',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pairSelectorText: {
    color: 'white',
    fontWeight: '600',
    marginRight: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#252836',
    marginHorizontal: 4,
  },
  selectedTab: {
    backgroundColor: '#303342',
  },
  buyTab: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
    borderWidth: 1,
  },
  sellTab: {
    backgroundColor: '#303342',
  },
  tabText: {
    color: '#8A8D98',
    fontWeight: '600',
  },
  selectedTabText: {
    color: 'white',
  },
  buyTabText: {
    color: 'white',
  },
  sellTabText: {
    color: 'white',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  quantityControls: {
    flexDirection: 'row',
  },
  controlButton: {
    width: 40,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#252836',
    borderRadius: 6,
    marginRight: 8,
  },
  controlButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  orderTypeSelector: {
    flexDirection: 'row',
  },
  orderTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#252836',
    borderRadius: 6,
    marginLeft: 8,
  },
  selectedOrderType: {
    backgroundColor: '#303342',
  },
  orderTypeText: {
    color: 'white',
    fontWeight: '500',
  },
  // New side-by-side layout
  mainContentArea: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  orderBookContainer: {
    flex: 1,
    marginRight: 8,
    position: 'relative',
  },
  inputsContainer: {
    flex: 1,
    marginLeft: 8,
  },
  sellOrdersContainer: {
    marginBottom: 4,
  },
  buyOrdersContainer: {
    marginTop: 4,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
    position: 'relative',
    height: 24,
  },
  // New depth visualization styles
  depthVisualizationContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  sellDepthBar: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(239, 68, 68, 0.15)', // Light red for sell depth
  },
  buyDepthBar: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(16, 185, 129, 0.15)', // Light green for buy depth
  },
  orderPrice: {
    width: '40%',
    fontWeight: '500',
    zIndex: 2,
  },
  sellPrice: {
    color: '#EF4444',
  },
  buyPrice: {
    color: '#10B981',
  },
  orderAmount: {
    color: '#8A8D98',
    zIndex: 2,
  },
  spreadContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#303342',
  },
  spreadLabel: {
    color: '#8A8D98',
  },
  spreadValue: {
    color: 'white',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    color: '#8A8D98',
    marginRight: 4,
  },
  input: {
    backgroundColor: '#252836',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: 'white',
    fontSize: 16,
  },
  percentButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  percentButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#303342',
  },
  percentButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  positionInfoContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
    backgroundColor: '#252836',
    borderRadius: 8,
    paddingVertical: 8,
    marginHorizontal: 16,
  },
  positionInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  positionInfoLabel: {
    color: '#8A8D98',
  },
  positionInfoValue: {
    color: 'white',
  },
  createOfferButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  createOfferButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default Temptrade;