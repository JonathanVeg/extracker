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

struct PriceEntryTest {
  var date = Date();
  let data: CoinData;
}

struct UITest_Previews: PreviewProvider {
  @available(iOS 13.0.0, *)
  static var previews: some View {
    let data: CoinData = CoinData(MarketName: "AAA", High: 0.0, Low: 0.0, Volume: 0.0, Last: 0.0, BaseVolume: 0.0, TimeStamp: "AAA", Bid: 0.0, Ask: 0.0, OpenBuyOrders: 1, OpenSellOrders: 1, PrevDay: 0.0, Created: "AAA")
    let entry = PriceEntry(date: Date(), data: data)
    let size: CGFloat = 169.0

    VStack {
      HStack {
        Text("sdas").bold().font(.callout).padding([.horizontal])
        Spacer()
      }
      HStack{
        Text("TESTE").bold().font(.callout)
        Text("teste").font(.footnote)
      }.padding()
      HStack {
        Spacer()
        Text("---").foregroundColor(.gray).font(.caption).fontWeight(.ultraLight).padding([.horizontal])
      }
    }.padding(5).border(Color.black, width: 1).frame(minWidth: size, idealWidth: size, maxWidth: size, minHeight: size, idealHeight: size, maxHeight: size, alignment: .center)
  }
}
