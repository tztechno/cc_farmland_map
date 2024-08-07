function uploadPolygonToGitHub() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("polygon");
  var data = sheet.getRange(1, 1, sheet.getLastRow(), 3).getValues();
  
  // CSV形式に変換し、WKTを引用符で囲む
  var csv = data.map(row => {
    var wkt = '"' + row[0] + '"'; // WKTを引用符で囲む
    var region = row[1];
    var description = row[2];
    return [wkt, region, description].join(',');
  }).join('\n');
  
  // UTF-8エンコード
  var utf8Bytes = Utilities.newBlob(csv).getBytes();
  var file_content = Utilities.base64Encode(utf8Bytes);
  
  // GitHub APIの設定
  var github_token = getApiToken();
  var repo_owner = "tztechno";
  var repo_name = "cc_farmland_map";
  var file_path = "public/Polygon.csv";
  var api_url = 'https://api.github.com/repos/' + repo_owner + '/' + repo_name + '/contents/' + file_path;
  
  var headers = {
    "Authorization": "token " + github_token,
    "Content-Type": "application/json"
  };
  
  try {
    // 現在のファイルSHAを取得
    var response = UrlFetchApp.fetch(api_url, {
      "method": "get",
      "headers": headers
    });
    
    var file_data = JSON.parse(response.getContentText());
    var sha = file_data.sha;

    var payload = {
      "message": "Update Polygon.csv",
      "content": file_content,
      "sha": sha
    };
    
    var options = {
      "method": "put",
      "headers": headers,
      "payload": JSON.stringify(payload),
      "muteHttpExceptions": true // エラー詳細をログに記録するために追加
    };
    
    var updateResponse = UrlFetchApp.fetch(api_url, options);
    Logger.log(updateResponse.getContentText());
  } catch (e) {
    Logger.log(e.toString());
    Logger.log(e.message);
    Logger.log(e.stack);
    if (e.response) {
      Logger.log(e.response.getContentText()); // エラーレスポンスの内容をログに記録
    }
  }
}



