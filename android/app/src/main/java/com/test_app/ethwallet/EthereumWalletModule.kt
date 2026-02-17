package org.app.swiftEx.wallet.ethwallet
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
import org.stellar.sdk.KeyPair;
import com.facebook.react.bridge.WritableMap

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

            // stellar wallet
            // Derive the key using BIP-44 path for Stellar: m/44'/148'/0'/0/0
            val stellarPath = intArrayOf(
                44 or Bip32ECKeyPair.HARDENED_BIT,  // purpose: BIP-44
                148 or Bip32ECKeyPair.HARDENED_BIT, // coin_type: Stellar
                0 or Bip32ECKeyPair.HARDENED_BIT,   // account
                0,  // change
                0   // address_index
            )
            val stellarChildKeyPair = Bip32ECKeyPair.deriveKeyPair(masterKeyPair, stellarPath)

            // Create Stellar KeyPair from the derived private key
            val stellarPrivateKeyBytes = stellarChildKeyPair.privateKey.toByteArray()

            // Ensure the private key is exactly 32 bytes for Stellar
            val stellarPrivateKey32 = ByteArray(32)
            if (stellarPrivateKeyBytes.size >= 32) {
                System.arraycopy(stellarPrivateKeyBytes, stellarPrivateKeyBytes.size - 32, stellarPrivateKey32, 0, 32)
            } else {
                System.arraycopy(stellarPrivateKeyBytes, 0, stellarPrivateKey32, 32 - stellarPrivateKeyBytes.size, stellarPrivateKeyBytes.size)
            }

            val stellarKeyPair = KeyPair.fromSecretSeed(stellarPrivateKey32)

            // Get Stellar public and secret keys
            val stellarPublicKey = stellarKeyPair.accountId
            val stellarSecretKey = String(stellarKeyPair.secretSeed)

            // Create response with both Ethereum and Stellar keys
            val result = Arguments.createMap().apply {
                putString("mnemonic", mnemonic)

                // Ethereum keys
                val ethKeys = Arguments.createMap().apply {
                    putString("address", address)
                    putString("privateKey", privateKeyHex)
                    putString("publicKey", publicKeyHex)
                }
                putMap("ethereum", ethKeys)

                // Stellar keys
                val stellarKeys = Arguments.createMap().apply {
                    putString("publicKey", stellarPublicKey)
                    putString("secretKey", stellarSecretKey)
                }
                putMap("stellar", stellarKeys)
            }

            promise.resolve(result)
//            // Create response
//            val result = Arguments.createMap().apply {
//                putString("address", address)
//                putString("privateKey", privateKeyHex)
//                putString("publicKey", publicKeyHex)
//                putString("mnemonic", mnemonic)
//            }
//            promise.resolve(result)
        } catch (e: Exception) {
            e.printStackTrace()
            promise.reject("WALLET_CREATION_ERROR", "Error creating wallet: ${e.message}", e)
        }
    }

    @ReactMethod
    fun recoverMultiChainWallet(mnemonic: String, promise: Promise) {
        try {
            // Generate seed from mnemonic (with empty passphrase)
            val seed = MnemonicUtils.generateSeed(mnemonic, "")

            // Create master key pair from seed
            val masterKeyPair = Bip32ECKeyPair.generateKeyPair(seed)

            // === ETHEREUM WALLET ===
            val ethPath = intArrayOf(
                44 or Bip32ECKeyPair.HARDENED_BIT, // purpose: BIP-44
                60 or Bip32ECKeyPair.HARDENED_BIT, // coin_type: Ethereum
                0 or Bip32ECKeyPair.HARDENED_BIT,  // account
                0,  // change
                0   // address_index
            )
            val ethChildKeyPair = Bip32ECKeyPair.deriveKeyPair(masterKeyPair, ethPath)
            val ethCredentials = Credentials.create(ethChildKeyPair)

            val ethAddress = ethCredentials.address
            val ethPrivateKeyHex = Numeric.toHexStringWithPrefix(ethChildKeyPair.privateKey)
            val ethPublicKeyHex = Numeric.toHexStringWithPrefix(ethChildKeyPair.publicKey)

            // === STELLAR WALLET ===
            val stellarPath = intArrayOf(
                44 or Bip32ECKeyPair.HARDENED_BIT,  // purpose: BIP-44
                148 or Bip32ECKeyPair.HARDENED_BIT, // coin_type: Stellar
                0 or Bip32ECKeyPair.HARDENED_BIT,   // account
                0,  // change
                0   // address_index
            )
            val stellarChildKeyPair = Bip32ECKeyPair.deriveKeyPair(masterKeyPair, stellarPath)

            val stellarPrivateKeyBytes = stellarChildKeyPair.privateKey.toByteArray()
            val stellarPrivateKey32 = ByteArray(32)
            if (stellarPrivateKeyBytes.size >= 32) {
                System.arraycopy(stellarPrivateKeyBytes, stellarPrivateKeyBytes.size - 32, stellarPrivateKey32, 0, 32)
            } else {
                System.arraycopy(stellarPrivateKeyBytes, 0, stellarPrivateKey32, 32 - stellarPrivateKeyBytes.size, stellarPrivateKeyBytes.size)
            }

            val stellarKeyPair = KeyPair.fromSecretSeed(stellarPrivateKey32)
            val stellarPublicKey = stellarKeyPair.accountId
            val stellarSecretKey = String(stellarKeyPair.secretSeed)

            // Create response with both wallets
            val result = Arguments.createMap().apply {
                putString("mnemonic", mnemonic)
                
                // Ethereum keys
                val ethKeys = Arguments.createMap().apply {
                    putString("address", ethAddress)
                    putString("privateKey", ethPrivateKeyHex)
                    putString("publicKey", ethPublicKeyHex)
                }
                putMap("ethereum", ethKeys)
                
                // Stellar keys
                val stellarKeys = Arguments.createMap().apply {
                    putString("publicKey", stellarPublicKey)
                    putString("secretKey", stellarSecretKey)
                }
                putMap("stellar", stellarKeys)
            }

            promise.resolve(result)
        } catch (e: Exception) {
            e.printStackTrace()
            promise.reject("WALLET_RESTORE_ERROR", "Error restoring wallet: ${e.message}", e)
        }
    }

    @ReactMethod
    fun importEthPrivateKey(privateKey: String, promise: Promise) {
        try {
            val result = importEthereumPrivateKey(privateKey)
            promise.resolve(result)
        } catch (e: Exception) {
            e.printStackTrace()
            promise.reject("IMPORT_ERROR", e.message ?: "Error importing Ethereum private key", e)
        }
    }

    @ReactMethod
    fun importStellarPrivateKey(secretKey: String, promise: Promise) {
        try {
            val result = importStellarPrivateKeyInternal(secretKey)
            promise.resolve(result)
        } catch (e: Exception) {
            e.printStackTrace()
            promise.reject("IMPORT_ERROR", e.message ?: "Error importing Stellar private key", e)
        }
    }

    private fun importEthereumPrivateKey(privateKeyHex: String): WritableMap {
        // Remove "0x" prefix if present
        val cleanKey = privateKeyHex.removePrefix("0x")

        // Validate private key length
        if (cleanKey.length != 64) {
            throw IllegalArgumentException("Invalid private key length")
        }

        // Convert hex string to BigInteger
        val privateKeyBigInt = Numeric.toBigInt(cleanKey)

        // Create Ethereum credentials from private key
        val credentials = Credentials.create(privateKeyBigInt.toString(16))
        val ethAddress = credentials.address

        // Generate fresh Stellar wallet
        val stellarWallet = generateFreshStellarWallet()

        // Create response
        val result = Arguments.createMap()

        val originalMap = Arguments.createMap().apply {
            putString("type", "ethereum")
            putString("privateKey", privateKeyHex)
            putString("address", ethAddress)
        }

        val generatedMap = Arguments.createMap().apply {
            putString("type", "stellar")
            putString("publicKey", stellarWallet["publicKey"])
            putString("secretKey", stellarWallet["secretKey"])
        }

        result.putMap("original", originalMap)
        result.putMap("generated", generatedMap)

        return result
    }

    private fun importStellarPrivateKeyInternal(secretKey: String): WritableMap {
        // Create Stellar KeyPair from secret key
        val keyPair = KeyPair.fromSecretSeed(secretKey)
        val stellarAddress = keyPair.accountId

        // Generate fresh Ethereum wallet
        val ethereumWallet = generateFreshEthereumWallet()

        // Create response
        val result = Arguments.createMap()

        val originalMap = Arguments.createMap().apply {
            putString("type", "stellar")
            putString("secretKey", secretKey)
            putString("publicKey", stellarAddress)
        }

        val generatedMap = Arguments.createMap().apply {
            putString("type", "ethereum")
            putString("privateKey", ethereumWallet["privateKey"])
            putString("address", ethereumWallet["address"])
        }

        result.putMap("original", originalMap)
        result.putMap("generated", generatedMap)

        return result
    }

    private fun generateFreshStellarWallet(): Map<String, String> {
        // Generate new mnemonic
        val entropy = ByteArray(16)
        SecureRandom().nextBytes(entropy)
        val mnemonic = MnemonicUtils.generateMnemonic(entropy)

        // Generate Stellar wallet from mnemonic
        val seed = MnemonicUtils.generateSeed(mnemonic, "")
        val masterKeyPair = Bip32ECKeyPair.generateKeyPair(seed)

        val stellarPath = intArrayOf(
            44 or Bip32ECKeyPair.HARDENED_BIT,
            148 or Bip32ECKeyPair.HARDENED_BIT,
            0 or Bip32ECKeyPair.HARDENED_BIT,
            0,
            0
        )
        val stellarChildKeyPair = Bip32ECKeyPair.deriveKeyPair(masterKeyPair, stellarPath)

        val stellarPrivateKeyBytes = stellarChildKeyPair.privateKey.toByteArray()
        val stellarPrivateKey32 = ByteArray(32)
        if (stellarPrivateKeyBytes.size >= 32) {
            System.arraycopy(stellarPrivateKeyBytes, stellarPrivateKeyBytes.size - 32, stellarPrivateKey32, 0, 32)
        } else {
            System.arraycopy(stellarPrivateKeyBytes, 0, stellarPrivateKey32, 32 - stellarPrivateKeyBytes.size, stellarPrivateKeyBytes.size)
        }

        val stellarKeyPair = KeyPair.fromSecretSeed(stellarPrivateKey32)

        return mapOf(
            "publicKey" to stellarKeyPair.accountId,
            "secretKey" to String(stellarKeyPair.secretSeed),
            "mnemonic" to mnemonic
        )
    }

    private fun generateFreshEthereumWallet(): Map<String, String> {
        // Generate new mnemonic
        val entropy = ByteArray(16)
        SecureRandom().nextBytes(entropy)
        val mnemonic = MnemonicUtils.generateMnemonic(entropy)

        // Generate Ethereum wallet from mnemonic
        val seed = MnemonicUtils.generateSeed(mnemonic, "")
        val masterKeyPair = Bip32ECKeyPair.generateKeyPair(seed)

        val ethPath = intArrayOf(
            44 or Bip32ECKeyPair.HARDENED_BIT,
            60 or Bip32ECKeyPair.HARDENED_BIT,
            0 or Bip32ECKeyPair.HARDENED_BIT,
            0,
            0
        )
        val ethChildKeyPair = Bip32ECKeyPair.deriveKeyPair(masterKeyPair, ethPath)
        val ethCredentials = Credentials.create(ethChildKeyPair)

        return mapOf(
            "address" to ethCredentials.address,
            "privateKey" to Numeric.toHexStringWithPrefix(ethChildKeyPair.privateKey),
            "publicKey" to Numeric.toHexStringWithPrefix(ethChildKeyPair.publicKey),
            "mnemonic" to mnemonic
        )
    }
}