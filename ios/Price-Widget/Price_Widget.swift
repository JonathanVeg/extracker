//
//  Price_Widget.swift
//  Price-Widget
//
//  Created by Jonathan Gonçalves Da Silva on 21/09/20.
//

import WidgetKit
import SwiftUI


extension Date {
  func asString(style: DateFormatter.Style) -> String {
    let dateFormatter = DateFormatter()
    dateFormatter.dateStyle = style
    return dateFormatter.string(from: self)
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
    let entry = PriceEntry(date: Date(), price: price)
    let timeline = Timeline(entries: [entry], policy: .atEnd)
    completion(timeline)
  }
  
  func placeholder(in context: Context) -> PriceEntry {
    return PriceEntry(price: WidgetData(coin: "BTC", price: "loading"))
  }
}

struct PlaceholderView: View {
  var body: some View {
    VStack {
      Text("BTC is \(10444) USD")
      Text("\(Date().asString(style: .short))").fontWeight(.ultraLight)
    }
  }
}

struct WidgetEntryView: View {
  let entry: Provider.Entry;
  
  var body: some View {
    VStack {
      Text("\(entry.price.coin) is \(entry.price.price)")
      Text("\(Date().asString(style: .medium))").font(.footnote).fontWeight(.ultraLight)
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
