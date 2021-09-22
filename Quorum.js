/* global CalendarApp, MailApp, PropertiesService, SpreadsheetApp */

function sendMail(dataMatrix) {
  const yesCount = dataMatrix.filter((row) => row[1][0] === "YES").length;
  const recipient = PropertiesService.getScriptProperties()
    .getProperty("pipeMajor");
  const spreadsheetID = PropertiesService.getScriptProperties()
    .getProperty("spreadsheetID");
  const spreadsheetURL = encodeURI(
    `https://docs.google.com/spreadsheets/d/${spreadsheetID}/edit#gid=0`
  );
  const spreadsheetName = SpreadsheetApp.openById(spreadsheetID).getName();
  const subject = "Sutherland Pipe Band confirmed attendees: " + yesCount;
  const body = spreadsheetName + "\n" + spreadsheetURL;
  const htmlBody = `<a href="${spreadsheetURL}">${spreadsheetName}</a>`;
  const options = {
    htmlBody: htmlBody
  };

  MailApp.sendEmail(recipient, subject, body, options);
}

function getPractiveEvent() {
  const calendarID = PropertiesService.getScriptProperties()
    .getProperty("calendarID");
  const myCal = CalendarApp.getCalendarById(calendarID);
  const tdy = new Date();
  const year = tdy.getFullYear();
  const month = tdy.getMonth();
  const date = tdy.getDate();
  const weekDay = tdy.getDay(); // 0-6
  const offset = 4 - weekDay; // number of days to or from Thursday (day 4)
  const practiceStartTime = PropertiesService.getScriptProperties()
    .getProperty("practiceStartTime");
  const practiceEndTime = PropertiesService.getScriptProperties()
    .getProperty("practiceEndTime");
  const startTime = new Date(year, month, date + offset, practiceStartTime);
  const endTime = new Date(year, month, date + offset, practiceEndTime);
  const myEvents = myCal.getEvents(startTime, endTime);
  const event_iCalUID = PropertiesService.getScriptProperties()
    .getProperty("event_iCalUID");
  // assuming only one practice event scheduled
  const practiceEvent = myEvents.filter(
    ev => {
      const eventID = ev.getId()
        .match(/([a-zA-Z0-9]*)(_R[0-9]{8}T[0-9]{6})?(@google.com)/);

      return event_iCalUID === eventID[1] + eventID[3];
    }
  )[0];

  return practiceEvent;
}

function getSetTime(time, dow) {
  const dt = new Date();

  // set practice to Thur of the current week
  dt.setDate(dt.getDate() + 4 - dow);
  dt.setMinutes(0);
  dt.setSeconds(0);
  dt.setHours(time);

  return dt;
}

// eslint-disable-next-line no-unused-vars
function __createPracticeEvent() {
  const dt = new Date();
  const dow = dt.getDay(); // Sunday - Saturday : 0 - 6
  const startTime = getSetTime(
    PropertiesService.getScriptProperties()
      .getProperty("practiceStartTime"),
    dow
  );
  const endTime = getSetTime(
    PropertiesService.getScriptProperties()
      .getProperty("practiceEndTime"),
    dow
  );
  const title = PropertiesService.getScriptProperties()
    .getProperty("eventTitle");
  const calendarID = PropertiesService.getScriptProperties()
    .getProperty("calendarID");
  const spreadsheetID = PropertiesService.getScriptProperties()
    .getProperty("spreadsheetID");
  const rosterSheet = SpreadsheetApp.openById(spreadsheetID)
    .getSheetByName("Roster");
  const rosterStr = rosterSheet.getRange("A2:A").getValues()
    .reduce((prev, cur) => [...prev, cur[0]], []).toString();
  const options = {
    description: PropertiesService.getScriptProperties()
      .getProperty("eventDescription"),
    location: PropertiesService.getScriptProperties()
      .getProperty("eventLocation"),
    guests: rosterStr,
    sendInvites: true
  };

  // don't create events after Weds of the current week
  if (dow > 3) {
    return;
  }

  CalendarApp.getCalendarById(calendarID)
    .createEvent(
      title,
      startTime,
      endTime,
      options
    );
}

/**
 * For each member in roster, find practiceEvent status then update roster
 * column B with status.
 */
// eslint-disable-next-line no-unused-vars
function __updateSpreadsheetStatuses() {
  const practiceEvent = getPractiveEvent();
  const spreadsheetID = PropertiesService.getScriptProperties()
    .getProperty("spreadsheetID");
  const rosterSheet = SpreadsheetApp.openById(spreadsheetID)
    .getSheetByName("Roster");
  const lastRow = rosterSheet.getLastRow();
  let dataMatrix = [];

  // if no band practice event on calendar do nothing
  if (practiceEvent === undefined) {
    return;
  }

  // clear old values from roster sheet
  rosterSheet.getRange(2, 1, lastRow - 1, 2).clearContent();

  // get event attendees' emails and statuses
  practiceEvent.getGuestList()
    .forEach(guest => {
      const email = guest.getEmail();
      const status = guest.getGuestStatus().toString();
      dataMatrix.push([[email], [status]]);
    });

  // update spreadsheet roster with event attendees' emails and statuses
  rosterSheet.getRange(2, 1, dataMatrix.length, 2).setValues(dataMatrix);

  sendMail(dataMatrix);
}
