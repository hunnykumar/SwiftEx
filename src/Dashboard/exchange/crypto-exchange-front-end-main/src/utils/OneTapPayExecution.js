const FACTORY_ABI = require('../../../../../ethSwap/abi/factory.json');
const QUOTER_ABI = require('../../../../../ethSwap/abi/quoter.json');
const SWAP_ROUTER_ABI = require('../../../../../ethSwap/abi/swaprouter.json');
const POOL_ABI = require('../../../../../ethSwap/abi/pool.json');
const { ethers } = require('ethers');

const WETH_ABI = [
    "function deposit() external payable",
    "function withdraw(uint amount) external",
    "function balanceOf(address account) external view returns (uint256)",
    "function approve(address spender, uint256 amount) external returns (bool)"
];

// Contract Addresses
const ADDRESSES = {
    POOL_FACTORY: '0x0227628f3F023bb0B980b67D528571c95c6DaC1c',
    QUOTER: '0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3',
    SWAP_ROUTER: '0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E',
    WETH: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
    USDT: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0'
};


async function onSwapETHtoUSDC(amount, privateKey, rpcUrl) {
    try {
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        const signer = new ethers.Wallet(privateKey, provider);
        const wethContract = new ethers.Contract(ADDRESSES.WETH, WETH_ABI, signer);
        const factoryContract = new ethers.Contract(ADDRESSES.POOL_FACTORY, FACTORY_ABI, provider);
        const quoterContract = new ethers.Contract(ADDRESSES.QUOTER, QUOTER_ABI, provider);

        const amountIn = ethers.utils.parseEther(amount);

        const ethBalance = await provider.getBalance(signer.address);
        if (ethBalance.lt(amountIn)) {
            return {
                status: false,
                message: "Insufficient ETH balance",
                details: {
                    requiredAmount: amount,
                    currentBalance: ethers.utils.formatEther(ethBalance)
                }
            };
        }

        let wrapTxHash = null;
        const wethBalance = await wethContract.balanceOf(signer.address);
        if (wethBalance.lt(amountIn)) {
            const wrapTx = await wethContract.deposit({ value: amountIn });
            const wrapReceipt = await wrapTx.wait();
            wrapTxHash = wrapReceipt.transactionHash;
        }

        const approveTx = await wethContract.approve(ADDRESSES.SWAP_ROUTER, amountIn);
        const approveReceipt = await approveTx.wait();

        const poolAddress = await factoryContract.getPool(ADDRESSES.WETH, ADDRESSES.USDT, 3000);
        if (!poolAddress || poolAddress === ethers.constants.AddressZero) {
            return {
                status: false,
                message: "Liquidity pool not found"
            };
        }

        const poolContract = new ethers.Contract(poolAddress, POOL_ABI, provider);
        const fee = await poolContract.fee();

        const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle({
            tokenIn: ADDRESSES.WETH,
            tokenOut: ADDRESSES.USDT,
            fee: fee,
            recipient: signer.address,
            deadline: Math.floor(Date.now() / 1000) + 600,
            amountIn: amountIn,
            sqrtPriceLimitX96: 0
        });

        const swapRouter = new ethers.Contract(ADDRESSES.SWAP_ROUTER, SWAP_ROUTER_ABI, signer);
        const swapParams = {
            tokenIn: ADDRESSES.WETH,
            tokenOut: ADDRESSES.USDT,
            fee: fee,
            recipient: signer.address,
            deadline: Math.floor(Date.now() / 1000) + 600,
            amountIn: amountIn,
            amountOutMinimum: quotedAmountOut[0],
            sqrtPriceLimitX96: 0
        };

        const swapTx = await swapRouter.exactInputSingle(swapParams);
        const swapReceipt = await swapTx.wait();

        return {
            status: true,
            message: "Swap completed successfully",
            inputAmount: `${amount} ETH`,
            outputAmount: `${ethers.utils.formatUnits(quotedAmountOut[0], 6)} USDC`,
            transactions: {
                wrap: wrapTxHash ? `https://sepolia.etherscan.io/tx/${wrapTxHash}` : null,
                approve: `https://sepolia.etherscan.io/tx/${approveReceipt.transactionHash}`,
                swap: `https://sepolia.etherscan.io/tx/${swapReceipt.transactionHash}`,
                swapHash: swapReceipt.transactionHash
            }
        };
    } catch (error) {
        return {
            status: false,
            message: "Swap failed",
            details: error.message
        };
    }
}

module.exports = { onSwapETHtoUSDC };
