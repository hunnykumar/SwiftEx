const { ethers } = require("ethers");
import { RPC } from "../../Dashboard/constants";
import { toString } from "lodash";
import { ERC20_ABI } from "../../Dashboard/exchange/crypto-exchange-front-end-main/src/utils/constants";

export async function getWalletBalance(address, network) {
    try {
        const provider = new ethers.providers.JsonRpcProvider(network === "ETH" ? RPC.ETHRPC : RPC.BSCRPC);
        const balance = await provider.getBalance(address);
        console.log(`${network} Address: ${address}`);
        console.log(`${network} Balance: ${ethers.utils.formatEther(balance)} ${network}`);
        return {
            status: true,
            network: network,
            address: address,
            balance: ethers.utils.formatEther(balance)
        }
    } catch (err) {
        console.log(`Error fetching balance on ${network}:`, err.shortMessage || err.message);
        return {
            status: false,
            network: network,
            address: address,
            balance: 0
        }
    }
}

export async function getTokenBalancesUsingAddress(tokenAddresses, walletAddress, network) {
    try {
        const rpcUrl = network === "ETH" ? RPC.ETHRPC : network === "BSC" ? RPC.BSCRPC : null;
        if (!rpcUrl) {
            throw new Error(`Unsupported network: ${network}`);
        }
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        const walletRawBalance = await provider.getBalance(walletAddress);
        const walletBalance = ethers.utils.formatEther(walletRawBalance);
        const tokens = Array.isArray(tokenAddresses) ? tokenAddresses : [tokenAddresses];
        const results = [];
        for (const tokenAddress of tokens) {
            try {
                const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

                const [rawBalance, decimals, symbol, name] = await Promise.all([
                    tokenContract.balanceOf(walletAddress),
                    tokenContract.decimals(),
                    tokenContract.symbol(),
                    tokenContract.name()
                ]);

                const tokenBalance = ethers.utils.formatUnits(rawBalance, decimals);

                results.push({
                    name,
                    symbol,
                    balance: tokenBalance,
                    address: tokenAddress,
                    imageUrl: "",
                    decimals:toString(decimals),
                    walletBalance,
                    tokenBalance
                });
            } catch (tokenErr) {
                console.error(
                    `Error fetching token ${tokenAddress} on ${network}:`,
                    tokenErr.message
                );

                results.push({
                    name: "",
                    symbol: "",
                    balance: "0",
                    address: tokenAddress,
                    imageUrl: "",
                    decimals: "0",
                    walletBalance,
                    tokenBalance: "0"
                });
            }
        }

        return {
            status:true,
            tokenInfo:results
        };
    } catch (err) {
        console.log(`Error fetching balances on ${network}:`, err.message);
        return {
            status:false,
            tokenInfo:[]
        };
    }
}
