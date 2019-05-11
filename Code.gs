function getValue(row, col) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  var cell = sheet.getRange(row, col);
  return cell.getValue();
}

function setValue(row, col, val) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
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
  if (dd < 10) {
    dd = '0' + dd;
  }
  if (mm < 10) {
    mm = '0' + mm;
  }
  return dd + '/' + mm + '/' + yy;
}

function isEmpty(row, col) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  var cell = sheet.getRange(row, col);
  return cell.isBlank();
}

function protectRowAC(row) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  var range = sheet.getRange(row, 1, 1, sheet.getMaxColumns());
  var protection = range.protect().setDescription('You got AC/Pretest Passed on this!');
  protection.setWarningOnly(true);
}

function onEdit(evt) {
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
    var oldPenalty = getValue(range.getRow(), range.getColumn() + 8);

    if (status == "In progress") {
        var seenOnDateEmpty = isEmpty(range.getRow(), range.getColumn() + 3);
        if (seenOnDateEmpty) {
          setValue(range.getRow(), range.getColumn() + 3, currentTime);
        }
        
        setValue(range.getRow(), range.getColumn() + 5, timeMiliSec);
        setValue(range.getRow(), range.getColumn() + 7, Mydate);
        
        var penaltyCellEmpty = isEmpty(range.getRow(), range.getColumn() + 8);
        if (penaltyCellEmpty) {
          setValue(range.getRow(), range.getColumn() + 8, '0');
        }
    }
    else if (status == "Pretest Passed" || status == "AC") {
      if (status == "Pretest Passed") {
        setValue(range.getRow(), range.getColumn() + 8, -1);
      }
      
      //first SOLVED TIME 
      var oldTimeMiliSec = getValue(range.getRow(), range.getColumn() + 5);
      var formattedTime = formatTime (timeMiliSec, oldTimeMiliSec);
      var minutesPassed = getMinutes(timeMiliSec, oldTimeMiliSec);
      setValue(range.getRow(), range.getColumn() + 2, formattedTime);
      
      //update solved on
      setValue(range.getRow(), range.getColumn() + 4, currentTime);
      //update minutes (hidden)
      setValue(range.getRow(), range.getColumn() + 6, minutesPassed);
      protectRowAC(range.getRow());
    }
    else if (status == "Skipped" || status == "WA" || status == "TLE") {
      if (oldPenalty == -1) {
        setValue(range.getRow(), range.getColumn() + 8, 0);
      }
      if (status == "Skipped") {
        setValue(range.getRow(), range.getColumn() + 8, oldPenalty + 1);  
      }
      else {
        setValue(range.getRow(), range.getColumn() + 8, oldPenalty + 0.25);
      }
    }
    else if (status == "Upsolved") {
      //first SOLVED TIME 
      var penaltyCount = getValue(range.getRow(), range.getColumn() + 8);
      var penaltyTimeMiliSec = penaltyCount * 60 * 60 * 1000;
      var totalTimeMiliSec = timeMiliSec + penaltyTimeMiliSec;
      var oldTimeMiliSec = getValue(range.getRow(), range.getColumn() + 5);
      var formattedTime = formatTime (totalTimeMiliSec, oldTimeMiliSec);
      var minutesPassed = getMinutes(totalTimeMiliSec, oldTimeMiliSec);
      setValue(range.getRow(), range.getColumn() + 2, formattedTime);
      
      //update solved on
      setValue(range.getRow(), range.getColumn() + 4, currentTime);
      //update minutes (hidden)
      setValue(range.getRow(), range.getColumn() + 6, minutesPassed);
      protectRowAC(range.getRow());      
    }
  }
}
