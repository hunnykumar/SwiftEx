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
import CustomInfoProvider from '../Dashboard/exchange/crypto-exchange-front-end-main/src/components/CustomInfoProvider';

export async function getChainTokenData(sourceChain, destChain, sourceToken, destToken, amount) {
    console.log("Allbridge-Info--", sourceChain, destChain, sourceToken, destToken, amount)
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
            symbole: srcChain.nativeCurrencySymbol || "Native"
          },
          stablecoin: {
            amount: gasFeeOptions.stablecoin.float,
            symbole: srcToken.symbol
          },
        };
        const trasTMinSec = sdk.getAverageTransferTime(srcToken, dstToken, Messenger.ALLBRIDGE);
        const trasTM = trasTMinSec !== null ? (trasTMinSec / 1000 / 60).toFixed(2) : null;
        const conversionRate = (parseFloat(minimumReceiveAmount) / parseFloat(amount)).toFixed(12);
        return { success: true, info: { conversionRate: conversionRate, minimumAmountOut: minimumReceiveAmount, slippageTolerance: 1, completionTime: trasTM + " Min", fee: feeObj, } };
    } catch (error) {
        console.log("Error in allbridge qoutes:", error.message || error);
        return { success: false, error: error.message || "Unknown error occurred." };
    }
}

// const getRes = await getChainTokenData('SRB', 'ETH', 'USDC', 'USDT', '100');
// console.log(`Chain info:--- ${JSON.stringify(getRes)}`);


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
        SRB: "https://rpc.ankr.com/stellar_soroban",
        BNB: RPC.BSCRPC,
        ETH: RPC.ETHRPC
      });
  
      const chainDetailsMap = await sdk.chainDetailsMap();
      const srcChain = chainDetailsMap[sourceChain];
      const dstChain = chainDetailsMap[destChain];
  
      if (!srcChain) throw new Error("Source chain not found.");
      if (!dstChain) throw new Error(`Destination chain '${destChain}' not found.`);
  
      const srcToken = srcChain.tokens.find((t) => t.symbol === sourceTokenSymbol);
      const dstToken = dstChain.tokens.find((t) => t.symbol === destTokenSymbol);
  
      if (!srcToken) throw new Error(`Source token '${sourceTokenSymbol}' not found for ${sourceChain}.`);
      if (!dstToken) throw new Error(`Destination token '${destTokenSymbol}' not found for ${destChain}.`);

      const xdrTx = await sdk.bridge.rawTxBuilder.send({
        amount:amount,
        fromAccountAddress:stellarWallet.publicKey,
        toAccountAddress:recipientAddress,
        sourceToken:srcToken,
        destinationToken:dstToken,
        messenger:Messenger.ALLBRIDGE,
        extraGas: "1.15",
        extraGasFormat: AmountFormat.FLOAT,
        gasFeePaymentMethod: payFeeMode==="native"?FeePaymentMethod.WITH_NATIVE_CURRENCY:FeePaymentMethod.WITH_STABLECOIN,
      })
      const keypair = StellarSdk.Keypair.fromSecret(stellarWallet.secretKey);
      let tx = StellarSdk.TransactionBuilder.fromXDR(xdrTx, mainnet.sorobanNetworkPassphrase);
      tx.sign(keypair);
      let signedTx = tx.toXDR();
  
      const restoreXdrTx = await sdk.utils.srb.simulateAndCheckRestoreTxRequiredSoroban(signedTx, stellarWallet.publicKey);
      if (restoreXdrTx) {
        const restoreTx = StellarSdk.TransactionBuilder.fromXDR(restoreXdrTx, mainnet.sorobanNetworkPassphrase);
        restoreTx.sign(keypair);
        const signedRestoreXdrTx = restoreTx.toXDR();
        const sentRestore = await sdk.utils.srb.sendTransactionSoroban(signedRestoreXdrTx);
        const confirmRestore = await sdk.utils.srb.confirmTx(sentRestore.hash);
        console.log("Restore TX status:", confirmRestore.status);
    
        const xdrTx2 = await sdk.bridge.rawTxBuilder.send(sendParams);
        let tx = StellarSdk.TransactionBuilder.fromXDR(xdrTx, mainnet.sorobanNetworkPassphrase);
        tx.sign(keypair);
        
        signedTx = tx.toXDR();
      }
    
      const sent = await sdk.utils.srb.sendTransactionSoroban(signedTx);
      console.log("Response of execute tx:", sent);
      if (sent.status === "ERROR") {
        CustomInfoProvider.show("error", "Transaction failed try again.");
        return { success: false };
      }
      if (sent.status === "TRY_AGAIN_LATER") {
        CustomInfoProvider.show("error", "Transaction failed try again.");
        return { success: false };
      }
      if (sent.status === "DUPLICATE") {
        CustomInfoProvider.show("Info", "Duplicate transaction found.");
        return { success: false };
      }
      if (sent.status === "PENDING") {
          const matchedTx = await waitForTransferStatus(sdk, "SRB", sent.hash, 60000, 5000);
          if (matchedTx?.txId) {
            return { success: true, txHash: sent.hash };
          } else {
            return { success: false, error: "Transaction still pending after 1 minute." };
          }
        }
    } catch (err) {
      console.log("Error in allbridge swap:", err.message || err);
      return { success: false, error: err.message || "Unknown error occurred." };
    }
  }

  async function waitForTransferStatus(sdk, chain, hash, timeout = 60000, interval = 5000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const status = await sdk.getTransferStatus(chain, hash);
      if (status && status.txId) {
        return status;
      }
      console.log(`TX still pending... checking again in ${interval / 1000}s`);
      await new Promise(res => setTimeout(res, interval));
    }
    return null;
  }
  