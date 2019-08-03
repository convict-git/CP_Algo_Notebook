function getValue0(row, col, sheetNo) {
  var No = parseInt(sheetNo, 10);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  var cell = sheet.getRange(row, col);
  return cell.getValue();
}
function getValue1(row, col, sheetNo) {
  var No = parseInt(sheetNo, 10);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[1];
  var cell = sheet.getRange(row, col);
  return cell.getValue();
}

function setValue0(row, col, val, sheetNo) {
  var No = parseInt(sheetNo, 10);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  var cell = sheet.getRange(row, col);
  cell.setValue(val);
}
function setValue1(row, col, val, sheetNo) {
  var No = parseInt(sheetNo, 10);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[1];
  var cell = sheet.getRange(row, col);
  cell.setValue(val);
}
function getMinutes (timeMiliSec, oldTimeMiliSec) {
  var duration = timeMiliSec - oldTimeMiliSec;
  var minutes = Math.floor((duration / (1000 * 60)));
  return minutes;
}

function msToTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
    days = Math.floor((duration / (1000 * 60 * 60 * 24)));

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  return days + "d " + hours + "h " + minutes + "m " + seconds + "s ";
}

function formatTime(timeMiliSec, oldTimeMiliSec) {
  return msToTime(timeMiliSec - oldTimeMiliSec);
}

function getDate() { // in dd/mm/yy
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1;
  var yy = today.getFullYear();
  /*
  if (dd < 10) {
    dd = '0' + dd;
  }
  if (mm < 10) {
    mm = '0' + mm;
  }*/
  return mm + '/' + dd + '/' + yy;
}

function isEmpty0(row, col, sheetNo) {
  var No = parseInt(sheetNo, 10);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  var cell = sheet.getRange(row, col);
  return cell.isBlank();
}
function isEmpty1(row, col, sheetNo) {
  var No = parseInt(sheetNo, 10);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[1];
  var cell = sheet.getRange(row, col);
  return cell.isBlank();
}

function protectRowAC0(row, sheetNo) {
  var No = parseInt(sheetNo, 10);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  var range = sheet.getRange(row, 1, 1, sheet.getMaxColumns());
  var protection = range.protect().setDescription('You got AC/Pretest Passed on this!');
  protection.setWarningOnly(true);
}
function protectRowAC1(row, sheetNo) {
  var No = parseInt(sheetNo, 10);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[1];
  var range = sheet.getRange(row, 1, 1, sheet.getMaxColumns());
  var protection = range.protect().setDescription('You got AC/Pretest Passed on this!');
  protection.setWarningOnly(true);
}

function onEdit(evt) {
  var sheetNo = evt.source.getActiveSheet().getIndex() - 1;
  Logger.log(Math.floor(parseInt(sheetNo, 10)));
  var range = evt.range;
  var d = new Date();
  var row = range.getColumn();
  var col = range.getRow();
  var currentTime = d.toLocaleString();
  var Mydate = getDate();
  var timeMiliSec = d.getTime(); // time in milisecs
  var status = range.getValue();

  Logger.log(range.getValue());
  Logger.log("CURRENT ROW IS " + range.getRow());

  if (range.getColumn() == 7 && range.getRow() >= 5) {
    protectRowAC0(range.getRow());

    var oldPenalty = getValue0(range.getRow(), range.getColumn() + 8, 0);

    if (status == "In progress") {
        var seenOnDateEmpty = isEmpty0(range.getRow(), range.getColumn() + 3);
        if (seenOnDateEmpty) {
          setValue0(range.getRow(), range.getColumn() + 3, currentTime, 0);
        }

        setValue0(range.getRow(), range.getColumn() + 5, timeMiliSec, 0);
        setValue0(range.getRow(), range.getColumn() + 7, Mydate, 0);

        var penaltyCellEmpty = isEmpty0(range.getRow(), range.getColumn() + 8);
        if (penaltyCellEmpty) {
          setValue0(range.getRow(), range.getColumn() + 8, '0', 0);
        }
    }
    else if (status == "Pretest Passed" || status == "AC") {
      if (status == "Pretest Passed") {
        setValue0(range.getRow(), range.getColumn() + 8, -1, 0);
      }
      var pen = getValue0(range.getRow(), range.getColumn() + 8, 0);
      if (status == "AC" && pen == -1) {
        return;
      }

      //first SOLVED TIME
      var oldTimeMiliSec = getValue0(range.getRow(), range.getColumn() + 5, 0);
      var formattedTime = formatTime (timeMiliSec, oldTimeMiliSec);
      var minutesPassed = getMinutes(timeMiliSec, oldTimeMiliSec);
      setValue0(range.getRow(), range.getColumn() + 2, formattedTime, 0);

      //update solved on
      setValue0(range.getRow(), range.getColumn() + 4, currentTime, 0);
      //update minutes (hidden)
      setValue0(range.getRow(), range.getColumn() + 6, minutesPassed, 0);
      protectRowAC0(range.getRow());
    }
    else if (status == "Skipped" || status == "WA" || status == "TLE") {
      if (oldPenalty == -1) {
        setValue0(range.getRow(), range.getColumn() + 8, 0, 0);
        oldPenalty = 0;
      }
      if (status == "Skipped") {
        setValue0(range.getRow(), range.getColumn() + 8, oldPenalty + 1, 0);
      }
      else {
        setValue0(range.getRow(), range.getColumn() + 8, oldPenalty + 0.25, 0);
      }
    }
    else if (status == "Upsolved") {
      //first SOLVED TIME
      var penaltyCount = getValue0(range.getRow(), range.getColumn() + 8, 0);
      var penaltyTimeMiliSec = penaltyCount * 60 * 60 * 1000;
      var totalTimeMiliSec = timeMiliSec + penaltyTimeMiliSec;
      var oldTimeMiliSec = getValue0(range.getRow(), range.getColumn() + 5, 0);
      var formattedTime = formatTime (totalTimeMiliSec, oldTimeMiliSec);
      var minutesPassed = getMinutes(totalTimeMiliSec, oldTimeMiliSec, 0);
      setValue0(range.getRow(), range.getColumn() + 2, formattedTime, 0);

      //update solved on
      setValue0(range.getRow(), range.getColumn() + 4, currentTime, 0);
      //update minutes (hidden)
      setValue0(range.getRow(), range.getColumn() + 6, minutesPassed, 0);
      protectRowAC0(range.getRow());
    }
    else if (status == "Reading") {
      var seenOnDateEmpty = isEmpty0(range.getRow(), range.getColumn() + 3);
        if (seenOnDateEmpty) {
          setValue0(range.getRow(), range.getColumn() + 3, currentTime, 0);
        }

        setValue0(range.getRow(), range.getColumn() + 5, timeMiliSec, 0);
        setValue0(range.getRow(), range.getColumn() + 7, Mydate, 0);

        var penaltyCellEmpty = isEmpty0(range.getRow(), range.getColumn() + 8);
        if (penaltyCellEmpty) {
          setValue0(range.getRow(), range.getColumn() + 8, '0', 0);
        }
    }
    else if (status == "Read") {
        //first SOLVED TIME
      var penaltyCount = getValue0(range.getRow(), range.getColumn() + 8, 0);
      var penaltyTimeMiliSec = penaltyCount * 60 * 60 * 1000;
      var totalTimeMiliSec = timeMiliSec + penaltyTimeMiliSec;
      var oldTimeMiliSec = getValue0(range.getRow(), range.getColumn() + 5, 0);
      var formattedTime = formatTime (totalTimeMiliSec, oldTimeMiliSec);
      setValue0(range.getRow(), range.getColumn() + 2, formattedTime, 0);

      //update solved on
      setValue0(range.getRow(), range.getColumn() + 4, currentTime, 0);
      protectRowAC0(range.getRow());
    }
  }
}
