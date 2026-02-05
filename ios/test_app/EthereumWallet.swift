import Foundation
import React
import WalletCore

@objc(EthereumWallet)
class EthereumWallet: NSObject {
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    @objc
    func createWallet(_ resolve: @escaping RCTPromiseResolveBlock,
                     rejecter reject: @escaping RCTPromiseRejectBlock) {
        
        DispatchQueue.global(qos: .userInitiated).async {
            do {
                let result = try self.generateWallet()
                
                DispatchQueue.main.async {
                    resolve(result)
                }
                
            } catch {
                DispatchQueue.main.async {
                    reject("WALLET_ERROR", error.localizedDescription, error)
                }
            }
        }
    }
    
    @objc
    func recoverWallet(_ mnemonic: String,
                      passphrase: String = "",
                      resolver resolve: @escaping RCTPromiseResolveBlock,
                      rejecter reject: @escaping RCTPromiseRejectBlock) {
        
        DispatchQueue.global(qos: .userInitiated).async {
            do {
                let result = try self.restoreWallet(
                    mnemonic: mnemonic,
                    passphrase: passphrase
                )
                
                DispatchQueue.main.async {
                    resolve(result)
                }
                
            } catch {
                DispatchQueue.main.async {
                    reject("RECOVERY_ERROR", error.localizedDescription, error)
                }
            }
        }
    }
    
    @objc
    func validateMnemonic(_ mnemonic: String,
                         resolver resolve: @escaping RCTPromiseResolveBlock,
                         rejecter reject: @escaping RCTPromiseRejectBlock) {
        
        let isValid = Mnemonic.isValid(mnemonic: mnemonic)
        let wordCount = mnemonic.split(separator: " ").count
        
        resolve([
            "valid": isValid,
            "wordCount": wordCount
        ])
    }
    
    
    private func generateWallet(passphrase: String = "") throws -> [String: Any] {
        guard let wallet = HDWallet(strength: 128, passphrase: passphrase) else {
            throw WalletError.generationFailed
        }
        
        let mnemonic = wallet.mnemonic
        let ethereumWallet = try self.deriveEthereum(from: wallet)
        let stellarWallet = try self.deriveStellar(from: wallet)
        
        return [
            "mnemonic": mnemonic,
            "ethereum": [
                "address": ethereumWallet.address,
                "privateKey": ethereumWallet.privateKey
            ],
            "stellar": [
                "publicKey": stellarWallet.publicKey,
                "secretKey": stellarWallet.secretKey
            ]
        ]
    }
    
    private func restoreWallet(mnemonic: String, passphrase: String = "") throws -> [String: Any] {
        guard Mnemonic.isValid(mnemonic: mnemonic) else {
            throw WalletError.invalidMnemonic
        }
        
        guard let wallet = HDWallet(mnemonic: mnemonic, passphrase: passphrase) else {
            throw WalletError.invalidMnemonic
        }
        
        let ethereumWallet = try self.deriveEthereum(from: wallet)
        let stellarWallet = try self.deriveStellar(from: wallet)
        
        return [
            "ethereum": [
                "address": ethereumWallet.address,
                "privateKey": ethereumWallet.privateKey
            ],
            "stellar": [
                "publicKey": stellarWallet.publicKey,
                "secretKey": stellarWallet.secretKey
            ]
        ]
    }
    
    
    private func deriveEthereum(from wallet: HDWallet) throws -> (address: String, privateKey: String) {
        let privateKey = wallet.getKey(coin: .ethereum, derivationPath: "m/44'/60'/0'/0/0")
        let publicKey = privateKey.getPublicKeySecp256k1(compressed: false)
        let address = CoinType.ethereum.deriveAddressFromPublicKey(publicKey: publicKey)
        let privateKeyHex = privateKey.data.hexString
        
        return (address: address, privateKey: privateKeyHex)
    }
    
    
    private func deriveStellar(from wallet: HDWallet) throws -> (publicKey: String, secretKey: String) {
        let privateKey = wallet.getKey(coin: .stellar, derivationPath: "m/44'/148'/0'")
        
        let publicKey = privateKey.getPublicKeyEd25519()
        
        let stellarAddress = CoinType.stellar.deriveAddressFromPublicKey(publicKey: publicKey)
        
        let secretKeyData = Data(privateKey.data.prefix(32))
        let secretSeed = self.encodeStellarSecretSeed(secretKeyData)
        
        return (
            publicKey: stellarAddress,
            secretKey: secretSeed
        )
    }
    
    
    private func encodeStellarSecretSeed(_ data: Data) -> String {
        let versionByte: UInt8 = 18 << 3
        var payload = Data([versionByte])
        payload.append(data)
        
        let checksum = self.crc16XModem(payload)
        payload.append(checksum)
        
        return self.base32Encode(payload)
    }
    
    private func crc16XModem(_ data: Data) -> Data {
        var crc: UInt16 = 0x0000
        
        for byte in data {
            crc ^= UInt16(byte) << 8
            
            for _ in 0..<8 {
                if (crc & 0x8000) != 0 {
                    crc = (crc << 1) ^ 0x1021
                } else {
                    crc = crc << 1
                }
            }
        }
        
        return withUnsafeBytes(of: crc.bigEndian) { Data($0) }
    }
    
    private func base32Encode(_ data: Data) -> String {
        let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
        var result = ""
        var buffer: UInt32 = 0
        var bufferLength = 0
        
        for byte in data {
            buffer = (buffer << 8) | UInt32(byte)
            bufferLength += 8
            
            while bufferLength >= 5 {
                bufferLength -= 5
                let index = Int((buffer >> bufferLength) & 0x1F)
                result.append(alphabet[alphabet.index(alphabet.startIndex, offsetBy: index)])
            }
        }
        
        if bufferLength > 0 {
            buffer <<= (5 - bufferLength)
            let index = Int(buffer & 0x1F)
            result.append(alphabet[alphabet.index(alphabet.startIndex, offsetBy: index)])
        }
        
        return "S" + result
    }
}

enum WalletError: Error, LocalizedError {
    case generationFailed
    case invalidMnemonic
    case derivationFailed
    
    var errorDescription: String? {
        switch self {
        case .generationFailed:
            return "Failed to generate wallet"
        case .invalidMnemonic:
            return "Invalid mnemonic phrase"
        case .derivationFailed:
            return "Failed to derive wallet keys"
        }
    }
}

extension Data {
    var hexString: String {
        return "0x" + map { String(format: "%02x", $0) }.joined()
    }
}
