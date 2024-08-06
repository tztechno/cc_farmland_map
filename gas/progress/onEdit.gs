function getUserName() {
  var email = Session.getActiveUser().getEmail();
  return email.split('@')[0];
}

function onEdit(e) {
  if (!e || !e.range) {
    console.log("Invalid edit event");
    return;
  }

  var range = e.range;
  var sheet = range.getSheet();
  
  if (sheet.getName() == "progress") {
    var row = range.getRow();
    var column = range.getColumn();
        
    // 既存の処理（列3に関する処理）
    if (column == 3) {
      var userName = getUserName();

      var date = new Date();
      var formattedDate = Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM-dd");
      var formattedTime = Utilities.formatDate(date, Session.getScriptTimeZone(), "HH:mm:ss");
      
      var selectedValue = range.getValue();
      var mapping = {
        "散布前": 0,
        "散布中": 1,
        "散布済み": 2,
        "散布中止": 3
      };
      var mappedValue = mapping[selectedValue] !== undefined ? mapping[selectedValue] : "";
      
      sheet.getRange(row, 2).setValue(mappedValue);
      sheet.getRange(row, 4).setValue(userName);
      sheet.getRange(row, 5).setValue(formattedDate);
      sheet.getRange(row, 6).setValue(formattedTime);
    }
  }
}
