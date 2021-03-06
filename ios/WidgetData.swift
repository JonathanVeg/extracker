//
//  WidgetData.swift
//  extracker
//
//  Created by Jonathan Silva on 23/09/20.
//

import Foundation

struct WidgetData: Identifiable, Codable {
  let coin: String
  let price: String
  let base: String
  let updatedAt: String
    
  var id: String { coin }
}

