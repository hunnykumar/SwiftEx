
const { proxyRequest, PPOST } = require("../api");
const getCUSTOMSwapQuote = async (tokenIn,amountIn, tokenName,tokenOut="0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0") => {
    try {
        const tokens = [{
            "symbol": 'WETH',
            "name": 'Wrapped Ethereum',
            "decimals": 18,
            "address": '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
            "logoUri": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
        },
        {
            "symbol": "USDT",
            "name": 'USDT',
            "address": "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0",
            "decimals": 6,
            "img_url": "https://tokens.pancakeswap.finance/images/0x55d398326f99059fF775485246999027B3197955.png",
        }];


 const { res, err } = await proxyRequest("/getSwapQuote", PPOST, { tokenIn: tokens[0], tokenOut: tokens[1], amountIn: amountIn });
    if (err?.status === 500) {
        console.error(`Failed to get swap quote: ${err}`);
        return { status: false, error: err };
    }
    else {
      const formattedAmountOut = res.swapInfo.outputAmount; // Assuming USDT has 6 decimals

      const conversionRate = (parseFloat(formattedAmountOut) / parseFloat(amountIn)).toFixed(6);
      const slippageTolerance = 0.005; // Example 0.5% slippage tolerance
      const minimumReceiveAmount = (parseFloat(formattedAmountOut) * (1 - slippageTolerance)).toFixed(6);

      return {
          conversionRate,
          minimumAmountOut: parseFloat(minimumReceiveAmount)?.toFixed(6)?.toString(),
          slippageTolerance,
          inputAmount: amountIn,
          inputToken: tokenIn,
          outputAmount: parseFloat(formattedAmountOut),
          fee:res?.swapInfo?.fee,
          status: true
      };
    }
    } catch (error) {
        console.error(`Failed to get swap quote: ${error.message}`);
        return { status: false, error: error.message };
    }
};

module.exports = { getCUSTOMSwapQuote };
