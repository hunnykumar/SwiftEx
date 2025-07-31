import { Alert } from "react-native";
import { PPOST, proxyRequest } from "../Dashboard/exchange/crypto-exchange-front-end-main/src/api";
export async function fetchTokenInfo(addresses, walletAddress) {
    try {
      if (Array.isArray(addresses)) {
        const response = await Promise.all(
          addresses.map(async (address) => {
            const {res,err} = await proxyRequest("/v1/eth/token/info", PPOST, {addresses:address,walletAddress:walletAddress});  
  
            if (err?.status === 500) {
              console.error(`Failed to fetch info for address: ${address}`);
              return null;
            }
  
            return res?.[0] || null;
          })
        );
  
        return response.filter((item) => item !== null);
      } else {
        const {res,err} = await proxyRequest("/v1/eth/token/info", PPOST, {addresses:addresses,walletAddress:walletAddress});  
  
        if (err?.status === 500) {
             Alert.alert('Error', 'Failed to fetch tokens info.');
             return null;
          }
        return res?.[0] || null;
      }
    } catch (error) {
        console.error("Error fetching token info:", error);
        throw new Error("Failed to fetch token data");
    }
};