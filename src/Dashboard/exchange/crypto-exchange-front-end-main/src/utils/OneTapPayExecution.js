const FACTORY_ABI = require('../../../../../ethSwap/abi/factory.json');
const QUOTER_ABI = require('../../../../../ethSwap/abi/quoter.json');
const SWAP_ROUTER_ABI = require('../../../../../ethSwap/abi/swaprouter.json');
const POOL_ABI = require('../../../../../ethSwap/abi/pool.json');
const { ethers } = require('ethers');
const { proxyRequest, PPOST } = require('../api');
const { toString } = require('lodash');
const { getWalletBalance } = require('./getWalletInfo/EtherWalletService');

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


async function onSwapETHtoUSDC(amount, privateKey, fees) {
    try {
        const wallet = new ethers.Wallet(privateKey);
        const address = await wallet.getAddress();
        const balanceIn=await getWalletBalance(address,"ETH");
        const ethBalance = ethers.utils.parseEther(balanceIn.balance.toString());
        const amountIn = ethers.utils.parseEther(amount);
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
        const ethAmount = ethers.utils.parseEther(amount.toString());
    
        // Interface setup
        const wethIface = new ethers.utils.Interface(WETH_ABI);
        const swapIface = new ethers.utils.Interface(SWAP_ROUTER_ABI);
    
        // Construct parameters
        const params = {
            tokenIn: ADDRESSES.WETH,
            tokenOut: ADDRESSES.USDT,
            fee: fees,
            recipient: address,
            deadline: Math.floor(Date.now() / 1000) + 600,
            amountIn: ethAmount,
            amountOutMinimum: 0,
            sqrtPriceLimitX96: 0
        };
    
        // Encode
        const swapData = swapIface.encodeFunctionData("exactInputSingle", [params]);
    
        const payload = {
            address: address,
            swapType:"EthToUsdc",
            swapData,
            value: ethAmount
        };
    
            payload.depositData = wethIface.encodeFunctionData("deposit");
            payload.approveData = wethIface.encodeFunctionData("approve", [ADDRESSES.SWAP_ROUTER, ethAmount]);
        
    
        // Send to backend
          const respo = await proxyRequest("/v1/eth/swap-transaction/prepare", PPOST,  payload);
          if(respo.err?.status===500)
                      {
                        return {
                            status: false,
                            message: "Swap failed",
                            details: "faild to swap"
                        };
                      }
                      
                      const signedTxs = await Promise.all(
                        respo.res.map(tx => wallet.signTransaction(tx))
                      );
                      console.log(signedTxs)
        const QuotedAmountOutRes = await proxyRequest("/v1/eth/swap-quote", PPOST, {
            tokenIn: {
                "symbol": "WETH",
                "decimals": 18,
                "address": "0xfff9976782d46cc05630d1f6ebab18b2324d6b14"
            },
            tokenOut: {
                "symbol": "USDT",
                "decimals": 6,
                "address": "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0"
            }, amount: toString(amount)
        });
                      console.log("----QuotedAmountOutRes",QuotedAmountOutRes.res);
              
                  const { res, err } = await proxyRequest("/v1/eth/swap-transaction/execute", PPOST,  {txs:signedTxs});
                  console.log("swap-exe---",res,err)
                  if(err?.status===500)
                  {
                    return {
                        status: false,
                        message: "Swap failed",
                        details: "faild to swap"
                    };
                  }
                  if(res?.[0]?.status===1)
                    console.log("=====000",res)
                      {
                          return {
                            status: true,
                            message: "Swap completed successfully",
                            inputAmount: `${amount} ETH`,
                            outputAmount: `${QuotedAmountOutRes?.res?.outputAmount}`,
                            transactions: {
                                approve: `https://sepolia.etherscan.io/tx/${res?.[0].transactionHash}`,
                                swap: `https://sepolia.etherscan.io/tx/${res?.[1].transactionHash}`,
                            }
                        };
                      }    
          

       
    } catch (error) {
        console.log("error onSwapETHtoUSDC: ",error)
        return {
            status: false,
            message: "Swap failed",
            details: error.message
        };
    }
}

module.exports = { onSwapETHtoUSDC };
