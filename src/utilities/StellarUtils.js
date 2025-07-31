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
    const reservedForEntries = 0.5;

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

    const totalTrustReserve=account.balances.length-1===1?baseReserve:0;
    // Total reserved
    const totalReserved = minAccountBalance + reservedForEntries + xlmInOffers + offerReserve+totalTrustReserve;

    // Calculate total XLM balance in the account
    let xlmBalance = 0;
    balances.forEach((balance) => {
      if (balance.asset_type === "native") {
        xlmBalance = parseFloat(balance.balance);
      }
    });

    const transactionBuffer = 0.022;
    // Available balance (Total balance - Total reserved)
    const availableBalance = xlmBalance - totalReserved-transactionBuffer;

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




export async function GetStellarUSDCAvilabelBalance(publicKey,coinName,coinIssuer) {
  try {
    // Fetch account data
    const account = await server.loadAccount(publicKey);

    // Fetch active offers
    let assetOffersMap = new Map();

    try {
        const apiUrl = `${STELLAR_URL.URL}/accounts/${publicKey}/offers?limit=200&order=desc`;
        const response = await axios.get(apiUrl);
        const fetchedOffers = response.data._embedded?.records || [];
        
        fetchedOffers.forEach(offer => {
            if (offer.selling.asset_type !== "native") {
                const assetKey = `${offer.selling.asset_code}:${offer.selling.asset_issuer}`;
                const offerAmount = parseFloat(offer.amount);
                const currentAmount = assetOffersMap.get(assetKey) || 0;
                assetOffersMap.set(assetKey, currentAmount + offerAmount);
            }
        });

    } catch (offerError) {
        console.log('No active offers or Error: ', offerError.message);
    }

    const formatValue = (value) => {
        return value < 0 ? "0.00000" : value.toFixed(5);
    };

    let selectedAsset = null;

    account.balances.forEach((balance) => {
        if (balance.asset_type !== "native" && balance.asset_code === coinName &&balance.asset_issuer===coinIssuer) {
            const assetKey = `${balance.asset_code}:${balance.asset_issuer}`;
            const totalBalance = parseFloat(balance.balance);
            const inOffers = assetOffersMap.get(assetKey) || 0;

            selectedAsset = {
                totalReserved: formatValue(inOffers),
                availableBalance: formatValue(totalBalance - inOffers),
                asset_type: balance.asset_type,
                asset_code: balance.asset_code,
                asset_issuer: balance.asset_issuer
            };
        }
    });

    if (!selectedAsset) {
        return { error: `Token ${coinName} not found in account`,status:false };
    }

    return selectedAsset;

} catch (error) {
    console.error("Error fetching account details:", error.message);
    return { error: error.message };
}
}