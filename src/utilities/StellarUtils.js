const StellarSdk = require('stellar-sdk');
import axios from 'axios';
import { STELLAR_URL } from '../Dashboard/constants';
const server = new StellarSdk.Server(STELLAR_URL.URL);

// Function to calculate total reserved and available balance
export async function GetStellarAvilabelBalance(publicKey) {
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
      const apiUrl = `${STELLAR_URL.URL}/accounts/${publicKey}/offers?limit=200&order=desc`;
      const response = await axios.get(apiUrl);
      
      // Log the response for debugging
      console.log('Fetched Offers:', response.data);

      const fetchedOffers = response.data._embedded?.records || [];

      offerCount = fetchedOffers.length; // Count the number of offers
      xlmInOffers = fetchedOffers.reduce((total, offer) => {
        return total + parseFloat(offer.amount);
      }, 0);

    } catch (offerError) {
      console.log('No active offers or Error: ', offerError.message);
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

    const formatValue = (value) => {
      return value < 0 ? "0.00000" : value.toFixed(5);
  };
    return {
      totalReserved: formatValue(totalReserved),
      availableBalance: formatValue(availableBalance),
    };

  } catch (error) {
    console.error("Error fetching account details:", error.message);
    return {
      totalReserved: 'Error',
      availableBalance: 'Error',
    };
  }
  
}
