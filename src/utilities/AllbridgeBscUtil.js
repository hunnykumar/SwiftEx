import { ethers } from "ethers";
import { PPOST, proxyRequest } from "../Dashboard/exchange/crypto-exchange-front-end-main/src/api";



export async function SwapPepare(
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
    console.log("Starting bridge swap process");
    const prepareResponse = await proxyRequest("/v1/bridge/swap-transaction/prepare", PPOST, {
      fromAddress,
      toAddress,
      amount,
      sourceToken,
      destinationToken,
      walletType,
      feePayType: feePayType === "native" ? "native" : "stablecoin"
    });

    console.log("Swap prepare response:", prepareResponse);

    if (prepareResponse.err) {
      return {
        res: prepareResponse.err?.message || "Swap preparation failed",
        status_task: false
      };
    }

    const { needsApproval, transactions } = prepareResponse.res;

    if (!transactions || transactions.length === 0) {
      return {
        res: "No transaction data received from server",
        status_task: false
      };
    }

    console.log(`Transactions to process: ${transactions.length}`);
    if (needsApproval) {
      console.log("Approval transaction required");
    }

    console.log("Signing all transactions");
    const signedTransactions = [];

    for (const txData of transactions) {
      try {
        const signedTx = await signTransaction(privateKey, txData);
        signedTransactions.push(signedTx);
        console.log(`${txData.type} transaction signed`);
      } catch (signError) {
        console.error(`Failed to sign ${txData.type}:`, signError);
        return {
          res: `Failed to sign ${txData.type} transaction: ${signError.message}`,
          status_task: false
        };
      }
    }

    console.log("Broadcasting transactions");

    const broadcastResponse = await proxyRequest("/v1/bsc/transaction/broadcast", PPOST, {
      signedTransactions
    });

    console.log("Broadcast response:", broadcastResponse);

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

      console.log("All transactions completed successfully:", response);

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
    console.log("Error in swap_prepare:", error);
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

    if (!tx.from) throw new Error("Transaction 'from' address is missing");
    if (!tx.to) throw new Error("Transaction 'to' address is missing");
    if (!meta?.gasLimit) throw new Error("Gas limit is missing");
    if (!meta?.feeData) throw new Error("Fee data is missing");
    if (meta.nonce === undefined) throw new Error("Nonce is missing");

    const toBigNumber = (value, fieldName = "value") => {
      if (value === null || value === undefined) {
        return ethers.BigNumber.from(0);
      }
      
      if (ethers.BigNumber.isBigNumber(value)) {
        return value;
      }
      
      try {
        return ethers.BigNumber.from(value);
      } catch (err) {
        console.error(`Error converting ${fieldName}:`, value);
        throw new Error(`Invalid ${fieldName}: ${value}`);
      }
    };

    const isEIP1559 = meta.feeData.maxFeePerGas !== null && 
                      meta.feeData.maxPriorityFeePerGas !== null;

    const baseTx = {
      from: tx.from,
      to: tx.to,
      data: tx.data || "0x",
      value: toBigNumber(tx.value, "value"),
      gasLimit: toBigNumber(meta.gasLimit, "gasLimit"),
      nonce: meta.nonce,
      chainId: Number(meta.network.chainId),
    };

    let txToSign;

    if (isEIP1559) {
      console.log(` Signing EIP-1559 transaction (${txData.type})`);
      txToSign = {
        ...baseTx,
        maxFeePerGas: toBigNumber(meta.feeData.maxFeePerGas, "maxFeePerGas"),
        maxPriorityFeePerGas: toBigNumber(meta.feeData.maxPriorityFeePerGas, "maxPriorityFeePerGas"),
        type: 2,
      };
    } else {
      console.log(` Signing Legacy transaction (${txData.type})`);
      txToSign = {
        ...baseTx,
        gasPrice: toBigNumber(meta.feeData.gasPrice, "gasPrice"),
        type: 0,
      };
    }

    console.log(`Transaction to sign (${txData.type}):`, {
      from: txToSign.from,
      to: txToSign.to,
      value: txToSign.value.toString(),
      gasLimit: txToSign.gasLimit.toString(),
      gasPrice: txToSign.gasPrice?.toString(),
      maxFeePerGas: txToSign.maxFeePerGas?.toString(),
      nonce: txToSign.nonce,
      chainId: txToSign.chainId,
      type: txToSign.type,
    });

    const signedTx = await account.signTransaction(txToSign);

    if (!signedTx) {
      throw new Error("Transaction signing failed - no signed transaction returned");
    }

    console.log(` ${txData.type} transaction signed (${signedTx.length} bytes)`);
    return signedTx;

  } catch (error) {
    console.error(`Error signing ${txData.type} transaction:`, error);
    console.error("Full transaction data:", JSON.stringify(txData, null, 2));
    throw error;
  }
}

export async function getWalletBalance(address) {
  try {
    const resProxy = await proxyRequest(`/v1/bsc/${address}/balance`, PGET);

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
    console.log("Error fetching wallet balance:", error);
    throw error;
  }
}