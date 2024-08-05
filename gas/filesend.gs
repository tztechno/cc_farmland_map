function doGet(e) {
  return HtmlService.createHtmlOutput('OK')
      .addMetaTag('Access-Control-Allow-Origin', '*')
      .addMetaTag('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .addMetaTag('Access-Control-Allow-Headers', 'Content-Type');
}

function doPost(e) {
  // オプションリクエストを処理
  if (e.parameter.method == "OPTIONS") {
    return HtmlService.createHtmlOutput()
        .addMetaTag('Access-Control-Allow-Origin', '*')
        .addMetaTag('Access-Control-Allow-Methods', 'POST, OPTIONS')
        .addMetaTag('Access-Control-Allow-Headers', 'Content-Type');
  }
  
  const params = JSON.parse(e.postData.contents);
  const content = params.content;
  const fileName = params.fileName;

  const folder = DriveApp.getFolderById('1Uuwfk6ujh2XpjBYOCJ20B-86UbcKNlSX'); // Google DriveのフォルダIDを指定
  const file = folder.createFile(fileName, content, MimeType.CSV);

  const response = JSON.stringify({ url: file.getUrl() });

  return ContentService.createTextOutput(response)
      .setMimeType(ContentService.MimeType.JSON)
      .addHeader('Access-Control-Allow-Origin', '*')
      .addHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
      .addHeader('Access-Control-Allow-Headers', 'Content-Type');
}
