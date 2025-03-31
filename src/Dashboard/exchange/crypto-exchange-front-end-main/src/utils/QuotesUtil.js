const { ethers } = require("ethers");
const FACTORY_ABI = require('../../../../../ethSwap/abi/factory.json');
const QUOTER_ABI = require('../../../../../ethSwap/abi/quoter.json');
const POOL_ABI = require('../../../../../ethSwap/abi/pool.json');
const POOL_FACTORY_CONTRACT_ADDRESS = '0x0227628f3F023bb0B980b67D528571c95c6DaC1c'
const QUOTER_CONTRACT_ADDRESS = '0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3'
const RPC_URL = 'https://eth-sepolia.g.alchemy.com/v2/k5oEPTr8Pryz-1bdXyNzH3TfwczQ_TRo';
const provider = new ethers.providers.JsonRpcProvider(RPC_URL, { chainId: 11155111 });
const factoryContract = new ethers.Contract(POOL_FACTORY_CONTRACT_ADDRESS, FACTORY_ABI, provider);
const quoterContract = new ethers.Contract(QUOTER_CONTRACT_ADDRESS, QUOTER_ABI, provider);

const getCUSTOMSwapQuote = async (tokenIn,amountIn, tokenName,tokenOut="0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0") => {
    try {
        const decimals = tokenName === "WETH" ? 18 : 6;
        
        const poolAddress = await factoryContract.getPool(
            tokenIn, // Token In address
            tokenOut, // Token Out address
            3000 // Pool fee tier
        );

        if (!poolAddress) {
            throw new Error("Pool not found for token pair");
        }

        const poolContract = new ethers.Contract(poolAddress, POOL_ABI, provider);
        const fee = await poolContract.fee();

        const formattedAmountIn = ethers.utils.parseUnits(amountIn.toString(), decimals);
        
        const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle({
            tokenIn,
            tokenOut,
            fee,
            recipient: ethers.constants.AddressZero,
            deadline: Math.floor(Date.now() / 1000) + 600,
            amountIn: formattedAmountIn,
            sqrtPriceLimitX96: 0
        });

        const formattedAmountOut = ethers.utils.formatUnits(quotedAmountOut[0], 6); // Assuming USDT has 6 decimals

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
            status: true
        };
    } catch (error) {
        console.error(`Failed to get swap quote: ${error.message}`);
        return { status: false, error: error.message };
    }
};

module.exports = { getCUSTOMSwapQuote };
