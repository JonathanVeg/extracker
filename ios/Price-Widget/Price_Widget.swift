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
  let data: WidgetData;
}

struct Provider: TimelineProvider {  
  @AppStorage("widget_data", store: UserDefaults(suiteName: "group.widget.price.data"))
  var priceData: Data = Data()
  
  func getSnapshot(in context: Context, completion: @escaping (PriceEntry) -> Void) {
    guard let data = try? JSONDecoder().decode(WidgetData.self, from: priceData) else { return }
    let entry = PriceEntry(data: data)
    completion(entry)
  }
  
  func getTimeline(in context: Context, completion: @escaping (Timeline<PriceEntry>) -> Void) {
    guard let data = try? JSONDecoder().decode(WidgetData.self, from: priceData) else { return }
    
    let calendar = Calendar.current
    let date = calendar.date(byAdding: .minute, value: 5, to: Date())
    
    let entry = PriceEntry(date: Date(), data: data)
    // let timeline = Timeline(entries: [entry], policy: .after(date!))
    let timeline = Timeline(entries: [entry], policy: .atEnd)
    completion(timeline)
  }
  
  func placeholder(in context: Context) -> PriceEntry {
    return PriceEntry(data: WidgetData(coin: "BTC", price: "loading", base: "BRL", updatedAt: "now"))
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
    }.padding(5)
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
