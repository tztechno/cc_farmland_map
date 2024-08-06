function doGet(e) {
  // CORSの設定だけをヘッダーで追加
  return HtmlService.createHtmlOutput('OK')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  // CORS設定はヘッダーで追加
  if (e.parameter.method == "OPTIONS") {
    return ContentService.createTextOutput('')
        .setMimeType(ContentService.MimeType.TEXT)
        .addHeader('Access-Control-Allow-Origin', '*')
        .addHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
        .addHeader('Access-Control-Allow-Headers', 'Content-Type');
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
