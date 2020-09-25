//
//  Price_Widget.swift
//  Price-Widget
//
//  Created by Jonathan Gonçalves Da Silva on 21/09/20.
//

import WidgetKit
import SwiftUI


extension Date {
  func asString() -> String {
    let formatter = DateFormatter()
    formatter.dateFormat = "MMM dd - HH:mm"
    
    return formatter.string(from: Date())
  }
}

  
struct PriceEntry: TimelineEntry {
  var date = Date();
  let price: WidgetData;
}

struct Provider: TimelineProvider {  
  @AppStorage("widget_data", store: UserDefaults(suiteName: "group.widget.price.data"))
  var priceData: Data = Data()
  
  func getSnapshot(in context: Context, completion: @escaping (PriceEntry) -> Void) {
    guard let price = try? JSONDecoder().decode(WidgetData.self, from: priceData) else { return }
    let entry = PriceEntry(price: price)
    completion(entry)
  }
  
  func getTimeline(in context: Context, completion: @escaping (Timeline<PriceEntry>) -> Void) {
    guard let price = try? JSONDecoder().decode(WidgetData.self, from: priceData) else { return }
    
    let calendar = Calendar.current
    let date = calendar.date(byAdding: .minute, value: 5, to: Date())
    
    let entry = PriceEntry(date: Date(), price: price)
    // let timeline = Timeline(entries: [entry], policy: .after(date!))
    let timeline = Timeline(entries: [entry], policy: .atEnd)
    completion(timeline)
  }
  
  func placeholder(in context: Context) -> PriceEntry {
    return PriceEntry(price: WidgetData(coin: "BTC", price: "loading", updatedAt: "now"))
  }
}

struct PlaceholderView: View {
  var body: some View {
    VStack {
      Text("BTC is \(10444) USD")
      Text("\(Date().asString())").fontWeight(.thin)
    }
  }
}

struct WidgetEntryView: View {
  let entry: Provider.Entry;
  
  var body: some View {
    VStack {
      Text("\(entry.price.coin) is \(entry.price.price)")
      Text("\(entry.price.updatedAt)").font(.footnote).fontWeight(.ultraLight)
    }
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
    .supportedFamilies([.systemSmall, .systemMedium])
  }
  
  
}
