function downloadPolygonFromGitHub() {
  var github_url = "https://raw.githubusercontent.com/tztechno/cc_farmland_map/main/public/Polygon.csv";
  
  // GitHubからCSVデータを取得
  var data = UrlFetchApp.fetch(github_url).getContentText();
  console.log(data);

  // CSVデータをカスタムパース
  var csvData = parseCustomCsv(data);

  // 「polygon master」スプレッドシートを取得
  var spreadsheetId = '1kpXFFGORgbJ79N78bj6tK_JPYqkz7SZX5_Z_GOXr1F0';  // ここに「polygon master」スプレッドシートのIDを入力
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  
  // デフォルトのシートを取得（または名前で指定する）
  var sheet = spreadsheet.getSheets()[0]; // 最初のシートを取得する場合
  // var sheet = spreadsheet.getSheetByName('Sheet1'); // シート名で取得する場合

  // データをシートにセット
  sheet.clear(); // 既存のデータをクリア
  sheet.getRange(1, 1, csvData.length, csvData[0].length).setValues(csvData);
  
  Logger.log('データがスプレッドシートに正常に更新されました。');
}

function parseCustomCsv(data) {
  var lines = data.split('\n');
  var result = [];

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (line) {
      var values = line.split(',');
      
      // -2 番目を region, -1 番目を description として処理
      var region = values[values.length - 2];
      var description = values[values.length - 1];
      
      // 残りを WKT として結合
      var wkt = values.slice(0, values.length - 2).join(',');

      // 結果にプッシュ
      result.push([wkt, region, description]);
    }
  }
  return result;
}

