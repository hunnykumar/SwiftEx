import * as StellarSdk from '@stellar/stellar-sdk';
import { STELLAR_URL } from '../../../../../constants';
const server = new StellarSdk.Horizon.Server(STELLAR_URL.URL);

async function AMMSWAPTESTNET(
  fromTokenCode,
  fromTokenIssuer,
  toTokenCode,
  toTokenIssuer,
  sourceSecret,
  destAmount
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
    })
      .addOperation(
        StellarSdk.Operation.pathPaymentStrictReceive({
          sendAsset: assetSend,
          sendMax: sendMaxAmt,
          destination: sourcePublicKey, // self-swap
          destAsset: assetDest,
          destAmount: destAmount,
          path: bestPath,
        })
      )
      .setTimeout(60)
      .build();

    // Sign & submit
    tx.sign(sourceKeypair);
    const result = await server.submitTransaction(tx);

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
