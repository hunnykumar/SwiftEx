// const STELLAR_ACCOUNT_SECRET = 'SCMOMUR2JNSSFMLP522LOSMAXI7PJ4FPL3CIWGJJH666CRAJUFZ33ET4';
// const STELLAR_ACCOUNT_PUBLIC='GAYL7JNZXPUMMRXQMZGR4JDT2HX4WO75KEJE2KHGZB2LBYNH2YUTMIAS'
import { useIsFocused } from '@react-navigation/native';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Button,
  Alert,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from 'react-native';
import StellarSdk from 'stellar-sdk';

const STELLAR_NETWORK = StellarSdk.Networks.TESTNET;

const STELLAR_ACCOUNT_SECRET = 'SCMOMUR2JNSSFMLP522LOSMAXI7PJ4FPL3CIWGJJH666CRAJUFZ33ET4'; 
const STELLAR_ACCOUNT_PUBLIC = 'GAYL7JNZXPUMMRXQMZGR4JDT2HX4WO75KEJE2KHGZB2LBYNH2YUTMIAS'; 

const Offers_manages = () => {
  const isFocused = useIsFocused();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sellingAssetCode, setSellingAssetCode] = useState('');
  const [buyingAssetCode, setBuyingAssetCode] = useState(''); 
  const [buyingAssetIssuer, setBuyingAssetIssuer] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [newAmount, setNewAmount] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

  useEffect(() => {
    fetchOffers();
  }, [isFocused]);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const apiUrl = `https://horizon-testnet.stellar.org/accounts/${STELLAR_ACCOUNT_PUBLIC}/offers?limit=200&order=desc`;
      const response = await axios.get(apiUrl);
      const fetchedOffers = response.data._embedded?.records || [];

      if (fetchedOffers.length > 0) {
        const firstOffer = fetchedOffers[0];
        let sellingAssetCode;
        let buyingAssetCode;
        let buyingAssetIssuer;

        if (firstOffer.selling) {
          const sellingAssetType = firstOffer.selling.asset_type;

          sellingAssetCode = sellingAssetType === 'native' ? 'XLM' : firstOffer.selling.asset_code || 'Unknown Asset Code';
        }

        if (firstOffer.buying) {
          buyingAssetCode = firstOffer.buying.asset_code || 'Unknown Asset Code';
          buyingAssetIssuer = firstOffer.buying.asset_issuer || 'Unknown Issuer';
        }

        setSellingAssetCode(sellingAssetCode);
        setBuyingAssetCode(buyingAssetCode); 
        setBuyingAssetIssuer(buyingAssetIssuer); 
      }

      setOffers(fetchedOffers);
    } catch (error) {
      console.error('Error fetching offer data:', error);
      Alert.alert('Error', 'Failed to fetch offers: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (offerId) => {
    Alert.alert(
      'Delete Offer',
      'Are you sure you want to delete this offer?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: () => deleteOffer(offerId) },
      ]
    );
  };

  const deleteOffer = async (offerId) => {
    const keypair = StellarSdk.Keypair.fromSecret(STELLAR_ACCOUNT_SECRET);
    try {
      const account = await server.loadAccount(keypair.publicKey());

      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: STELLAR_NETWORK,
      })
        .addOperation(StellarSdk.Operation.manageOffer({
          offerId: offerId,
          selling: new StellarSdk.Asset(sellingAssetCode, keypair.publicKey()), 
          buying: new StellarSdk.Asset(buyingAssetCode, buyingAssetIssuer), 
          amount: '0', 
          price: '1', 
        }))
        .setTimeout(30)
        .build();

      transaction.sign(keypair);

      const response = await server.submitTransaction(transaction);
      console.log('Offer deleted:', response);
      fetchOffers(); 
      Alert.alert('Success', 'Offer deleted successfully.');
    } catch (error) {
      console.error("Error deleting offer:", error);
      Alert.alert('Error', 'Failed to delete the offer: ' + error.message);
    }
  };

  const handleEdit = (offer) => {
    setSelectedOffer(offer);
    setNewAmount(offer.amount);
    setNewPrice(offer.price);
    setModalVisible(true);
  };

  const updateOffer = async () => {
    const keypair = StellarSdk.Keypair.fromSecret(STELLAR_ACCOUNT_SECRET);
    try {
      const account = await server.loadAccount(keypair.publicKey());

      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: STELLAR_NETWORK,
      })
        .addOperation(StellarSdk.Operation.manageOffer({
          offerId: selectedOffer.id,
          selling: new StellarSdk.Asset(sellingAssetCode, keypair.publicKey()), 
          buying: new StellarSdk.Asset(buyingAssetCode, buyingAssetIssuer), 
          amount: newAmount, 
          price: newPrice, 
        }))
        .setTimeout(30)
        .build();

      transaction.sign(keypair);

      const response = await server.submitTransaction(transaction);
      console.log('Offer updated:', response);
      fetchOffers(); 
      Alert.alert('Success', 'Offer updated successfully.');
      setModalVisible(false);
    } catch (error) {
      console.error("Error updating offer:", error);
      Alert.alert('Error', 'Failed to update the offer: ' + error.message);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.offerItem}>
      <Text style={styles.offerText}>Offer ID: {item.id}</Text>
      <Text style={styles.offerText}>Asset Selling: {item.selling.asset_type}</Text>
      <Text style={styles.offerText}>Asset Buying: {item.buying.asset_code}</Text>
      <Text style={styles.offerText}>Amount: {item.amount}</Text>
      <Text style={styles.offerText}>Price: {item.price}</Text>
      <Text style={styles.offerText}>Status: Active</Text>
      <View style={styles.buttonContainer}>
        <Button title="Edit" onPress={() => handleEdit(item)} />
        <Button title="Delete" onPress={() => handleDelete(item.id)} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Active Offers</Text>
    
      {loading ? (
        <ActivityIndicator color={"green"} size={"large"}/>
      ) : (
        <FlatList
          data={offers}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          style={styles.offerList}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Offer</Text>
            <TextInput
              style={styles.input}
              placeholder="New Amount"
              value={newAmount}
              onChangeText={setNewAmount}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="New Price"
              value={newPrice}
              onChangeText={setNewPrice}
              keyboardType="numeric"
            />
            <View style={styles.buttonContainer}>
              <Button title="Update Offer" onPress={updateOffer} />
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#e9ecef',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#343a40',
  },
  input: {
    height: 50,
    borderColor: '#ced4da',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  offerItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 3,
  },
  offerText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#495057',
  },
  offerList: {
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});

export default Offers_manages;
