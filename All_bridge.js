import { ethers } from "ethers";

const Web3 = require("web3");
const { ETH_PROVIDER_NEW, REACT_APP_HOST } = require("./src/Dashboard/exchange/crypto-exchange-front-end-main/src/ExchangeConstants");
const { getAuth, proxyRequest, PPOST, PGET } = require("./src/Dashboard/exchange/crypto-exchange-front-end-main/src/api");


async function hasEnoughFunds(fromAddress, txMeta, value = "0") {
  const resProxy = await proxyRequest(`/v1/eth/${fromAddress}/balance`, PGET);
  const balance=ethers.BigNumber.from(resProxy?.res);
  const gasLimit = ethers.BigNumber.from(txMeta.gasLimit);
  const gasPrice = ethers.BigNumber.from(txMeta.feeData.gasPrice);
  const maxFeePerGas = ethers.BigNumber.from(txMeta.feeData.maxFeePerGas);
  const txValue = ethers.BigNumber.from(value);
  const requiredLegacy = txValue.add(gasLimit.mul(gasPrice));
  const requiredEip1559 = txValue.add(gasLimit.mul(maxFeePerGas));
  return {
    balance,
    requiredLegacy,
    requiredEip1559,
    hasLegacy: balance.gte(requiredLegacy),
    hasEip1559: balance.gte(requiredEip1559),
  };
}


export async function swap_prepare(privateKey, fromAddress, toAddress, amount, sourceToken, destinationToken, walletType) {
  try {
    const firstResponse = await proxyRequest("/v1/bridge/swap-transaction/prepare", PPOST, {
      "fromAddress": fromAddress,
      "toAddress": toAddress,
      "amount": amount,
      "sourceToken": sourceToken,
      "destinationToken": destinationToken,
      "walletType": walletType
    });

    console.log("First API call response:", firstResponse);

    if (firstResponse.err) {
      return {
        res: firstResponse.err?.message || "Swap failed",
        status_task: false
      };
    }

    if (!firstResponse.res.transaction) {
      return {
        res: "No transaction data received",
        status_task: false
      };
    }

    const transactionType = firstResponse.res.type;
    console.log(`Executing ${transactionType} transaction...`);
    const fundCheck = await hasEnoughFunds(fromAddress, firstResponse.res.txMeta);
    console.log("Wallet Balance:", ethers.utils.formatEther(fundCheck.balance));
    console.log("Needed (EIP-1559):", ethers.utils.formatEther(fundCheck.requiredEip1559));
    if (!fundCheck.hasEip1559) {
      return {
        res: `Insufficient funds: not enough ETH to pay for ${transactionType} gas.`,
        status_task: false
      };
    }
    const firstTxResult = await sendEvmRawTransaction(privateKey, firstResponse.res);
    console.log(`${transactionType} transaction result:`, firstTxResult);

    if (firstTxResult.status !== true) {
      return {
        res: `${transactionType} transaction failed`,
        status_task: false
      };
    }

    const firstTxHash = firstTxResult.transactionHash;
    console.log(`${transactionType} completed, hash:`, firstTxHash);
    if (transactionType === 'approve') {
      console.log("Approval completed, now executing transfer...");
      await waitForTransactionConfirmation(firstTxHash);
      const secondResponse = await proxyRequest("/v1/bridge/swap-transaction/prepare", PPOST, {
        "fromAddress": fromAddress,
        "toAddress": toAddress,
        "amount": amount,
        "sourceToken": sourceToken,
        "destinationToken": destinationToken,
        "walletType": walletType
      });
      console.log("Second API call response:", secondResponse);
      if (secondResponse.err) {
        return {
          res: secondResponse.err?.message || "Transfer preparation failed",
          status_task: false,
          approvalTxHash: firstTxHash
        };
      }

      if (!secondResponse.res.transaction) {
        return {
          res: "No transfer transaction data received",
          status_task: false,
          approvalTxHash: firstTxHash
        };
      }
      const transferFundCheck = await hasEnoughFunds(fromAddress, secondResponse.res.txMeta);
      if (!transferFundCheck.hasEip1559) {
        return {
          res: "Insufficient funds for transfer transaction",
          status_task: false,
          approvalTxHash: firstTxHash
        };
      }
      const secondTxResult = await sendEvmRawTransaction(privateKey, secondResponse.res);
      console.log("Transfer transaction result:", secondTxResult);

      if (secondTxResult.status === true) {
        return {
          res: {
            approvalTxHash: firstTxHash,
            transferTxHash: secondTxResult.transactionHash,
            message: "Swap completed successfully! Both approval and transfer done."
          },
          status_task: true
        };
      } else {
        return {
          res: "Transfer transaction failed",
          status_task: false,
          approvalTxHash: firstTxHash
        };
      }
    } 
    else if (transactionType === 'transfer') {
      return {
        res: {
          transferTxHash: firstTxHash,
          message: "Swap completed successfully! Transfer done directly."
        },
        status_task: true
      };
    } 
    else {
      return {
        res: "Unknown transaction type received",
        status_task: false
      };
    }

  } catch (error) {
    console.error("Error in swap_prepare:", error);
    return {
      res: error.message || "Unknown error occurred",
      status_task: false
    };
  }
}

async function waitForTransactionConfirmation(txHash, maxWaitTime = 60000) {
  console.log(`Waiting for confirmation of tx: ${txHash}`);
  const startTime = Date.now();
  while (Date.now() - startTime < maxWaitTime) {
    try {
      const receipt = await window.ethereum.request({
        method: 'eth_getTransactionReceipt',
        params: [txHash]
      });
      
      if (receipt && receipt.status === '0x1') {
        console.log(`Transaction confirmed: ${txHash}`);
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.warn("Error checking transaction status:", error);
    }
  }
  
  console.warn(`Transaction confirmation timeout: ${txHash}`);
  return false;
}

  async function swap_execute(privateKey,fromAddress,toAddress,amount,sourceToken,destinationToken,walletType) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", "Bearer " + await getAuth());

  const raw = JSON.stringify({
    "fromAddress":fromAddress ,
    "toAddress": toAddress,
    "amount": amount,
    "sourceToken": sourceToken,
    "destinationToken": destinationToken,
    "walletType": walletType
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };

  try {
    const response = await fetch(REACT_APP_HOST+"/users/swap_exchange_execute", requestOptions);
    const result = await response.json();
    console.log("swap_exchange_execute--->",result)
    if (result.response.status_swap) {
     const res=await sendEvmRawTransaction(privateKey,result.response.res)
     console.log("swap_exchange_execute--->sendEvmRawTransaction",res)
     if(res.status===true)
     {
      return {
        res:res,
        status_task:true
      }
     }
     else{
      return {
        res:error,
        status_task:false
      }
     }
    }
      return {
        res:error,
        status_task:false
      }
  } catch (error) {
    console.log(error);
    return {
      res:error,
      status_task:false
    }
  }
}




async function sendEvmRawTransaction(privateKey, rawTransaction) {

  try {
    const account = new ethers.Wallet(privateKey);
    const tx = rawTransaction.transaction;
    const meta = rawTransaction.txMeta;

    if (!tx.from) {
      throw new Error("rawTransaction.from is undefined");
    }
    const { gas, ...cleanTx } = tx;

    const txToSign = {
      ...cleanTx,
      gasLimit: ethers.BigNumber.from(meta.gasLimit),
      maxFeePerGas: ethers.BigNumber.from(meta.feeData.maxFeePerGas),
      maxPriorityFeePerGas: ethers.BigNumber.from(meta.feeData.maxPriorityFeePerGas),
      nonce: meta.nonce,
      chainId: Number(meta.network.chainId),
      type: 2,
    };

    const signedTx = await account.signTransaction(txToSign);
    if (!signedTx) {
      throw new Error("signedTx.rawTransaction is undefined");
    }

    const respoExe = await proxyRequest("/v1/eth/transaction/broadcast", PPOST, { signedTx: signedTx });
    if (respoExe?.res?.txHash) {
      console.log("Transaction Sent", `Tx Hash: ${respoExe?.res?.txHash}`);
      return { res: respoExe?.res, status: true};
    }
    if (respoExe?.err) {
      console.log("Transaction Failed", respoExe);
      return { res: respoExe.err, status: false};
    }
  } catch (error) {
    console.error("Error sending transaction:", error);
    throw error;
  }
}
