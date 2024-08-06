function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('カスタムメニュー')
      .addItem('upload progress','uploadToGitHub')
      .addItem('download progress','downloadFromGitHub')
      .addToUi();
}
