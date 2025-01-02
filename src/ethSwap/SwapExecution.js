// const { ethers } = require('ethers');
// const FACTORY_ABI = require('./abi/factory.json');
// const QUOTER_ABI = require('./abi/quoter.json');
// const SWAP_ROUTER_ABI = require('./abi/swaprouter.json');
// const POOL_ABI = require('./abi/pool.json');
// const TOKEN_IN_ABI = require('./abi/weth.json');

// // Deployment Addresses
// const POOL_FACTORY_CONTRACT_ADDRESS = '0x0227628f3F023bb0B980b67D528571c95c6DaC1c'
// const QUOTER_CONTRACT_ADDRESS = '0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3'
// const SWAP_ROUTER_CONTRACT_ADDRESS = '0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E'

// // Provider, Contract & Signer Instances
// const provider = new ethers.providers.JsonRpcProvider('https://eth-sepolia.g.alchemy.com/v2/k5oEPTr8Pryz-1bdXyNzH3TfwczQ_TRo') // Changed provider initialization
// const factoryContract = new ethers.Contract(POOL_FACTORY_CONTRACT_ADDRESS, FACTORY_ABI, provider);
// const quoterContract = new ethers.Contract(QUOTER_CONTRACT_ADDRESS, QUOTER_ABI, provider)

// // Token Configuration
// const WETH = {
//     chainId: 11155111,
//     address: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
//     decimals: 18,
//     symbol: 'WETH',
//     name: 'Wrapped Ether',
//     isToken: true,
//     isNative: true,
//     wrapped: true
// }
  
// const USDC = {
//     chainId: 11155111,
//     address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
//     decimals: 6,
//     symbol: 'USDC',
//     name: 'USD//C',
//     isToken: true,
//     isNative: true,
//     wrapped: false
// }

// async function approveToken(tokenAddress, tokenABI, amount, wallet) {
//     try {
//         const tokenContract = new ethers.Contract(tokenAddress, tokenABI, wallet);

//         // Remove populateTransaction and use direct call
//         const approveTransaction = await tokenContract.approve(
//             SWAP_ROUTER_CONTRACT_ADDRESS,
//             ethers.utils.parseEther(amount.toString()) // Changed to utils.parseEther
//         );

//         console.log(`-------------------------------`)
//         console.log(`Sending Approval Transaction...`)
//         console.log(`-------------------------------`)
//         console.log(`Transaction Sent: ${approveTransaction.hash}`)
//         console.log(`-------------------------------`)
//         const receipt = await approveTransaction.wait();
//         console.log(`Approval Transaction Confirmed! https://sepolia.etherscan.io/txn/${receipt.transactionHash}`);
//     } catch (error) {
//         console.error("An error occurred during token approval:", error);
//         throw new Error("Token approval failed");
//     }
// }

// async function getPoolInfo(factoryContract, tokenIn, tokenOut) {
//     const poolAddress = await factoryContract.getPool(tokenIn.address, tokenOut.address, 3000);
//     if (!poolAddress) {
//         throw new Error("Failed to get pool address");
//     }
//     const poolContract = new ethers.Contract(poolAddress, POOL_ABI, provider);
//     const [token0, token1, fee] = await Promise.all([
//         poolContract.token0(),
//         poolContract.token1(),
//         poolContract.fee(),
//     ]);
//     return { poolContract, token0, token1, fee };
// }

// async function quoteAndLogSwap(quoterContract, fee, signer, amountIn) {
//     // Changed to use callStatic instead of staticCall
//     const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle({
//         tokenIn: WETH.address,
//         tokenOut: USDC.address,
//         fee: fee,
//         recipient: signer.address,
//         deadline: Math.floor(new Date().getTime() / 1000 + 60 * 10),
//         amountIn: amountIn,
//         sqrtPriceLimitX96: 0,
//     });
//     console.log(`-------------------------------`)
//     console.log(`Token Swap will result in: ${ethers.utils.formatUnits(quotedAmountOut[0].toString(), USDC.decimals)} ${USDC.symbol} for ${ethers.utils.formatEther(amountIn)} ${WETH.symbol}`);
//     const amountOut = ethers.utils.formatUnits(quotedAmountOut[0], USDC.decimals)
//     return amountOut;
// }

// async function prepareSwapParams(poolContract, signer, amountIn, amountOut) {
//     return {
//         tokenIn: WETH.address,
//         tokenOut: USDC.address,
//         fee: await poolContract.fee(),
//         recipient: signer.address,
//         amountIn: amountIn,
//         amountOutMinimum: amountOut,
//         sqrtPriceLimitX96: 0,
//     };
// }

// async function executeSwap(swapRouter, params, signer) {
//     // Remove populateTransaction and use direct call
//     const transaction = await swapRouter.exactInputSingle(params);
//     const receipt = await transaction.wait();
//     console.log(`-------------------------------`)
//     console.log(`Receipt: https://sepolia.etherscan.io/tx/${receipt.transactionHash}`);
//     console.log(`-------------------------------`)
// }

// export async function main(swapAmount,privateKey) {
//     const inputAmount = swapAmount
//     const amountIn = ethers.utils.parseUnits(inputAmount.toString(), 18); // Changed to utils.parseUnits
//     const signer = new ethers.Wallet(privateKey, provider)

//     try {
//         await approveToken(WETH.address, TOKEN_IN_ABI, amountIn, signer)
//         const { poolContract, token0, token1, fee } = await getPoolInfo(factoryContract, WETH, USDC);
//         console.log(`-------------------------------`)
//         console.log(`Fetching Quote for: ${WETH.symbol} to ${USDC.symbol}`);
//         console.log(`-------------------------------`)
//         console.log(`Swap Amount: ${ethers.utils.formatEther(amountIn)}`); // Changed to utils.formatEther

//         const quotedAmountOut = await quoteAndLogSwap(quoterContract, fee, signer, amountIn);

//         const params = await prepareSwapParams(poolContract, signer, amountIn, quotedAmountOut[0].toString());
//         const swapRouter = new ethers.Contract(SWAP_ROUTER_CONTRACT_ADDRESS, SWAP_ROUTER_ABI, signer);
//         await executeSwap(swapRouter, params, signer);
//     } catch (error) {
//         console.error("An error occurred:", error.message);
//     }
// }

// // main(0.0001) // Change amount as needed

const { ethers } = require('ethers');
const FACTORY_ABI = require('./abi/factory.json');
const QUOTER_ABI = require('./abi/quoter.json');
const SWAP_ROUTER_ABI = require('./abi/swaprouter.json');
const POOL_ABI = require('./abi/pool.json');
const USDC_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function balanceOf(address account) external view returns (uint256)",
    "function decimals() external view returns (uint8)"
];

// Contract Addresses
const ADDRESSES = {
    POOL_FACTORY: '0x0227628f3F023bb0B980b67D528571c95c6DaC1c',
    QUOTER: '0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3',
    SWAP_ROUTER: '0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E',
    WETH: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
    USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'
};

class SwapResult {
    constructor(success, message, data = null, error = null) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.error = error;
    }
}

async function swapUSDCtoWETH(amount, privateKey) {
    // Initialize provider
    const provider = new ethers.providers.JsonRpcProvider('https://eth-sepolia.g.alchemy.com/v2/k5oEPTr8Pryz-1bdXyNzH3TfwczQ_TRo');
    const signer = new ethers.Wallet(privateKey, provider);

    try {
        // Setup contracts
        const usdcContract = new ethers.Contract(ADDRESSES.USDC, USDC_ABI, signer);
        const factoryContract = new ethers.Contract(ADDRESSES.POOL_FACTORY, FACTORY_ABI, provider);
        const quoterContract = new ethers.Contract(ADDRESSES.QUOTER, QUOTER_ABI, provider);

        // Convert amount to proper decimals
        const amountIn = ethers.utils.parseUnits(amount.toString(), 6); // USDC has 6 decimals

        // Check USDC balance
        const balance = await usdcContract.balanceOf(signer.address);
        if (balance.lt(amountIn)) {
            return new SwapResult(
                false,
                'Insufficient USDC balance',
                {
                    requiredAmount: amount,
                    currentBalance: ethers.utils.formatUnits(balance, 6)
                }
            );
        }

        // Approve USDC
        const approveTx = await usdcContract.approve(ADDRESSES.SWAP_ROUTER, amountIn);
        await approveTx.wait();

        // Get pool info
        const poolAddress = await factoryContract.getPool(ADDRESSES.USDC, ADDRESSES.WETH, 3000);
        if (!poolAddress || poolAddress === ethers.constants.AddressZero) {
            return new SwapResult(false, 'Liquidity pool not found');
        }

        const poolContract = new ethers.Contract(poolAddress, POOL_ABI, provider);
        const fee = await poolContract.fee();

        // Get quote
        const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle({
            tokenIn: ADDRESSES.USDC,
            tokenOut: ADDRESSES.WETH,
            fee: fee,
            recipient: signer.address,
            deadline: Math.floor(Date.now() / 1000) + 600,
            amountIn: amountIn,
            sqrtPriceLimitX96: 0
        });

        // Execute swap
        const swapRouter = new ethers.Contract(ADDRESSES.SWAP_ROUTER, SWAP_ROUTER_ABI, signer);
        const swapParams = {
            tokenIn: ADDRESSES.USDC,
            tokenOut: ADDRESSES.WETH,
            fee: fee,
            recipient: signer.address,
            deadline: Math.floor(Date.now() / 1000) + 600,
            amountIn: amountIn,
            amountOutMinimum: quotedAmountOut[0],
            sqrtPriceLimitX96: 0
        };

        const swapTx = await swapRouter.exactInputSingle(swapParams);
        const receipt = await swapTx.wait();

        return new SwapResult(
            true,
            'Swap completed successfully',
            {
                inputAmount: amount + ' USDC',
                outputAmount: ethers.utils.formatEther(quotedAmountOut[0]) + ' WETH',
                transactionHash: receipt.transactionHash,
                explorerLink: `https://sepolia.etherscan.io/tx/${receipt.transactionHash}`
            }
        );

    } catch (error) {
        return new SwapResult(
            false,
            'Swap failed',
            null,
            {
                message: error.message,
                code: error.code
            }
        );
    }
}

// // WETH to USDC swap function
// async function swapWETHtoUSDC(amount, privateKey) {
//     // Similar implementation but reversed token order
//     // ... (can add if needed)
// }

module.exports = {
    swapUSDCtoWETH,
    // swapWETHtoUSDC
};