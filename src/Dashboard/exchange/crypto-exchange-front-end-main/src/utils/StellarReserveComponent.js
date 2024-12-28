import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  SafeAreaView,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useSelector } from 'react-redux';
const StellarSdk = require('stellar-sdk');
import axios from 'axios';
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

const StellarAccountReserve = ({ 
  isVisible, 
  onClose,
  title = 'Reserved',
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [reserveData, setReserveData] = useState([]);
  const state = useSelector((state) => state);

  const initializeReserveData = async () => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await getAccountReserves(state?.STELLAR_PUBLICK_KEY);
     
    } catch (error) {
      console.error('Error initializing reserve data:', error);
      setIsLoading(false);
    }
  };


  async function getAccountReserves(publicKey) {
    try {
      // Fetch account data
      const account = await server.loadAccount(publicKey);
  
      // Base reserve and extra calculations
      const baseReserve = 0.5; // 0.5 XLM per entry
      const minAccountBalance = 2 * baseReserve; // 1 XLM base reserve for account
  
      // Extract account details
      const subEntries = account.subentry_count;
      const balances = account.balances;
      const signers = account.signers.length - 1;
      const sponsoringEntries = account.num_sponsoring;
      const sponsoredEntries = account.num_sponsored;
  
      // Calculate reserved for entries
      const reservedForEntries = subEntries * baseReserve;
  
      // Fetch active offers using Axios
      let xlmInOffers = 0;
      let offerCount = 0;
      try {
        const apiUrl = `https://horizon-testnet.stellar.org/accounts/${publicKey}/offers?limit=200&order=desc`;
        const response = await axios.get(apiUrl);
        
        // Log the response for debugging
        console.log('Fetched Offers:', response.data);
  
        const fetchedOffers = response.data._embedded?.records || [];
  
        offerCount = fetchedOffers.length; // Count the number of offers
        xlmInOffers = fetchedOffers.reduce((total, offer) => {
          return total + parseFloat(offer.amount);
        }, 0);
  
        // Log offer details for debugging
        console.log('Offer Count:', offerCount);
        console.log('XLM in Active Offers:', xlmInOffers);
      } catch (offerError) {
        console.warn('No active offers or Error: ', offerError.message);
      }
  
      // Include offer reserve (0.5 XLM per offer)
      const offerReserve = offerCount * baseReserve;
  
      // Total reserved
      const totalReserved = minAccountBalance + reservedForEntries + xlmInOffers + offerReserve;
  
      // Calculate total XLM balance in the account
      let xlmBalance = 0;
      balances.forEach((balance) => {
        if (balance.asset_type === "native") {
          xlmBalance = parseFloat(balance.balance);
        }
      });
  
      // Available balance (Total balance - Total reserved)
      const availableBalance = xlmBalance - totalReserved;
  
      // Update data for reserve information
      const data = [
        { label: "Base Reserve:", value: `${minAccountBalance} XLM` },
        { label: "Extra:", value: `${reservedForEntries - baseReserve} XLM` },
        { label: "Reserved for Active Offers:", value: `${xlmInOffers} XLM` },
        { label: "Trustlines:", value: `${account.balances.length - 1} (${baseReserve} XLM)` },
        { label: "Offers:", value: `${offerCount} (${offerReserve} XLM)` },
        { label: "Signers:", value: `${signers} (0 XLM)` },
        { label: "Sponsoring Entries for Others:", value: `${sponsoringEntries} XLM` },
        { label: "Entries Sponsored for Account:", value: `${sponsoredEntries} XLM` },
        { label: "Total Balance:", value: `${xlmBalance} XLM` },
        { label: "Total Reserved:", value: `${totalReserved} XLM` },
        { label: "Available Balance:", value: `${availableBalance} XLM` },
      ];
  
      // Set the reserve data
      setReserveData(data);
      setIsLoading(false);
  
    } catch (error) {
      console.error("Error fetching account details:", error.message);
      setIsLoading(false);
    }
  }
  



  useEffect(() => {
    if (isVisible) {
      initializeReserveData();
    }
  }, [isVisible]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.contentContainer}>
          {/* Header with close button */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
              </View>
            ) : (
              <ScrollView>
                  {reserveData.map((item, index) => (
                    <View key={index} style={styles.row}>
                      <Text style={styles.label}>{item.label}</Text>
                      <Text style={styles.value}>{item.value}</Text>
                    </View>
                  ))}

              </ScrollView>
            )}
          </View>

          {/* Bottom button */}
          <TouchableOpacity 
            style={styles.doneButton}
            onPress={onClose}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  contentContainer: {
    flex: 1,
    // backgroundColor: '#FFFFFF',
    backgroundColor:"#011434",
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    // color: '#333333',
    color:"#fff",
    flex: 1,
  },
  totalReserve: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginRight: 16,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    // color: '#666666',
    color:"#fff"
  },
  content: {
    flex: 1,
    // backgroundColor: '#FFFFFF',
    backgroundColor:"#011434"
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  label: {
    fontSize: 16,
    // color: '#333333',
    color:"#fff",
  },
  value: {
    fontSize: 16,
    // color: '#333333',
    color:"#fff",
  },
  moreInfo: {
    padding: 16,
  },
  moreInfoText: {
    color: '#007AFF',
    fontSize: 16,
  },
  doneButton: {
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default StellarAccountReserve;