/* eslint-disable no-unused-vars */
/*global Calendar, Spreadsheet */

function createPracticeEvent() {
  Calendar.addEvent("practice");
}

function updateSpreadsheetStatuses() {
  Spreadsheet.updateStatuses();
}

// function deleteEvent() {
//   const practiceEvent = Calendar.getEvent("practice");

//   if (practiceEvent !== undefined) {
//     practiceEvent.deleteEvent();
//   }
// }

// function removeGuest() {
//   Calendar.getEvent("practice")
//   .removeGuest("coemgen.griffin@verizon.net");
// }
