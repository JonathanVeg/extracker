//
//  BittrexService.swift
//  extracker
//
//  Created by Jonathan Gonçalves Da Silva on 26/09/20.
//

import SwiftUI

struct BittrexResult: Codable {
  var success: Bool
  var message: String
  var result: [CoinData]
}

struct CoinData: Codable {
//  var Name: String = "DCR";
//  var Market: String = "BTC";
//  var UpdatedAt: Date = Date();

  var MarketName: String?;
  var High: Double;
  var Low: Double;
  var Volume: Double;
  var Last: Double;
  var BaseVolume: Double;
  var TimeStamp: String?;
  var Bid: Double;
  var Ask: Double;
  var OpenBuyOrders: Int?;
  var OpenSellOrders: Int?;
  var PrevDay: Double?;
  var Created: String?;
  
  func coin() -> String {
    return String(MarketName!.split(separator: "-")[1])
  }
  
  func market() -> String {
    return String(MarketName!.split(separator: "-")[0])
  }
  
  func changes() -> Double {
    return ((PrevDay! - Last) / PrevDay!) * -100
  }
}

class BittrexService {
  let coin: String;
  let market: String;
  let url: URL;
  
  init(coin: String, market: String) {
    self.coin = coin;
    self.market = market;
    self.url = URL(string: "https://api.bittrex.com/api/v1.1/public/getmarketsummary?market=\(market.lowercased())-\(coin.lowercased())")!
  }
  
  func getData(completion: @escaping (Result<CoinData, Error>) -> Void) {
    URLSession.shared.dataTask(with: url) { data, response, error in
      guard error == nil else {
        completion(.failure(error!))
        return
      }
      
      completion(.success(self.getCoinData(fromData: data!)))
    }.resume()
  }
  
  private func getCoinData(fromData data: Data) -> CoinData {
    let result = try? JSONDecoder().decode(BittrexResult.self, from: data)
    
    if let resultD = result {
      return resultD.result[0]
    }
    
    return CoinData(High: 0.0, Low: 0.0, Volume: 0.0, Last: 0.0, BaseVolume: 0.0, Bid: 0.0, Ask: 0.0)
  }
}
