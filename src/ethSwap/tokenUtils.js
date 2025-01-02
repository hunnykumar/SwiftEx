import { ethers } from "ethers";
import { RPC } from "../Dashboard/constants";

export async function fetchTokenInfo(address, WALLET_ADDRESS) {
    try {
        const ERC20_ABI = [
            "function name() view returns (string)",
            "function symbol() view returns (string)",
            "function decimals() view returns (uint8)",
            "function balanceOf(address owner) view returns (uint256)"
        ];
        const provider = new ethers.providers.JsonRpcProvider(RPC.ETHRPC);

        const tokenContract = new ethers.Contract(address, ERC20_ABI, provider);
        const [name, fetchedSymbol, decimals, balance] = await Promise.all([
            tokenContract.name(),
            tokenContract.symbol(),
            tokenContract.decimals(),
            tokenContract.balanceOf(WALLET_ADDRESS)
        ]);
        const formattedBalance = ethers.utils.formatUnits(balance, decimals);
        return {
            name,
            symbol: fetchedSymbol,
            balance: formattedBalance,
            address
        };
    } catch (error) {
        console.error(`Error fetching token info for ${address}:`, error);
        throw new Error('Invalid token address or failed to fetch data');
    }
};