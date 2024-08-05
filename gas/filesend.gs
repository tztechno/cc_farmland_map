//共有フォルダにファイルを送る

function doGet(e) {
    var response = ContentService.createTextOutput('OK')
        .setMimeType(ContentService.MimeType.TEXT);
    
    // CORSヘッダーを設定するためにHTMLサービスを使用
    return HtmlService.createHtmlOutput()
        .append(response.getContent())
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag('Access-Control-Allow-Origin', '*')
        .addMetaTag('Access-Control-Allow-Methods', 'GET, POST')
        .addMetaTag('Access-Control-Allow-Headers', 'Content-Type');
}

function doPost(e) {
    // オプションリクエストを処理
    if (e.parameter.method == "OPTIONS") {
        return HtmlService.createHtmlOutput()
            .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
            .addMetaTag('Access-Control-Allow-Origin', '*')
            .addMetaTag('Access-Control-Allow-Methods', 'POST')
            .addMetaTag('Access-Control-Allow-Headers', 'Content-Type');
    }
    
    const params = JSON.parse(e.postData.contents);
    const content = params.content;
    const fileName = params.fileName;

    const folder = DriveApp.getFolderById('xxx'); // Google DriveのフォルダIDを指定
    const file = folder.createFile(fileName, content, MimeType.CSV);

    const response = ContentService.createTextOutput(JSON.stringify({ url: file.getUrl() }))
        .setMimeType(ContentService.MimeType.JSON);

    // CORSヘッダーを設定するためにHTMLサービスを使用
    return HtmlService.createHtmlOutput()
        .append(response.getContent())
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag('Access-Control-Allow-Origin', '*')
        .addMetaTag('Access-Control-Allow-Methods', 'POST')
        .addMetaTag('Access-Control-Allow-Headers', 'Content-Type');
}
