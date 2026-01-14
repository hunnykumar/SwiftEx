import { RPC, STELLAR_URL } from '../Dashboard/constants';
import {
  AllbridgeCoreSdk,
  Messenger,
  FeePaymentMethod,
  AmountFormat,
  nodeRpcUrlsDefault,
  mainnet,
} from "@allbridge/bridge-core-sdk";
import * as StellarSdk from '@stellar/stellar-sdk';
import LocalTxManager from './LocalTxManager';

export async function getChainTokenData(sourceChain, destChain, sourceToken, destToken, amount) {
  console.log("Allbridge-Info--", sourceChain, destChain, sourceToken, destToken, amount);
  try {
    const sdk = new AllbridgeCoreSdk({ ETH: RPC.ETHRPC });
    if (!sourceChain || !destChain) {
      throw new Error("Both sourceChain and destChain are required.");
    }
    if (!sourceToken || !destToken) {
      throw new Error("Both sourceToken and destToken are required.");
    }
    if (!amount || isNaN(Number(amount))) {
      throw new Error("A valid numeric amount is required.");
    }
    const chains = await sdk.chainDetailsMap();
    const srcChain = chains[sourceChain];
    const dstChain = chains[destChain];
    if (!srcChain) throw new Error(`Source chain '${sourceChain}' not found.`);
    if (!dstChain) throw new Error(`Destination chain '${destChain}' not found.`);
    const srcToken = srcChain.tokens.find((t) => t.symbol === sourceToken);
    const dstToken = dstChain.tokens.find((t) => t.symbol === destToken);
    if (!srcToken) throw new Error(`Source token '${sourceToken}' not found for ${sourceChain}.`);
    if (!dstToken) throw new Error(`Destination token '${destToken}' not found for ${destChain}.`);
    const minimumReceiveAmount = await sdk.getAmountToBeReceived(
      amount,
      srcToken,
      dstToken,
      Messenger.ALLBRIDGE
    );
    const { gasFeeOptions } = await sdk.getAmountToBeReceivedAndGasFeeOptions(
      amount,
      srcToken,
      dstToken,
      Messenger.ALLBRIDGE
    );
    const feeObj = {
      native: {
        amount: gasFeeOptions.native.float,
        symbol: srcChain.nativeCurrencySymbol || "Native"
      },
      stablecoin: {
        amount: gasFeeOptions?.stablecoin?.float || "0",
        symbol: srcToken.symbol
      },
    };
    const trasTMinSec = sdk.getAverageTransferTime(srcToken, dstToken, Messenger.ALLBRIDGE);
    const trasTM = trasTMinSec !== null ? (trasTMinSec / 1000 / 60).toFixed(2) : null;
    const conversionRate = (parseFloat(minimumReceiveAmount) / parseFloat(amount)).toFixed(12);
    return {
      success: true,
      info: {
        conversionRate: conversionRate,
        minimumAmountOut: minimumReceiveAmount,
        slippageTolerance: 1,
        completionTime: trasTM + " Min",
        fee: feeObj,
      }
    };
  } catch (error) {
    console.log("Error in allbridge quotes:", error.message || error);
    return { success: false, error: error.message || "Unknown error occurred." };
  }
}

export async function swapPepare(
  sourceChain,
  destChain,
  sourceTokenSymbol,
  destTokenSymbol,
  amount,
  recipientAddress,
  stellarWallet,
  payFeeMode
) {
  console.log("Allbridge-swap--", sourceChain, destChain, sourceTokenSymbol, destTokenSymbol, amount, recipientAddress);

  try {
    if (!stellarWallet) throw new Error("Wallet (signer) is required.");
    if (!recipientAddress) throw new Error("Recipient address is required.");

    const sdk = new AllbridgeCoreSdk({
      ...nodeRpcUrlsDefault,
      SRB: "https://stellar-soroban-public.nodies.app",
      BNB: RPC.BSCRPC,
      ETH: RPC.ETHRPC
    });

    const sendTransactionWithRetry = async (
      sdk,
      sendParams,
      stellarWallet,
      maxAttempts = 2
    ) => {
      const keypair = StellarSdk.Keypair.fromSecret(stellarWallet.secretKey);

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          console.log(` Attempt ${attempt}/${maxAttempts}: Building transaction...`);

          const xdrTx = await sdk.bridge.rawTxBuilder.send(sendParams);
          let tx = StellarSdk.TransactionBuilder.fromXDR(xdrTx, mainnet.sorobanNetworkPassphrase);
          tx.sign(keypair);
          let signedTx = tx.toXDR();

          const restoreXdrTx = await sdk.utils.srb.simulateAndCheckRestoreTxRequiredSoroban(
            signedTx,
            stellarWallet.publicKey
          );

          if (restoreXdrTx) {
            console.log("Restore transaction required...");
            const restoreTx = StellarSdk.TransactionBuilder.fromXDR(
              restoreXdrTx,
              mainnet.sorobanNetworkPassphrase
            );
            restoreTx.sign(keypair);
            const signedRestoreXdrTx = restoreTx.toXDR();

            const sentRestore = await sdk.utils.srb.sendTransactionSoroban(signedRestoreXdrTx);
            const confirmRestore = await sdk.utils.srb.confirmTx(sentRestore.hash);

            if (confirmRestore.status !== "SUCCESS") {
              throw new Error(`Restore failed: ${confirmRestore.status}`);
            }

            console.log("Restore transaction successful");

            const xdrTx2 = await sdk.bridge.rawTxBuilder.send(sendParams);
            tx = StellarSdk.TransactionBuilder.fromXDR(xdrTx2, mainnet.sorobanNetworkPassphrase);
            tx.sign(keypair);
            signedTx = tx.toXDR();
          }

          const sent = await sdk.utils.srb.sendTransactionSoroban(signedTx);
          console.log(`Attempt ${attempt} response:`, sent.status);

          if (sent.status === "ERROR" && attempt < maxAttempts) {
            console.log(`ERROR received. Retrying in 1 second...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          return sent;

        } catch (error) {
          console.error(`Attempt ${attempt} error:`, error.message);

          if (attempt < maxAttempts) {
            console.log(`Retrying after error...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }

          throw error;
        }
      }
    };

    const chainDetailsMap = await sdk.chainDetailsMap();
    const srcChain = chainDetailsMap[sourceChain];
    const dstChain = chainDetailsMap[destChain];

    if (!srcChain) throw new Error("Source chain not found.");
    if (!dstChain) throw new Error(`Destination chain '${destChain}' not found.`);

    const srcToken = srcChain.tokens.find((t) => t.symbol === sourceTokenSymbol);
    const dstToken = dstChain.tokens.find((t) => t.symbol === destTokenSymbol);

    if (!srcToken) throw new Error(`Source token '${sourceTokenSymbol}' not found for ${sourceChain}.`);
    if (!dstToken) throw new Error(`Destination token '${destTokenSymbol}' not found for ${destChain}.`);

    const sendParams = {
      amount: amount,
      fromAccountAddress: stellarWallet.publicKey,
      toAccountAddress: recipientAddress,
      sourceToken: srcToken,
      destinationToken: dstToken,
      messenger: Messenger.ALLBRIDGE,
      extraGas: "1.15",
      extraGasFormat: AmountFormat.FLOAT,
      gasFeePaymentMethod: payFeeMode === "native"
        ? FeePaymentMethod.WITH_NATIVE_CURRENCY
        : FeePaymentMethod.WITH_STABLECOIN,
    };

    const sent = await sendTransactionWithRetry(sdk, sendParams, stellarWallet, 2);

    if (sent.status === "ERROR") {
      return { success: false, error: "Transaction failed" };
    }

    if (sent.status === "TRY_AGAIN_LATER") {
      return { success: false, error: "Network busy. Please try again later." };
    }

    if (sent.status === "DUPLICATE") {
      return { success: false, error: "Duplicate transaction detected." };
    }

    if (sent.status === "PENDING") {
      await LocalTxManager.saveTx(recipientAddress, {
        chain: "SRB",
        hash: sent.hash,
        status: "pending",
        statusColor: "#eec14fff",
        timestamp: Date.now(),
        symbol: srcToken.symbol,
        amount: amount,
      });

      return { success: true, txHash: sent.hash };
    }

    console.warn("Unexpected transaction status:", sent.status);
    return { success: false, error: `Unexpected status: ${sent.status}` };

  } catch (err) {
    console.error("Error in allbridge swap:", err.message || err);
    return { success: false, error: err.message || "Unknown error occurred." };
  }
}