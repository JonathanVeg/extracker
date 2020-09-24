#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(WidgetHelper, NSObject)
  RCT_EXTERN_METHOD(UpdatePrice:(NSString *)coin price:(NSString *)price updatedAt:(NSString *)updatedAt)

// Please add this one
+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
