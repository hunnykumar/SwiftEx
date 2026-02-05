import Foundation
import React
import Security

@objc(StorageModule)
class StorageModule: NSObject {
    
    private let serviceName = "com.appSwiftEx.appStorage"
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    @objc
    func save(_ key: String,
              value: String,
              resolver resolve: @escaping RCTPromiseResolveBlock,
              rejecter reject: @escaping RCTPromiseRejectBlock) {
        
        DispatchQueue.global(qos: .userInitiated).async {
            do {
                try self.saveToKeychain(key: key, value: value)
                
                DispatchQueue.main.async {
                    resolve([
                        "success": true,
                        "key": key
                    ])
                }
            } catch {
                DispatchQueue.main.async {
                    reject("SAVE_ERROR", error.localizedDescription, error)
                }
            }
        }
    }
  
    @objc
    func updateExisting(_ key: String,
                       value: String,
                       resolver resolve: @escaping RCTPromiseResolveBlock,
                       rejecter reject: @escaping RCTPromiseRejectBlock) {

        DispatchQueue.global(qos: .userInitiated).async {
            do {
                try self.saveToKeychain(key: key, value: value)

                DispatchQueue.main.async {
                    resolve([
                        "success": true,
                        "mode": "replace",
                        "key": key
                    ])
                }
            } catch {
                DispatchQueue.main.async {
                    reject("UPDATE_EXISTING_ERROR", error.localizedDescription, error)
                }
            }
        }
    }

    @objc
    func mergeInExisting(_ key: String,
                     value: String,
                     resolver resolve: @escaping RCTPromiseResolveBlock,
                     rejecter reject: @escaping RCTPromiseRejectBlock) {

        DispatchQueue.global(qos: .userInitiated).async {
            do {
                let existingValue = try self.getFromKeychain(key: key)

                var existingJson: [String: Any] = [:]

                if let existingValue = existingValue,
                   let data = existingValue.data(using: .utf8),
                   let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
                    existingJson = json
                }

                guard let newData = value.data(using: .utf8),
                      let newJson = try JSONSerialization.jsonObject(with: newData) as? [String: Any] else {
                    throw SecureStorageError.decodingError
                }

                for (k, v) in newJson {
                    existingJson[k] = v
                }

                let mergedData = try JSONSerialization.data(withJSONObject: existingJson)
                guard let mergedString = String(data: mergedData, encoding: .utf8) else {
                    throw SecureStorageError.encodingError
                }

                try self.saveToKeychain(key: key, value: mergedString)

                DispatchQueue.main.async {
                    resolve([
                        "success": true,
                        "mode": "merge",
                        "key": key,
                        "updatedKeys": Array(newJson.keys)
                    ])
                }

            } catch {
                DispatchQueue.main.async {
                    reject("MERGE_EXISTING_ERROR", error.localizedDescription, error)
                }
            }
        }
    }

    @objc
    func get(_ key: String,
             resolver resolve: @escaping RCTPromiseResolveBlock,
             rejecter reject: @escaping RCTPromiseRejectBlock) {
        
        DispatchQueue.global(qos: .userInitiated).async {
            do {
                let value = try self.getFromKeychain(key: key)
                
                DispatchQueue.main.async {
                    if let value = value {
                        resolve([
                            "success": true,
                            "key": key,
                            "value": value
                        ])
                    } else {
                        resolve([
                            "success": false,
                            "key": key,
                            "value": NSNull()
                        ])
                    }
                }
            } catch {
                DispatchQueue.main.async {
                    reject("GET_ERROR", error.localizedDescription, error)
                }
            }
        }
    }
  
  @objc
  func getWalletAddress(_ resolver: @escaping RCTPromiseResolveBlock,
                 rejecter reject: @escaping RCTPromiseRejectBlock) {

      DispatchQueue.global(qos: .userInitiated).async {
          do {
              guard let walletString = try self.getFromKeychain(key: "activeUserWallet") else {
                  DispatchQueue.main.async {
                      resolver([
                          "success": false,
                          "wallet": NSNull()
                      ])
                  }
                  return
              }

              guard let data = walletString.data(using: .utf8),
                    let walletJson = try JSONSerialization.jsonObject(
                      with: data,
                      options: []
                    ) as? [String: Any] else {
                  throw SecureStorageError.decodingError
              }

              let response: [String: Any] = [
                  "address": walletJson["address"] ?? NSNull(),
                  "stellarPublicKey": walletJson["stellarPublicKey"] ?? NSNull(),
                  "name": walletJson["name"] ?? NSNull()
              ]

              DispatchQueue.main.async {
                  resolver([
                      "success": true,
                      "wallet": response
                  ])
              }

          } catch {
              DispatchQueue.main.async {
                  reject("GET_WALLET_ERROR", error.localizedDescription, error)
              }
          }
      }
  }


    @objc
    func delete(_ key: String,
                resolver resolve: @escaping RCTPromiseResolveBlock,
                rejecter reject: @escaping RCTPromiseRejectBlock) {
        
        DispatchQueue.global(qos: .userInitiated).async {
            do {
                try self.deleteFromKeychain(key: key)
                
                DispatchQueue.main.async {
                    resolve([
                        "success": true,
                        "key": key
                    ])
                }
            } catch {
                DispatchQueue.main.async {
                    reject("DELETE_ERROR", error.localizedDescription, error)
                }
            }
        }
    }
    
    @objc
    func exists(_ key: String,
                resolver resolve: @escaping RCTPromiseResolveBlock,
                rejecter reject: @escaping RCTPromiseRejectBlock) {
        
        DispatchQueue.global(qos: .userInitiated).async {
            do {
                let value = try self.getFromKeychain(key: key)
                
                DispatchQueue.main.async {
                    resolve([
                        "exists": value != nil,
                        "key": key
                    ])
                }
            } catch {
                DispatchQueue.main.async {
                    reject("EXISTS_ERROR", error.localizedDescription, error)
                }
            }
        }
    }
    
    @objc
    func getAllKeys(_ resolve: @escaping RCTPromiseResolveBlock,
                    rejecter reject: @escaping RCTPromiseRejectBlock) {
        
        DispatchQueue.global(qos: .userInitiated).async {
            do {
                let keys = try self.getAllKeysFromKeychain()
                
                DispatchQueue.main.async {
                    resolve([
                        "success": true,
                        "keys": keys
                    ])
                }
            } catch {
                DispatchQueue.main.async {
                    reject("GET_ALL_KEYS_ERROR", error.localizedDescription, error)
                }
            }
        }
    }
    
    @objc
    func clearAll(_ resolve: @escaping RCTPromiseResolveBlock,
                  rejecter reject: @escaping RCTPromiseRejectBlock) {
        
        DispatchQueue.global(qos: .userInitiated).async {
            do {
                try self.clearAllFromKeychain()
                
                DispatchQueue.main.async {
                    resolve([
                        "success": true
                    ])
                }
            } catch {
                DispatchQueue.main.async {
                    reject("CLEAR_ALL_ERROR", error.localizedDescription, error)
                }
            }
        }
    }
    
    @objc
    func saveMultiple(_ items: NSDictionary,
                      resolver resolve: @escaping RCTPromiseResolveBlock,
                      rejecter reject: @escaping RCTPromiseRejectBlock) {
        
        DispatchQueue.global(qos: .userInitiated).async {
            do {
                var savedKeys: [String] = []
                
                for (key, value) in items {
                    if let key = key as? String, let value = value as? String {
                        try self.saveToKeychain(key: key, value: value)
                        savedKeys.append(key)
                    }
                }
                
                DispatchQueue.main.async {
                    resolve([
                        "success": true,
                        "savedKeys": savedKeys,
                        "count": savedKeys.count
                    ])
                }
            } catch {
                DispatchQueue.main.async {
                    reject("SAVE_MULTIPLE_ERROR", error.localizedDescription, error)
                }
            }
        }
    }
    
    private func saveToKeychain(key: String, value: String) throws {
        guard let data = value.data(using: .utf8) else {
            throw SecureStorageError.encodingError
        }
        
        try? deleteFromKeychain(key: key)
        
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecAttrService as String: serviceName,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly
        ]
        
        let status = SecItemAdd(query as CFDictionary, nil)
        
        guard status == errSecSuccess else {
            throw SecureStorageError.keychainError(status: status)
        }
    }
    
    private func getFromKeychain(key: String) throws -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecAttrService as String: serviceName,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        
        if status == errSecItemNotFound {
            return nil
        }
        
        guard status == errSecSuccess else {
            throw SecureStorageError.keychainError(status: status)
        }
        
        guard let data = result as? Data,
              let value = String(data: data, encoding: .utf8) else {
            throw SecureStorageError.decodingError
        }
        
        return value
    }
    
    private func deleteFromKeychain(key: String) throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecAttrService as String: serviceName
        ]
        
        let status = SecItemDelete(query as CFDictionary)
        
        if status != errSecSuccess && status != errSecItemNotFound {
            throw SecureStorageError.keychainError(status: status)
        }
    }
    
    private func getAllKeysFromKeychain() throws -> [String] {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: serviceName,
            kSecReturnAttributes as String: true,
            kSecMatchLimit as String: kSecMatchLimitAll
        ]
        
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        
        if status == errSecItemNotFound {
            return []
        }
        
        guard status == errSecSuccess else {
            throw SecureStorageError.keychainError(status: status)
        }
        
        guard let items = result as? [[String: Any]] else {
            return []
        }
        
        let keys = items.compactMap { item in
            item[kSecAttrAccount as String] as? String
        }
        
        return keys
    }
    
    private func clearAllFromKeychain() throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: serviceName
        ]
        
        let status = SecItemDelete(query as CFDictionary)
        
        if status != errSecSuccess && status != errSecItemNotFound {
            throw SecureStorageError.keychainError(status: status)
        }
    }
}

enum SecureStorageError: Error, LocalizedError {
    case encodingError
    case decodingError
    case keychainError(status: OSStatus)
    
    var errorDescription: String? {
        switch self {
        case .encodingError:
            return "Failed to encode data"
        case .decodingError:
            return "Failed to decode data"
        case .keychainError(let status):
            return "Keychain error: \(status)"
        }
    }
}

