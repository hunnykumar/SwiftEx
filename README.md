# SwiftEx Wallet

A non-custodial multi-chain crypto wallet for iOS and Android, built with React Native.

## Features

- Store and manage assets across Ethereum, BNB Chain, Stellar, and more
- Token swaps via Uniswap V3, PancakeSwap, and Stellar DEX
- Cross-chain bridging via Allbridge
- Fiat on-ramp via Alchemy Pay
- BIP-39 wallet generation and import
- Real-time portfolio view

## Requirements

- Node.js >= 18
- React Native CLI
- Xcode (iOS)
- Android Studio (Android)

## Firebase Setup

This project requires a Firebase configuration file to run properly.

### Steps
1. Go to Firebase Console.
2. Create or open your Firebase project.
3. Add an Android and IOS app to the project.
4. Download the `google-services.json` and `google-services-info.plist` file.
5. Place the file inside the `src/` directory of the project.

Note: The project will not run correctly without this file.

## Setup

```bash
git clone https://github.com/hunnykumar/SwiftEx.git
cd SwiftEx
npm install

# iOS
cd ios && pod install && cd ..
```

## Running

```bash
# iOS
npx react-native run-ios

# Android
npx react-native run-android
```

## License

MIT License — Copyright © 2026 SwiftEx Wallet
