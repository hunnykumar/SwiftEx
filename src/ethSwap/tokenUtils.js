import { Alert } from "react-native";
import { PPOST, proxyRequest } from "../Dashboard/exchange/crypto-exchange-front-end-main/src/api";
import { getTokenBalancesUsingAddress } from "../Dashboard/exchange/crypto-exchange-front-end-main/src/utils/getWalletInfo/EtherWalletService";
import CustomInfoProvider from "../Dashboard/exchange/crypto-exchange-front-end-main/src/components/CustomInfoProvider";
export async function fetchTokenInfo(addresses, walletAddress) {
    try {
      const fetchedTokens=await getTokenBalancesUsingAddress(addresses,walletAddress,"ETH")
      console.log("walleetREspo--",fetchedTokens)
      if (fetchedTokens.status) {
        return fetchedTokens.tokenInfo
      }
      else{
        CustomInfoProvider.show('error', 'Failed to fetch tokens info.');
        return null;
      }
    } catch (error) {
        console.error("Error fetching token info:", error);
        throw new Error("Failed to fetch token data");
    }
};

export async function fetchBSCTokenInfo(addresses, walletAddress) {
  try {
    const fetchedTokens=await getTokenBalancesUsingAddress(addresses,walletAddress,"BSC")
    console.log("walleetREspo--",fetchedTokens)
    if (fetchedTokens.status) {
      return fetchedTokens.tokenInfo
    }
    else{
      CustomInfoProvider.show('error', 'Failed to fetch tokens info.');
      return null;
    }
  } catch (error) {
      console.error("Error fetching token info:", error);
      throw new Error("Failed to fetch token data");
  }
};