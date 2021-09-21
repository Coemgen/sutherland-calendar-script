/* global CalendarApp, SpreadsheetApp */

const $EVENT_UID = "1tc38to4mc6csemcnaa359u4dp@google.com";
const $CALENDAR_ID = "kevin.griffin@lowerfallsweb.com";
const $SPREADSHEET_ID = "1Zr67fnglB8l3FEKLwidsNKO_bLGq26SANeA-SMz4eII";
const $PRACTICE_START_TIME = 17;
const $PRACTICE_END_TIME = 19;
const $PIPE_MAJOR = "kevin.griffin@gmail.com";

function sendMail(dataMatrix) {
  const yesCount = dataMatrix.filter((row) => row[1][0] === "YES").length;
  MailApp.sendEmail($PIPE_MAJOR,
    "Sutherland Pipe Band confirmed attendees: " + yesCount,
    `https://docs.google.com/spreadsheets/d/${$SPREADSHEET_ID}/edit#gid=0`);
}

function getPractiveEvent() {
  const myCal = CalendarApp.getCalendarById($CALENDAR_ID);
  const tdy = new Date();
  const year = tdy.getFullYear();
  const month = tdy.getMonth();
  const date = tdy.getDate();
  const weekDay = tdy.getDay(); // 0-6
  const offset = 4 - weekDay; // number of days to or from Thursday (day 4)
  const startTime = new Date(year, month, date + offset, $PRACTICE_START_TIME);
  const endTime = new Date(year, month, date + offset, $PRACTICE_END_TIME);
  const myEvents = myCal.getEvents(startTime, endTime);
  // assuming only one practice event scheduled
  const practiceEvent = myEvents.filter(
    (ev) => {
      const iCalUID = ev.getId();
      const eventID = iCalUID.match(/([a-zA-Z0-9]*)(_R[0-9]{8}T[0-9]{6})?(@google.com)/);
      
      return $EVENT_UID === eventID[1] + eventID[3];
    }
  )[0];

  return practiceEvent;
}

// eslint-disable-next-line no-unused-vars
function __addRosterToEvent() {
  const practiceEvent = getPractiveEvent();
  const rosterSheet = SpreadsheetApp.openById($SPREADSHEET_ID)
    .getSheetByName("Roster");
  const lastRow = rosterSheet.getLastRow();
  const rosterSheetRange = rosterSheet.getRange(2, 1, lastRow - 1, 2);
  const rosterArr = rosterSheetRange.getValues()
    .map((member) => member[0]).filter((member) => member);
  const attendeesObj = practiceEvent.getGuestList();
  const attendeesArr = Array.from(attendeesObj)
    .map((attendee) => attendee.getEmail());

  // if no band practice event on calendar do nothing
  if (practiceEvent === undefined) {
    return;
  }

  // add attendees to event from roster
  rosterArr.forEach((member) => {
    if (attendeesArr.find((attendee) => attendee === member) === undefined) {
      practiceEvent.addGuest(member);
    }
  });

}

/**
 * For each member in roster, find practiceEvent status then update roster
 * column B with status.
 */
// eslint-disable-next-line no-unused-vars
function __updateSpreadsheetStatuses() {
  const practiceEvent = getPractiveEvent();
  const rosterSheet = SpreadsheetApp.openById($SPREADSHEET_ID)
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
