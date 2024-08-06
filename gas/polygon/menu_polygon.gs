function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('カスタムメニュー')
      .addItem('upload Polygon To GitHub','uploadPolygonToGitHub')
      .addItem('download Polygon From GitHub', 'downloadPolygonFromGitHub')
      .addToUi();
}
