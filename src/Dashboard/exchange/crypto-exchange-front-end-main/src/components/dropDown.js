import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const Dropdown = ({ theme, selectedToken, onSelectToken }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const tokens = [
    { id: 1, name: 'Ethereum', image: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png' },
    { id: 2, name: 'Binance', image: 'https://coin-images.coingecko.com/coins/images/825/large/bnb-icon2_2x.png?1696501970' },
  ];

  const renderToken = ({ item }) => (
    <TouchableOpacity
      style={styles.tokenItem}
      onPress={() => {
        onSelectToken(item);
        setModalVisible(false);
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image source={{ uri: item.image }} style={styles.tokenImage} />
        <Text style={{ color: theme ? "#fff" : "black", marginLeft: 5, fontSize: 17 }}>
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        style={styles.addTokenContainer}
        onPress={() => setModalVisible(true)}
      >
        <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
          <Image source={{ uri: selectedToken.image }} style={styles.tokenImage} />
          <Text style={{ color: theme ? "#fff" : "black", marginLeft: 5, fontSize: 19 }}>
            {selectedToken.name}
          </Text>
        </View>
        <Icon name="chevron-down" size={29} color={theme ? "#fff" : "black"} style={{ marginLeft: 8 }} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={[
            styles.dropdownContainer,
            { backgroundColor: theme ? '#1a1a1a' : '#fff' }
          ]}>
            <FlatList
              data={tokens}
              renderItem={renderToken}
              keyExtractor={item => item.id.toString()}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default Dropdown;

const styles = StyleSheet.create({
  addTokenContainer: {
    height: hp(8),
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 13,
    paddingVertical: 17,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: '#4CA6EA',
  },
  tokenImage: {
    width: 36,
    height: 36,
    borderRadius: 19,
    backgroundColor: '#ddd',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    width: '95%',
    maxHeight: 300,
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tokenItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});
