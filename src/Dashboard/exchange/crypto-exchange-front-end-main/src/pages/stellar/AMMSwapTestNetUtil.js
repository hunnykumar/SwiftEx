const StellarSdk = require('stellar-sdk');
const { STELLAR_URL } = require('../../../../../constants');
const server = new StellarSdk.Server(STELLAR_URL.URL);
StellarSdk.Network.useTestNetwork();

async function AMMSWAPTESTNET(sourceSecret,destAmount) {
    console.log("--",sourceSecret,destAmount)
  const usdcIssuer = "";

  if (!sourceSecret || !usdcIssuer) {
    return {
      status: false,
      tx: '',
      error: 'Missing environment variables',
    };
  }

  try {
    const sourceKeypair = StellarSdk.Keypair.fromSecret(sourceSecret);
    const sourcePublicKey = sourceKeypair.publicKey();
    const destinationPublicKey = sourcePublicKey;

    const usdc = new StellarSdk.Asset('USDC', usdcIssuer);

    const account = await server.loadAccount(sourcePublicKey);
    const pathsResult = await server
      .paths(sourcePublicKey, destinationPublicKey, usdc, destAmount)
      .call();

    if (pathsResult.records.length === 0) {
      throw new Error('No path found from XLM to USDC.');
    }

    const bestPath = pathsResult.records[0];

    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.TESTNET,
    })
      .addOperation(
        StellarSdk.Operation.pathPayment({
          sendAsset: StellarSdk.Asset.native(),
          sendMax: bestPath.source_amount,
          destination: destinationPublicKey,
          destAsset: usdc,
          destAmount: destAmount,
          path: bestPath.path,
        })
      )
      .setTimeout(60)
      .build();

    tx.sign(sourceKeypair);
    const result = await server.submitTransaction(tx);

    return {
      status: true,
      tx: result.hash,
    };
  } catch (err) {
    console.error('Something went wrong submitting the transaction.');
  
    if (err.response && err.response.data && err.response.data.extras) {
      console.error('Result Codes:', err.response.data.extras.result_codes);
      console.error('Result XDR:', err.response.data.extras.result_xdr);
    } else {
      console.error(err);
    }
    return {
      status: false,
      tx: '',
    };
  }
}

module.exports = { AMMSWAPTESTNET };
