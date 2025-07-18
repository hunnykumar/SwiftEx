import { Alert } from "react-native";
import { PPOST, proxyRequest } from "../Dashboard/exchange/crypto-exchange-front-end-main/src/api";

export async function fetchTokenInfo(addresses, walletAddress) {
    try {
        const {res,err} = await proxyRequest("/v1/eth/token/info", PPOST, {addresses:addresses,walletAddress:walletAddress});  
        if (err?.status === 500) {
             Alert.alert('Error', 'Failed to fetch tokens info.');
           }
        return res;
    } catch (error) {
        console.error("Error fetching token info:", error);
        throw new Error("Failed to fetch token data");
    }
};