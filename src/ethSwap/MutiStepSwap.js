const { ethers } = require('ethers');
const FACTORY_ABI = require('./abi/factory.json');
const QUOTER_ABI = require('./abi/quoter.json');
const SWAP_ROUTER_ABI = require('./abi/swaprouter.json');
const POOL_ABI = require('./abi/pool.json');
const WETH_ABI = [
    "function deposit() external payable",
    "function withdraw(uint amount) external",
    "function balanceOf(address account) external view returns (uint256)",
    "function approve(address spender, uint256 amount) external returns (bool)"
];

const ADDRESSES = {
    POOL_FACTORY: '0x5C69bEe701ef814a2B6a3EDD4B65B2d6b5dC217F',
    QUOTER: '0xb27308f9F90D607463bb33eA1Be4eD2508b5b3A9',
    SWAP_ROUTER: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
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

async function swapETHtoUSDC(amount, privateKey, rpcUrl = 'https://eth-sepolia.g.alchemy.com/v2/k5oEPTr8Pryz-1bdXyNzH3TfwczQ_TRo') {
    try {
        // Initialize provider and signer
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        const signer = new ethers.Wallet(privateKey, provider);

        // Initialize contracts
        const wethContract = new ethers.Contract(ADDRESSES.WETH, WETH_ABI, signer);
        const factoryContract = new ethers.Contract(ADDRESSES.POOL_FACTORY, FACTORY_ABI, provider);
        const quoterContract = new ethers.Contract(ADDRESSES.QUOTER, QUOTER_ABI, provider);

        // Convert amount to Wei
        const amountIn = ethers.utils.parseEther(amount.toString());

        // Step 1: Check ETH balance
        const ethBalance = await provider.getBalance(signer.address);
        if (ethBalance.lt(amountIn)) {
            return new SwapResult(
                false,
                'Insufficient ETH balance',
                {
                    requiredAmount: amount,
                    currentBalance: ethers.utils.formatEther(ethBalance)
                }
            );
        }

        // Step 2: Wrap ETH to WETH
        let wrapTxHash;
        const wethBalance = await wethContract.balanceOf(signer.address);
        if (wethBalance.lt(amountIn)) {
            const wrapTx = await wethContract.deposit({ value: amountIn });
            const wrapReceipt = await wrapTx.wait();
            wrapTxHash = wrapReceipt.transactionHash;
        }

        // Step 3: Approve WETH
        const approveTx = await wethContract.approve(ADDRESSES.SWAP_ROUTER, amountIn);
        const approveReceipt = await approveTx.wait();

        // Step 4: Get pool info
        const poolAddress = await factoryContract.getPool(ADDRESSES.WETH, ADDRESSES.USDC, 3000);
        if (!poolAddress || poolAddress === ethers.constants.AddressZero) {
            return new SwapResult(false, 'Liquidity pool not found');
        }

        const poolContract = new ethers.Contract(poolAddress, POOL_ABI, provider);
        const fee = await poolContract.fee();

        // Step 5: Get quote
        const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle({
            tokenIn: ADDRESSES.WETH,
            tokenOut: ADDRESSES.USDC,
            fee: fee,
            recipient: signer.address,
            deadline: Math.floor(Date.now() / 1000) + 600,
            amountIn: amountIn,
            sqrtPriceLimitX96: 0
        });

        // Step 6: Execute swap
        const swapRouter = new ethers.Contract(ADDRESSES.SWAP_ROUTER, SWAP_ROUTER_ABI, signer);
        const swapParams = {
            tokenIn: ADDRESSES.WETH,
            tokenOut: ADDRESSES.USDC,
            fee: fee,
            recipient: signer.address,
            deadline: Math.floor(Date.now() / 1000) + 600,
            amountIn: amountIn,
            amountOutMinimum: quotedAmountOut[0],
            sqrtPriceLimitX96: 0
        };

        const swapTx = await swapRouter.exactInputSingle(swapParams);
        const swapReceipt = await swapTx.wait();

        return new SwapResult(
            true,
            'Swap completed successfully',
            {
                inputAmount: amount + ' ETH',
                outputAmount: ethers.utils.formatUnits(quotedAmountOut[0], 6) + ' USDC',
                transactions: {
                    wrap: wrapTxHash ? `https://sepolia.etherscan.io/tx/${wrapTxHash}` : null,
                    approve: `https://sepolia.etherscan.io/tx/${approveReceipt.transactionHash}`,
                    swap: `https://sepolia.etherscan.io/tx/${swapReceipt.transactionHash}`,
                    swapHash:swapReceipt.transactionHash
                }
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

module.exports = {
    swapETHtoUSDC
};