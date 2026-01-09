import { ethers } from "ethers";

const { proxyRequest, PPOST, PGET } = require("./src/Dashboard/exchange/crypto-exchange-front-end-main/src/api");

export async function swap_prepare(
  privateKey,
  fromAddress,
  toAddress,
  amount,
  sourceToken,
  destinationToken,
  walletType,
  feePayType
) {
  try {
    console.log("starting bridge swap process");
    const prepareResponse = await proxyRequest("/v1/bridge/swap-transaction/prepare", PPOST, {
      fromAddress,
      toAddress,
      amount,
      sourceToken,
      destinationToken,
      walletType,
      feePayType: feePayType === "native" ? "native" : "stablecoin"
    });

    console.log("swap prepare response:", prepareResponse);

    if (prepareResponse.err) {
      return {
        res: prepareResponse.err?.message || "Swap preparation failed",
        status_task: false
      };
    }

    const { needsApproval, transactions } = prepareResponse.res;

    if (!transactions || transactions.length === 0) {
      return {
        res: "no transaction data received from server",
        status_task: false
      };
    }

    console.log(`transactions to process: ${transactions.length}`);
    if (needsApproval) {
      console.log("approval transaction required");
    }

    console.log("signing all transactions");
    const signedTransactions = [];

    for (const txData of transactions) {
      try {
        const signedTx = await signTransaction(privateKey, txData);
        signedTransactions.push(signedTx);
        console.log(`${txData.type} transaction signed`);
      } catch (signError) {
        return {
          res: `Failed to sign ${txData.type} transaction: ${signError.message}`,
          status_task: false
        };
      }
    }

    console.log("Broadcasting transactions");

    const broadcastResponse = await proxyRequest("/v1/eth/transaction/broadcast", PPOST, {
      signedTransactions
    });

    console.log("broadcast response:", broadcastResponse);

    if (broadcastResponse.err) {
      return {
        res: broadcastResponse.err?.message || "Transaction broadcast failed",
        status_task: false,
        partialResults: broadcastResponse.err?.completedTransactions
      };
    }

    const { success, results, totalTransactions } = broadcastResponse.res;

    if (success) {
      const response = {
        message: "Swap completed successfully!",
        totalTransactions
      };

      results.forEach((result) => {
        if (result.type === 'approve') {
          response.approvalTxHash = result.transactionHash;
          response.approvalBlock = result.blockNumber;
          response.approvalGasUsed = result.gasUsed;
        } else if (result.type === 'transfer') {
          response.transferTxHash = result.transactionHash;
          response.transferBlock = result.blockNumber;
          response.transferGasUsed = result.gasUsed;
        }
      });

      console.log("all transactions completed successfully:", response);

      return {
        res: response,
        status_task: true
      };
    } else {
      return {
        res: "Broadcast completed but some transactions failed",
        status_task: false,
        results
      };
    }

  } catch (error) {
    console.error("error in swap_prepare:", error);
    return {
      res: error.message || "Unknown error occurred during swap",
      status_task: false
    };
  }
}

async function signTransaction(privateKey, txData) {
  try {
    const account = new ethers.Wallet(privateKey);
    const tx = txData.transaction;
    const meta = txData.txMeta;

    if (!tx.from) {
      throw new Error("Transaction 'from' address is missing");
    }

    if (!tx.to) {
      throw new Error("Transaction 'to' address is missing");
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
      throw new Error("Transaction signing failed - no signed transaction returned");
    }

    return signedTx;

  } catch (error) {
    console.error("Error signing transaction:", error);
    throw error;
  }
}


export async function getWalletBalance(address) {
  try {
    const resProxy = await proxyRequest(`/v1/eth/${address}/balance`, PGET);

    if (resProxy?.err) {
      throw new Error(resProxy.err.message || "Failed to fetch balance");
    }

    const balance = ethers.BigNumber.from(resProxy?.res || "0");

    return {
      balanceWei: balance.toString(),
      balanceEth: ethers.utils.formatEther(balance),
      balance: balance
    };
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    throw error;
  }
}