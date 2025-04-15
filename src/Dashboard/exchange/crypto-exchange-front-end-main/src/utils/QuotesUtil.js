const { ethers } = require("ethers");
const { RPC } = require("../../../../constants");
import {
  ChainId,
  Token,
  WETH,
  Fetcher,
  Route,
  Trade,
  TokenAmount,
  TradeType,
  Percent,
} from "@uniswap/sdk";

const getCUSTOMSwapQuote = async (tokenAddress,ethAmount, tokenName,tokenOut="0xdAC17F958D2ee523a2206206994597C13D831ec7") => {
    console.log("---",tokenAddress,ethAmount, tokenName,tokenOut)
    try {
        const provider = new ethers.providers.JsonRpcProvider(RPC.ETHRPC2);
        const chainId = ChainId.MAINNET;
        const USDT = new Token(chainId, tokenOut, 6, "USDT", "Tether USD");
        const WETH_TOKEN = WETH[chainId];
    
        const pair = await Fetcher.fetchPairData(USDT, WETH_TOKEN, provider);
        const route = new Route([pair], WETH_TOKEN);
    
        const amountIn = ethers.utils.parseEther(ethAmount.toString());
        const trade = new Trade(route, new TokenAmount(WETH_TOKEN, amountIn), TradeType.EXACT_INPUT);
    
        const slippageTolerance = new Percent("5", "1000"); // 0.5% slippage
        const minimumReceiveAmount = trade.minimumAmountOut(slippageTolerance).toSignificant(6);
        const outputAmount = trade.outputAmount.toSignificant(6);
        const conversionRate = trade.executionPrice.toSignificant(6);
    
        return {
          conversionRate,
          minimumAmountOut: parseFloat(minimumReceiveAmount)?.toFixed(6)?.toString(),
          slippageTolerance: slippageTolerance.toSignificant(1),
          inputAmount: amountIn.toString(),
          inputToken: tokenAddress,
          outputAmount: parseFloat(outputAmount),
          status: true,
        };
    } catch (error) {
        console.error(`Failed to get swap quote: ${error.message}`);
        return { status: false, error: error.message };
    }
};

module.exports = { getCUSTOMSwapQuote };
