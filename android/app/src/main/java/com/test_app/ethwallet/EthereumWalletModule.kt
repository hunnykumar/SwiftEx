package com.app.swiftEx.app.ethwallet
import org.web3j.crypto.Credentials;
import org.web3j.crypto.MnemonicUtils;
import org.web3j.crypto.Bip32ECKeyPair;
import org.web3j.utils.Numeric;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.Arguments;
import java.security.SecureRandom;

class EthereumWalletModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String {
        return "EthereumWallet"
    }
    
    @ReactMethod
    fun createWallet(promise: Promise) {
        try {
            // Generate entropy for mnemonic
            val entropy = ByteArray(16) // 128 bits = 12 words
            SecureRandom().nextBytes(entropy)
            
            // Generate mnemonic phrase
            val mnemonic = MnemonicUtils.generateMnemonic(entropy)
            
            // Generate seed from mnemonic (with empty passphrase)
            val seed = MnemonicUtils.generateSeed(mnemonic, "")
            
            // Create master key pair from seed
            val masterKeyPair = Bip32ECKeyPair.generateKeyPair(seed)
            
            // Derive the key using BIP-44 path for Ethereum: m/44'/60'/0'/0/0
            val path = intArrayOf(
                44 or Bip32ECKeyPair.HARDENED_BIT,  // purpose: BIP-44
                60 or Bip32ECKeyPair.HARDENED_BIT,  // coin_type: Ethereum
                0 or Bip32ECKeyPair.HARDENED_BIT,   // account
                0,                                  // change
                0                                   // address_index
            )
            val childKeyPair = Bip32ECKeyPair.deriveKeyPair(masterKeyPair, path)
            
            // Create credentials from the derived key pair
            val credentials = Credentials.create(childKeyPair)
            
            // Get address, private key, and public key
            val address = credentials.address
            val privateKeyHex = Numeric.toHexStringWithPrefix(childKeyPair.privateKey)
            val publicKeyHex = Numeric.toHexStringWithPrefix(childKeyPair.publicKey)
            
            // Create response
            val result = Arguments.createMap().apply {
                putString("address", address)
                putString("privateKey", privateKeyHex)
                putString("publicKey", publicKeyHex)
                putString("mnemonic", mnemonic)
            }
            promise.resolve(result)
        } catch (e: Exception) {
            e.printStackTrace()
            promise.reject("WALLET_CREATION_ERROR", "Error creating wallet: ${e.message}", e)
        }
    }
}