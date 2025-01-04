import { ethers } from "ethers";
import { RPC } from "../Dashboard/constants";

export async function fetchTokenInfo(addresses, WALLET_ADDRESS) {
    try {
        const ERC20_ABI = [
            "function name() view returns (string)",
            "function symbol() view returns (string)",
            "function decimals() view returns (uint8)",
            "function balanceOf(address owner) view returns (uint256)"
        ];
        const provider = new ethers.providers.JsonRpcProvider(RPC.ETHRPC);

        const tokenInfos = await Promise.all(
            addresses.map(async (address) => {
                const tokenContract = new ethers.Contract(address, ERC20_ABI, provider);
                const [name, symbol, decimals, balance] = await Promise.all([
                    tokenContract.name(),
                    tokenContract.symbol(),
                    tokenContract.decimals(),
                    tokenContract.balanceOf(WALLET_ADDRESS)
                ]);
                const formattedBalance = ethers.utils.formatUnits(balance, decimals);
                return {
                    name,
                    symbol,
                    balance: formattedBalance,
                    address
                };
            })
        );
        return tokenInfos;
    } catch (error) {
        console.error("Error fetching token info:", error);
        throw new Error("Failed to fetch token data");
    }
};