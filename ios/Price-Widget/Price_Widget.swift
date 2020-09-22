//
//  Price_Widget.swift
//  Price-Widget
//
//  Created by Jonathan Gonçalves Da Silva on 21/09/20.
//

import WidgetKit
import SwiftUI

struct PriceEntry: TimelineEntry {
  var date: Date = Date();
  let price: String;
}

struct Provider: TimelineProvider {  
  @AppStorage("price", store: UserDefaults(suiteName: "group.com.extracker.data"))
  var priceData: Data = Data()
  
  func getSnapshot(in context: Context, completion: @escaping (PriceEntry) -> Void) {
    let price: String? = try? JSONDecoder().decode(String.self, from: priceData)
    let entry = PriceEntry(price: price ?? "loading...")
    completion(entry)
  }
  
  func getTimeline(in context: Context, completion: @escaping (Timeline<PriceEntry>) -> Void) {
    let price: String? = try? JSONDecoder().decode(String.self, from: priceData)
    let entry = PriceEntry(price: price ?? "loading...")
    let timeline = Timeline(entries: [entry], policy: .never)
    completion(timeline)
  }
  
  func placeholder(in context: Context) -> PriceEntry {
   return PriceEntry(price: "10445.46")
  }
}

struct PlaceholderView: View {
  var body: some View {
    VStack {
      Text("BTC PRICE IS \(10444) USD")
    }
  }
}

struct WidgetEntryView: View {
  let entry: Provider.Entry;
  
  var body: some View {
    VStack {
      Text("BTC PRICE IS \(entry.price) USD")
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
    .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
  }
}
