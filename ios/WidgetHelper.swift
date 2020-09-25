//
//  BridgeHeader.swift
//  extracker
//
//  Created by Jonathan Gonçalves Da Silva on 22/09/20.
//

import Foundation
import SwiftUI
import WidgetKit


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
  func UpdatePrice(_ coin:NSString, price:NSString, base:NSString, updatedAt: NSString) -> Void {
    let widgetData = WidgetData(coin: coin as String, price: price as String, base: base as String, updatedAt: updatedAt as String)
    
    guard let priceData = try? JSONEncoder().encode(widgetData) else { return }
    
    self.priceData = priceData
      
    WidgetCenter.shared.reloadAllTimelines()
  }
}
