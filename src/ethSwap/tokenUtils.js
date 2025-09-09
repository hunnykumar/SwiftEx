import { Alert } from "react-native";
import { getTokenBalancesUsingAddress } from "../utilities/getWalletInfo/multiiChainHelper";
export async function fetchTokenInfo(addresses, walletAddress) {
    try {

      const fetched = await getTokenBalancesUsingAddress(addresses, walletAddress, "ETH");
      if(!fetched.status)
      {
        Alert.alert('Error', 'Failed to fetch tokens info.');
        return null
      }
      return fetched.tokenInfo;
    } catch (error) {
        console.error("Error fetching token info:", error);
        throw new Error("Failed to fetch token data");
    }
};