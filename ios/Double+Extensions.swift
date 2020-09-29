//
//  Double+Extensions.swift
//  extracker
//
//  Created by Jonathan Silva on 29/09/20.
//

import Foundation

extension Double {
  func idealDecimalPlaces() -> String {    
    if (self >= 100000) { return String(format: "%.1f", self) }
    if (self >= 10000) { return String(format: "%.2f", self) }
    if (self >= 10) { return String(format: "%.4f", self) }
    return String(format: "%.8f", self)
  }
}
