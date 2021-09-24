/* eslint-disable no-unused-vars */
/* global _Calendar, _Spreadsheet */

function _createPracticeEvent() {
  _Calendar.addEvent("practice");
}

function _updateSpreadsheetStatuses() {
  _Spreadsheet.updateStatuses();
}

function deleteEvent() {
  const practiceEvent = _Calendar.getEvent("practice");

  if (practiceEvent !== undefined) {
    practiceEvent.deleteEvent();
  }
}
