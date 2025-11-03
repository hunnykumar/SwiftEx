import * as StellarSdk from '@stellar/stellar-sdk';
import { STELLAR_URL } from '../../../../../constants';
const server = new StellarSdk.Horizon.Server(STELLAR_URL.URL);

async function AMMSWAPTESTNET(
  fromTokenCode,
  fromTokenIssuer,
  toTokenCode,
  toTokenIssuer,
  sourceSecret,
  destAmount,
  trustLineOpt
) {
  if (!sourceSecret) {
    return {
      status: false,
      tx: '',
      error: 'Missing secret key',
    };
  }

  try {
    const sourceKeypair = StellarSdk.Keypair.fromSecret(sourceSecret);
    const sourcePublicKey = sourceKeypair.publicKey();

    // Define sending asset
    const assetSend =
      fromTokenCode === 'XLM'
        ? StellarSdk.Asset.native()
        : new StellarSdk.Asset(fromTokenCode, fromTokenIssuer);

    // Define destination asset
    const assetDest =
      toTokenCode === 'XLM'
        ? StellarSdk.Asset.native()
        : new StellarSdk.Asset(toTokenCode, toTokenIssuer);

    // Load account
    const account = await server.loadAccount(sourcePublicKey);

    // Find paths
    const pathsResult = await server
      .strictReceivePaths([assetSend], assetDest, destAmount)
      .call();

    if (pathsResult.records.length === 0) {
      throw new Error(`No path found from ${fromTokenCode} to ${toTokenCode}.`);
    }

    // Pick the cheapest path (lowest source_amount)
    const bestPathRecord = pathsResult.records.sort(
      (a, b) => parseFloat(a.source_amount) - parseFloat(b.source_amount)
    )[0];

    // Map path assets
    const bestPath = bestPathRecord.path.map(p =>
      p.asset_type === 'native'
        ? StellarSdk.Asset.native()
        : new StellarSdk.Asset(p.asset_code, p.asset_issuer)
    );

    // Add 5% buffer
    const sendMaxAmt = (parseFloat(bestPathRecord.source_amount) * 1.05).toFixed(7);

    console.log("Best Path:", bestPath);
    console.log("Send Max (with buffer):", sendMaxAmt);

    // Build transaction
    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.PUBLIC,
    });
  
    if (Array.isArray(trustLineOpt) && trustLineOpt.length > 0) {
      trustLineOpt.forEach(trustLineAsset => {
        const asset = new StellarSdk.Asset(
          trustLineAsset.tokenSymbole, 
          trustLineAsset.tokenIssuer
        );
        tx.addOperation(
          StellarSdk.Operation.changeTrust({
            asset: asset,
          })
        );
      });
    }
    
    tx.addOperation(
        StellarSdk.Operation.pathPaymentStrictReceive({
          sendAsset: assetSend,
          sendMax: sendMaxAmt,
          destination: sourcePublicKey, // self-swap
          destAsset: assetDest,
          destAmount: destAmount,
          path: bestPath,
        })
      );
    const transaction =tx.setTimeout(60).build();
    // Sign & submit
    transaction.sign(sourceKeypair);
    const result = await server.submitTransaction(transaction);

    return {
      status: true,
      tx: result.hash,
    };
  } catch (err) {
    console.error('Transaction failed:', err);

    if (err.response?.data?.extras) {
      console.error('Result Codes:', err.response.data.extras.result_codes);
      console.error('Result XDR:', err.response.data.extras.result_xdr);
    }

    return {
      status: false,
      tx: '',
      error: err.message,
    };
  }
}

module.exports = { AMMSWAPTESTNET };
