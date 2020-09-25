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
    Text("Hello, World!")
  }
}

struct PriceEntry {
  var date = Date();
  let data: WidgetData;
}

struct UITest_Previews: PreviewProvider {
  @available(iOS 13.0.0, *)
  static var previews: some View {
    let data: WidgetData = WidgetData(coin: "BTC", price: "59561.78", base: "BRL", updatedAt: "Sep 25 - 12:25")
    let entry = PriceEntry(date: Date(), data: data)
    let size: CGFloat = 169.0

    VStack {
      HStack {
        Text(entry.data.coin).bold().font(.callout).padding([.horizontal])
        Spacer()
      }
      HStack{
        Text(entry.data.price).bold().font(.callout)
        Text(entry.data.base).font(.footnote)
      }.padding()
      HStack {
        Spacer()
        Text(entry.data.updatedAt).foregroundColor(.gray).font(.caption).fontWeight(.ultraLight).padding([.horizontal])
      }
    }.padding(5).border(Color.black, width: 1).frame(minWidth: size, idealWidth: size, maxWidth: size, minHeight: size, idealHeight: size, maxHeight: size, alignment: .center)
  }
}
