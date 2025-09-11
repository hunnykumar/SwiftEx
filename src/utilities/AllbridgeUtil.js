import { RPC, STELLAR_URL } from '../Dashboard/constants';
import { 
    AllbridgeCoreSdk, 
    Messenger,
    FeePaymentMethod,
    AmountFormat,
} from "@allbridge/bridge-core-sdk";
import * as StellarSdk from '@stellar/stellar-sdk';

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
            native: `${gasFeeOptions.native.float} ${srcChain.nativeCurrencySymbol || "Native"}`,
            stablecoin: `${gasFeeOptions.stablecoin.float} ${srcToken.symbol}`
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
    stellarWallet
  ) {
    console.log("Allbridge-swap--", sourceChain, destChain, sourceTokenSymbol, destTokenSymbol, amount, recipientAddress);
  
    try {
      if (!stellarWallet) throw new Error("Wallet (signer) is required.");
      if (!recipientAddress) throw new Error("Recipient address is required.");
  
      const sdk = new AllbridgeCoreSdk({
        SRB: STELLAR_URL.URL,
        BNB: RPC.BSCRPC,
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
        gasFeePaymentMethod: FeePaymentMethod.WITH_NATIVE_CURRENCY,
      })
         console.log("xdrTx",xdrTx)
        const keypair = StellarSdk.Keypair.fromSecret(stellarWallet.secretKey);
        const envelope = StellarSdk.xdr.TransactionEnvelope.fromXDR(xdrTx, "base64");
        const tx = new StellarSdk.Transaction(envelope, StellarSdk.Networks.PUBLIC);
        tx.sign(keypair);
        const server = new StellarSdk.Horizon.Server(STELLAR_URL.URL);
        const result = await server.submitTransaction(tx);
  
      console.log("Submitted Stellar transaction. Hash:", result);
      return {
        success: true,
        txHash: submit.hash,
      };
    } catch (err) {
      console.error("Error in allbridge swap:", err.message || err);
      return { success: false, error: err.message || "Unknown error occurred." };
    }
  }
  