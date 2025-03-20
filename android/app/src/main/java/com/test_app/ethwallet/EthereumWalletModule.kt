package com.test_app.ethwallet

import org.web3j.crypto.Credentials
import org.web3j.crypto.MnemonicUtils
import org.web3j.crypto.Bip32ECKeyPair
import org.web3j.utils.Numeric
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.Arguments
import java.security.SecureRandom
import java.math.BigInteger
import java.security.MessageDigest

class EthereumWalletModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String {
        return "EthereumWallet"
    }

    @ReactMethod
    fun createWallet(promise: Promise) {
        try {
            // Step 1: Generate entropy and mnemonic
            val entropy = ByteArray(16) // 128 bits entropy for 12-word mnemonic
            SecureRandom().nextBytes(entropy)
            val mnemonic = MnemonicUtils.generateMnemonic(entropy)
            val seed = MnemonicUtils.generateSeed(mnemonic, "")

            // Step 2: Create master key pair from seed
            val masterKeyPair = Bip32ECKeyPair.generateKeyPair(seed)

            // Step 3: Derive Ethereum key (m/44'/60'/0'/0/0)
            val ethPath = intArrayOf(
                44 or Bip32ECKeyPair.HARDENED_BIT,  
                60 or Bip32ECKeyPair.HARDENED_BIT,  
                0 or Bip32ECKeyPair.HARDENED_BIT,   
                0, 0
            )
            val ethKeyPair = Bip32ECKeyPair.deriveKeyPair(masterKeyPair, ethPath)
            val ethCredentials = Credentials.create(ethKeyPair)
            val ethAddress = ethCredentials.address
            val ethPrivateKey = Numeric.toHexStringWithPrefix(ethKeyPair.privateKey)
            val ethPublicKey = Numeric.toHexStringWithPrefix(ethKeyPair.publicKey)

            // Step 4: Derive DYDX key (m/44'/9004'/0'/0/0)
            val dydxPath = intArrayOf(
                44 or Bip32ECKeyPair.HARDENED_BIT,  
                9004 or Bip32ECKeyPair.HARDENED_BIT,  
                0 or Bip32ECKeyPair.HARDENED_BIT,   
                0, 0
            )
            val dydxKeyPair = Bip32ECKeyPair.deriveKeyPair(masterKeyPair, dydxPath)
            val dydxPrivateKey = Numeric.toHexStringWithPrefix(dydxKeyPair.privateKey)
            val dydxPublicKey = Numeric.toHexStringWithPrefix(dydxKeyPair.publicKey)

            // Step 5: Generate Stark Key & Address
            val starkPrivateKey = generateStarkPrivateKey(ethPrivateKey)
            val starkPublicKey = generateStarkPublicKey(starkPrivateKey)
            val starkAddress = generateStarkAddress(starkPublicKey)

            // Step 6: Prepare response
            val result = Arguments.createMap().apply {
                putString("mnemonic", mnemonic)
                
                putString("ethAddress", ethAddress)
                putString("ethPrivateKey", ethPrivateKey)
                putString("ethPublicKey", ethPublicKey)

                putString("dydxPrivateKey", dydxPrivateKey)
                putString("dydxPublicKey", dydxPublicKey)

                putString("starkPrivateKey", starkPrivateKey)
                putString("starkPublicKey", starkPublicKey)
                putString("starkAddress", starkAddress)
            }
            promise.resolve(result)
        } catch (e: Exception) {
            e.printStackTrace()
            promise.reject("WALLET_CREATION_ERROR", "Error creating wallet: ${e.message}", e)
        }
    }

    // Function to generate Stark Private Key from Ethereum private key
    private fun generateStarkPrivateKey(ethPrivateKey: String): String {
        val privateKeyBigInt = BigInteger(ethPrivateKey.substring(2), 16) // Convert HEX to BigInt
        val hashed = MessageDigest.getInstance("SHA-256").digest(privateKeyBigInt.toByteArray()) // SHA-256
        return Numeric.toHexStringWithPrefix(BigInteger(1, hashed)) // Convert to HEX
    }

    // Function to generate Stark Public Key from Stark Private Key
    private fun generateStarkPublicKey(starkPrivateKey: String): String {
        val hashed = MessageDigest.getInstance("SHA-256").digest(starkPrivateKey.toByteArray())
        return Numeric.toHexStringWithPrefix(BigInteger(1, hashed)) // Fake Stark Public Key (for demo)
    }

    // Function to generate Stark Address from Stark Public Key
    private fun generateStarkAddress(starkPublicKey: String): String {
        val hashed = MessageDigest.getInstance("SHA-256").digest(starkPublicKey.toByteArray())
        return Numeric.toHexStringWithPrefix(BigInteger(1, hashed).mod(BigInteger("2").pow(251))) // StarkEx Address
    }
}
