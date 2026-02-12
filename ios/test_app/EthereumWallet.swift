import Foundation
import React
import WalletCore
import stellarsdk

extension String {
    var hexData: Data? {
        let hex = String(self).replacingOccurrences(of: "0x", with: "")
        var data = Data(capacity: hex.count / 2)
        
        for i in stride(from: 0, to: hex.count, by: 2) {
            let startIndex = hex.index(hex.startIndex, offsetBy: i)
            let endIndex = hex.index(startIndex, offsetBy: 2, limitedBy: hex.endIndex) ?? hex.endIndex
            
            let byteString = String(hex[startIndex..<endIndex])
            guard let byte = UInt8(byteString, radix: 16) else {
                return nil
            }
            data.append(byte)
        }
        return data.isEmpty ? nil : data
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
              let index = Int((buffer >> UInt32(bufferLength)) & 0x1F)
          }
      }
      
      if bufferLength > 0 {
          let padding = 5 - bufferLength
          buffer <<= UInt32(padding)
          let index = Int(buffer & 0x1F)
      }
      
      return "S" + result
  }
}



extension Data {
    static func randomBytes(length: Int) -> Data {
        var bytes = Data(repeating: 0, count: length)
        let status = bytes.withUnsafeMutableBytes {
            SecRandomCopyBytes(kSecRandomDefault, length, $0.baseAddress!)
        }
        return status == errSecSuccess ? bytes : Data(repeating: 0, count: length)
    }
    
    var hexString: String {
        return "0x" + map { String(format: "%02x", $0) }.joined()
    }
}

enum WalletError: Error, LocalizedError {
    case generationFailed
    case invalidMnemonic
    case derivationFailed
    case invalidPrivateKey
    
    var errorDescription: String? {
        switch self {
        case .generationFailed: return "Failed to generate wallet"
        case .invalidMnemonic: return "Invalid mnemonic phrase"
        case .derivationFailed: return "Failed to derive wallet keys"
        case .invalidPrivateKey: return "Invalid private key format"
        }
    }
}

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
    
    @objc func importEthPrivateKey(_ privateKey: String,
                         resolver resolve: @escaping RCTPromiseResolveBlock,
                         rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.global(qos: .userInitiated).async {
            do {
                let result = try self.importEthereumPrivateKey(privateKey)
                DispatchQueue.main.async { resolve(result) }
            } catch {
                DispatchQueue.main.async { reject("IMPORT_ERROR", error.localizedDescription, error) }
            }
        }
    }
    
    @objc func importStellarPrivateKey(_ secretKey: String,
                         resolver resolve: @escaping RCTPromiseResolveBlock,
                         rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.global(qos: .userInitiated).async {
            do {
                let result = try self.importStellarPrivateKey(secretKey)
                DispatchQueue.main.async { resolve(result) }
            } catch {
                DispatchQueue.main.async { reject("IMPORT_ERROR", error.localizedDescription, error) }
            }
        }
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
        guard Mnemonic.isValid(mnemonic: mnemonic),
              let wallet = HDWallet(mnemonic: mnemonic, passphrase: passphrase) else {
            throw WalletError.invalidMnemonic
        }
        let ethereumWallet = try deriveEthereum(from: wallet)
        let stellarWallet = try deriveStellar(from: wallet)
        
        return [
            "ethereum": ["address": ethereumWallet.address, "privateKey": ethereumWallet.privateKey],
            "stellar": ["publicKey": stellarWallet.publicKey, "secretKey": stellarWallet.secretKey]
        ]
    }
    
    private func importEthereumPrivateKey(_ privateKeyHex: String) throws -> [String: Any] {
        let cleanKey = privateKeyHex.hasPrefix("0x") ? String(privateKeyHex.dropFirst(2)) : privateKeyHex
        guard cleanKey.count == 64, let privateKeyData = cleanKey.hexData else {
            throw WalletError.invalidPrivateKey
        }
        
        let privateKey = PrivateKey(data: privateKeyData)!
        let ethAddress = CoinType.ethereum.deriveAddress(privateKey: privateKey)
        let stellarWallet = try generateFreshStellarWallet()
        
        return [
            "original": ["type": "ethereum", "privateKey": privateKeyHex, "address": ethAddress],
            "generated": ["type": "stellar", "publicKey": stellarWallet.publicKey, "secretKey": stellarWallet.secretKey]
        ]
    }
    
    private func importStellarPrivateKey(_ secretKey: String) throws -> [String: Any] {
        let keyPair = try KeyPair(secretSeed: secretKey)
        let stellarAddress = keyPair.accountId
        let ethereumWallet = try generateFreshEthereumWallet()
        
        return [
            "original": ["type": "stellar", "secretKey": secretKey, "publicKey": stellarAddress],
            "generated": ["type": "ethereum", "privateKey": ethereumWallet.privateKey, "address": ethereumWallet.address]
        ]
    }

    private func generateFreshStellarWallet() throws -> (publicKey: String, secretKey: String) {
        let keyPair = try KeyPair.generateRandomKeyPair()
        
        guard let secretSeed = keyPair.secretSeed else {
            throw WalletError.generationFailed
        }
        
        return (publicKey: keyPair.accountId, secretKey: secretSeed)
    }

        
        private func generateFreshEthereumWallet() throws -> (address: String, privateKey: String) {
            let privateKeyData = Data.randomBytes(length: 32)
            let privateKey = PrivateKey(data: privateKeyData)!
            let address = CoinType.ethereum.deriveAddress(privateKey: privateKey)
            return (address: address, privateKey: privateKeyData.hexString)
        }
        
    private func decodeStellarSecretSeed(_ secretKey: String) throws -> Data {
        guard secretKey.hasPrefix("S") else { throw WalletError.invalidPrivateKey }
        let base32String = String(secretKey.dropFirst())
        guard let payloadData = base32String.base32DecodedData,
                payloadData.count >= 34 else {
            throw WalletError.invalidPrivateKey
        }
        
        let versionByte = payloadData[0]
        guard versionByte == (18 << 3) else { throw WalletError.invalidPrivateKey }
        
        let checksum = payloadData.suffix(2)
        let payload = payloadData.dropFirst().dropLast(2)
        let computedChecksum = crc16XModem(payload)
        
        guard checksum == computedChecksum else { throw WalletError.invalidPrivateKey }
        return Data(payload)
    }

    
    private func deriveEthereum(from wallet: HDWallet) throws -> (address: String, privateKey: String) {
        let privateKey = wallet.getKey(coin: .ethereum, derivationPath: "m/44'/60'/0'/0/0")
        let publicKey = privateKey.getPublicKeySecp256k1(compressed: false)
        let address = CoinType.ethereum.deriveAddressFromPublicKey(publicKey: publicKey)
        return (address: address, privateKey: privateKey.data.hexString)
    }
    
  private func deriveStellar(from wallet: HDWallet) throws -> (publicKey: String, secretKey: String) {
      let privateKey = wallet.getKey(coin: .stellar, derivationPath: "m/44'/148'/0'")
      
      let seed = privateKey.data.prefix(32)
      
      let keyPair = try KeyPair(seed: Seed(bytes: [UInt8](seed)))
      
      guard let secretSeed = keyPair.secretSeed else {
          throw WalletError.derivationFailed
      }
      
      return (publicKey: keyPair.accountId, secretKey: secretSeed)
  }
    
    private func encodeStellarSecretSeed(_ data: Data) -> String {
        let versionByte: UInt8 = 18 << 3
        var payload = Data([versionByte])
        payload.append(data)
        let checksum = crc16XModem(payload)
        payload.append(checksum)
        return base32Encode(payload)
    }
    
    private func crc16XModem(_ data: Data) -> Data {
        var crc: UInt16 = 0x0000
        for byte in data {
            crc ^= UInt16(byte) << 8
            for _ in 0..<8 {
                if crc & 0x8000 != 0 {
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
                let index = Int((buffer >> UInt32(bufferLength)) & 0x1F)
                result.append(String(alphabet[alphabet.index(alphabet.startIndex, offsetBy: index)]))
            }
        }
        
        if bufferLength > 0 {
            let padding = 5 - bufferLength
            buffer <<= UInt32(padding)
            let index = Int(buffer & 0x1F)
            result.append(String(alphabet[alphabet.index(alphabet.startIndex, offsetBy: index)]))
        }
        return "S" + result
    }
}

