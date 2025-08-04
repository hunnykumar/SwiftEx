const bip39 = require('bip39');
const { mnemonicToSeedSync } = bip39;
const { HDKey } = require('@scure/bip32');
const { ethers } = require('ethers');
const { Keypair } = require('stellar-sdk');
const { Buffer } = require('buffer');

function deriveEthereumKeys(root) {
  const ethPath = `m/44'/60'/0'/0/0`;
  const ethNode = root.derive(ethPath);
  const privateKey = Buffer.from(ethNode.privateKey);
  const wallet = new ethers.Wallet(privateKey);
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    publicKey: wallet.publicKey,
  };
}

function deriveStellarKeys(root) {
  const stellarPath = `m/44'/148'/0'/0/0`;
  const stellarNode = root.derive(stellarPath);
  let privateKeyBytes = Buffer.from(stellarNode.privateKey);

  if (privateKeyBytes.length !== 32) {
    const padded = Buffer.alloc(32, 0);
    privateKeyBytes.copy(padded, 32 - privateKeyBytes.length);
    privateKeyBytes = padded;
  }

  const keypair = Keypair.fromRawEd25519Seed(privateKeyBytes);
  return {
    publicKey: keypair.publicKey(),
    secretKey: keypair.secret(),
  };
}

async function createWallet() {
  try {
    const mnemonic = bip39.generateMnemonic(128);
    const seed = mnemonicToSeedSync(mnemonic); // synchronous
    const root = HDKey.fromMasterSeed(seed);

    return {
      mnemonic,
      ethereum: deriveEthereumKeys(root),
      stellar: deriveStellarKeys(root),
    };
  } catch (e) {
    throw new Error(`Wallet creation failed: ${e.message}`);
  }
}

async function recoverMultiChainWallet(mnemonic) {
  try {
    const seed = mnemonicToSeedSync(mnemonic);
    const root = HDKey.fromMasterSeed(seed);

    return {
      mnemonic,
      ethereum: deriveEthereumKeys(root),
      stellar: deriveStellarKeys(root),
    };
  } catch (e) {
    throw new Error(`Wallet recovery failed: ${e.message}`);
  }
}

module.exports = {
  createWallet,
  recoverMultiChainWallet,
};
