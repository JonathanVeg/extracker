//
//  Date+Extensions.swift
//  extracker
//
//  Created by Jonathan Gonçalves Da Silva on 27/09/20.
//

import Foundation

extension Date {
  func asString() -> String {
    let formatter = DateFormatter()
    formatter.dateFormat = "MMM dd - HH:mm"
    
    return formatter.string(from: self)
  }
  
  func addMinutes(minutes: Int) -> Date {
    let calendar = Calendar.current
    let date = calendar.date(byAdding: .minute, value: minutes, to: self)!
    return date
  }
}
