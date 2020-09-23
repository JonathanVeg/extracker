//
//  BridgeHeader.swift
//  extracker
//
//  Created by Jonathan Gonçalves Da Silva on 22/09/20.
//

import Foundation
import SwiftUI

@available(iOS 14.0, *)
@objc(WidgetHelper)
class WidgetHelper: NSObject, RCTBridgeModule {
  @AppStorage("widget_data", store: UserDefaults(suiteName: "group.widget.price.data"))
  var priceData: Data = Data()

  static func moduleName() -> String {
    return "WidgetHelper"
  }

  private static func requireMainQueueSetup () -> Bool {
    return true;
  }
   
  
  @objc
  func UpdatePrice(_ coin:NSString, price:NSString) -> Void {
    let widgetData = WidgetData(coin: coin as String, price: price as String)
    
    guard let priceData = try? JSONEncoder().encode(widgetData) else { return }
    
    self.priceData = priceData
  }
}
