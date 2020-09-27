//
//  Price_Widget.swift
//  Price-Widget
//
//  Created by Jonathan Gonçalves Da Silva on 21/09/20.
//

import WidgetKit
import SwiftUI

struct PriceEntry: TimelineEntry {
  var date = Date();
  let data: CoinData;

  
//  var relevance: TimelineEntryRelevance? {
//    return TimelineEntryRelevance(score: 90)
//  }
}
  
struct Provider: TimelineProvider {  
//  @AppStorage("widget_data", store: UserDefaults(suiteName: "group.widget.price.data"))
//  var priceData: Data = Data()
  
  func getSnapshot(in context: Context, completion: @escaping (PriceEntry) -> Void) {
    // guard let data = try? JSONDecoder().decode(WidgetData.self, from: priceData) else { return }
    let fakeData = CoinData(MarketName: "DCR-BTC", High: 1.0, Low: 1.0, Volume: 1.0, Last: 1.0, BaseVolume: 1.0, TimeStamp: "NOW", Bid: 1.0, Ask: 1.0, OpenBuyOrders: 100, OpenSellOrders: 100, PrevDay: 0.9, Created: "NOW")
    let entry = PriceEntry(data: fakeData)
    completion(entry)
  }
  
  func getTimeline(in context: Context, completion: @escaping (Timeline<PriceEntry>) -> Void) {
    // guard let data = try? JSONDecoder().decode(WidgetData.self, from: priceData) else { return }
    
    BittrexService(coin: "dcr", market: "btc").getData { (result) in
      let data: CoinData
      
      if case .success(let fetchedData) = result {
        data = fetchedData
      } else {
        data = CoinData(High: 0.0, Low: 0.0, Volume: 0.0, Last: 0.0, BaseVolume: 0.0, Bid: 0.0, Ask: 0.0)
      }
      
      let entry = PriceEntry(date: Date(), data: data)
      let timeline = Timeline(entries: [entry], policy: .after(Date().addMinutes(minutes: 2)))
      
      completion(timeline)
    }
  }
  
  func placeholder(in context: Context) -> PriceEntry {
    return PriceEntry(data: CoinData(High: 0.0, Low: 0.0, Volume: 0.0, Last: 0.0, BaseVolume: 0.0, Bid: 0.0, Ask: 0.0))
  }
}

struct ViewToRender: View {
  let entry: PriceEntry
  let timestampUTC: String
  let changes: Double
  let changesColor: Color
  
  init(entry: PriceEntry) {
    self.entry = entry;
    
    timestampUTC = "\("\(entry.data.TimeStamp!.split(separator: "T")[1])".split(separator: ".")[0]) UTC"
    
    changes = entry.data.changes()
    
    if changes >= 0 {
      changesColor = .green
    } else {
      changesColor = .red
    }
  }
  
  var body: some View {
    VStack {
      HStack {
        Text("\(entry.data.coin())").font(.headline).font(.system(.title3))
        Spacer()
        Text("\(entry.data.market())").font(.headline).font(.system(.title3))
      }
      
      HStack{
        VStack(alignment: .leading) {
          Text("=: \(String(format: "%.8f", entry.data.Last))").font(.system(.caption))
          Text("H: \(String(format: "%.8f", entry.data.High))").font(.system(.caption))
          Text("L: \(String(format: "%.8f", entry.data.Low))").font(.system(.caption))
        }
        
        Text("\(String(format: "%.1f", entry.data.changes()))%").foregroundColor(changesColor).font(.system(.caption))
        
      }.padding([.top], 5)
      
      Spacer()
      // Text(Date().addMinutes(minutes: 2).asString()).font(.footnote)
      Text(timestampUTC).foregroundColor(.gray).font(.footnote)
    }
    .padding([.top, .bottom, .leading])
    // .frame(minWidth: 0, maxWidth: .infinity, minHeight: 0, maxHeight: .infinity, alignment: .leading)
    // .background(LinearGradient(gradient: Gradient(colors: [.black, Color(red: 61, green: 61, blue: 61, opacity: 1)]), startPoint: .top, endPoint: .bottom))

  }
}

struct WidgetEntryView: View {
  let entry: Provider.Entry;
  
  var body: some View {
    ViewToRender(entry: entry)
  }
}

@main
struct PriceWidget: Widget {
  private let kind = "Price_Widget"
  
  var body: some WidgetConfiguration {
    StaticConfiguration(
      kind: kind,
      provider: Provider()
    ) { entry in
      WidgetEntryView(entry: entry)
    }
    .configurationDisplayName("Price Widget")
    .description("Display coin price from Bittrex")
    .supportedFamilies([.systemSmall])
  }
}
