//
//  UITest.swift
//  extracker
//
//  Created by Jonathan Silva on 24/09/20.
//

import SwiftUI

struct UITest: View {
  @available(iOS 13.0.0, *)
  var body: some View {
        Text(/*@START_MENU_TOKEN@*/"Hello, World!"/*@END_MENU_TOKEN@*/)
    }
}

struct UITest_Previews: PreviewProvider {
  @available(iOS 13.0.0, *)
  static var previews: some View {
    VStack {
      Text("BTC").bold()
      Text("45000.456 BRL")
      Text("NOW").foregroundColor(.gray)
    }
  }
}
