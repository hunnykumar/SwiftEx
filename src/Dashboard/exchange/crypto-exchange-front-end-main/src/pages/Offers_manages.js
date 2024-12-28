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
  Keyboard,
} from 'react-native';
import { useSelector } from 'react-redux';
import StellarSdk from 'stellar-sdk';
import Icon from '../../../../../icon';

const STELLAR_NETWORK = StellarSdk.Networks.TESTNET;

const Offers_manages = () => {
  const state = useSelector((state) => state);
  const isFocused = useIsFocused();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sellingAssetCode, setSellingAssetCode] = useState('');
  const [buyingAssetCode, setBuyingAssetCode] = useState(''); 
  const [buyingAssetIssuer, setBuyingAssetIssuer] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [SelectedIndex, setSelectedIndex] = useState(null);
  const [newAmount, setNewAmount] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [STELLAR_ACCOUNT_PUBLIC,setSTELLAR_ACCOUNT_PUBLIC]=useState('');
  const [STELLAR_ACCOUNT_SECRET,setSTELLAR_ACCOUNT_SECRET]=useState('');
  const [loading_del,setloading_del]=useState(false);
  const [loading_edi,setloading_edi]=useState(false);


  const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

  useEffect(() => {
    setSelectedIndex(null)
    setloading_del(false);
    setloading_edi(false);
    setSTELLAR_ACCOUNT_PUBLIC(state.STELLAR_PUBLICK_KEY);
    setSTELLAR_ACCOUNT_SECRET(state.STELLAR_SECRET_KEY);
    fetchOffers();
  }, [isFocused]);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const apiUrl = `https://horizon-testnet.stellar.org/accounts/${state?.STELLAR_PUBLICK_KEY}/offers?limit=200&order=desc`;
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
      console.log('Error fetching offer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (offerId,index) => {
    setSelectedIndex(index)
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
    setloading_del(true);
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
      setloading_del(false);
      fetchOffers(); 
      Alert.alert('Success', 'Offer deleted successfully.');
    } catch (error) {
      setloading_del(false);
      console.log("Error deleting offer:", error);
      Alert.alert('Info', 'Failed to delete the offer');
    }
  };

  const handleEdit = (offer,index) => {
    setSelectedIndex(index)
    setSelectedOffer(offer);
    setNewAmount(offer.amount);
    setNewPrice(offer.price);
    setModalVisible(true);
  };

  const updateOffer = async () => {
    Keyboard.dismiss()
    setloading_edi(true);
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
      setloading_edi(false);
      fetchOffers(); 
      Alert.alert('Success', 'Offer updated successfully.');
      setModalVisible(false);
    } catch (error) {
      setloading_edi(false);
      console.log("Error updating offer:", error);
      Alert.alert('Info', 'Failed to update the offer');
    }
  };

  const renderItem = ({ item,index }) => (
    <View style={styles.offerItem}>
      <View style={styles.offer_id_con}>
        <Text style={styles.offerText}>Offer ID: {item.id}</Text>
        <View style={styles.active_text}>
          <Text style={[styles.offerText, { color: "#2DAA20" }]}>Active</Text>
        </View>
      </View>
      <View style={styles.container_sub}>
      <Text style={styles.offerText}>Asset Selling</Text>
      <Text style={styles.offerText}>{item.selling.asset_type}</Text>
      </View>
      <View style={styles.container_sub}>
      <Text style={styles.offerText}>Asset Buying</Text>
      <Text style={styles.offerText}>{item.buying.asset_code}</Text>
      </View>
      <View style={styles.container_sub}>
      <Text style={styles.offerText}>Amount</Text>
      <Text style={styles.offerText}>{item.amount}</Text>
      </View>
      <View style={styles.container_sub}>
      <Text style={styles.offerText}>Price</Text>
      <Text style={styles.offerText}>{item.price}</Text>
      </View>
      <View style={styles.buttonContainer}>
      {loading_edi&&SelectedIndex===index?<ActivityIndicator color={"green"} size={"small"}/>:
        <TouchableOpacity style={{alignContent:"center",justifyContent:"center",width:50,height:35}} disabled={loading_del} onPress={() => handleEdit(item,index)}><Text style={{color:"blue",fontSize:15}}>Edit</Text></TouchableOpacity> }
        {loading_del&&SelectedIndex===index?<ActivityIndicator color={"green"} size={"small"}/>:
        <TouchableOpacity style={{alignContent:"center",justifyContent:"center",width:50,height:35}} disabled={loading_edi} onPress={() => handleDelete(item.id,index)}><Text style={{color:"blue",fontSize:15}}>Delete</Text></TouchableOpacity>}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Active Offers</Text>
    
      {loading ? (
        <ActivityIndicator color={"gray"} size={"large"}/>
      ) : (
        offers.length>0?<FlatList
          data={offers}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          style={styles.offerList}
        />:
        <View style={styles.error_cont}>
          <Text style={styles.error_text}>No Active Offers</Text>
        </View>
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
          <TouchableOpacity style={{alignSelf:"flex-end"}} onPress={()=>{setModalVisible(false)}}>
          <Icon name={"close"} type={"antDesign"} size={25} color={"#fff"}/>
          </TouchableOpacity>
            <View style={styles.container_sub}>
            <Text style={styles.modalTitle}>Edit Offer</Text>
            <Text style={styles.modalTitle}>ID: {selectedOffer?.id}</Text>
            </View>
            <TextInput
              editable={!loading_edi}
              style={styles.input}
              placeholder="New Amount"
              placeholderTextColor={"gray"}
              value={newAmount}
              onChangeText={setNewAmount}
              keyboardType="numeric"
              returnKeyType='done'
            />
            <TextInput
              editable={!loading_edi}
              style={styles.input}
              placeholder="New Price"
              placeholderTextColor={"gray"}
              value={newPrice}
              onChangeText={setNewPrice}
              keyboardType="numeric"
              returnKeyType='done'
            />
            <TouchableOpacity style={styles.update_btn} disabled={loading_edi} onPress={()=>{updateOffer()}}>
              {loading_edi?<ActivityIndicator color={"green"} size={"small"}/>:<Text style={{color:"#4B84ED",fontSize:19}}>Update Offer</Text>}
            </TouchableOpacity>
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
    backgroundColor: '#011434',
  },
  title: {
    fontSize: 23,
    fontWeight: '500',
    marginBottom: 20,
    textAlign: 'left',
    color: '#fff',
  },
  input: {
    height: 50,
    borderColor: '#ced4da',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    color:"black"
  },
  offerItem: {
    backgroundColor: '#fff',
    borderRadius: 15,
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
    color: '#000000CC',
  },
  offerList: {
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalContent: {
    width: '100%',
    height:"70%",
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#1F2022',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 15,
    textAlign: 'center',
    color:"#fff"
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    backgroundColor:"#4B84ED1A",
    borderBottomLeftRadius:15,
    borderBottomRightRadius:15,
    paddingHorizontal:10
  },
  error_cont:{
    justifyContent:"center",
    alignSelf:"center",
    alignItems:"center",
    paddingVertical:90
  },
  error_text:{
    color:"gray",
    fontSize:20
  },
  container_sub:{
    justifyContent:"space-between",
    flexDirection:"row",
    marginBottom:10,
    paddingHorizontal: 15,
  },
  offer_id_con:{
    justifyContent:"space-between",
    flexDirection:"row",
    paddingVertical:21,
    paddingBottom:20,
    paddingHorizontal: 15,
  },
  active_text:{
    backgroundColor:"#2DAA2033",
    paddingHorizontal:16,
    alignItems:"center",
    justifyContent:"center",
    borderRadius:10
  },
  update_btn:{
    alignSelf:"center",
    alignItems:"center",
    width:"90%",
    padding:15,
    borderColor:"#fff",
    borderWidth:1,
    borderRadius:15,
    marginTop:13
  }
});

export default Offers_manages;
