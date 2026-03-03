#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(TransactionSigner, NSObject)

RCT_EXTERN_METHOD(signTransaction:(NSString *)chainName
                  walletAddress:(NSString *)walletAddress
                  rawUnsignedTx:(NSString *)rawUnsignedTx
                  chainId:(NSInteger)chainId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
