/* global PropertiesService, SpreadsheetApp,_Calendar, _Utils */

// eslint-disable-next-line no-unused-vars
const _Spreadsheet = (
  function () {
    "use strict";

    function updateStatuses() {
      const practiceEvent = _Calendar.getEvent("practice");
      const spreadsheetID = PropertiesService.getScriptProperties()
        .getProperty("spreadsheetID");
      const rosterSheet = SpreadsheetApp.openById(spreadsheetID)
        .getSheetByName("Roster");
      const lastRow = rosterSheet.getLastRow();
      let dataMatrix = [];

      // clear old values from roster sheet
      if (lastRow > 1) {
        rosterSheet.getRange(2, 1, lastRow - 1, 2).clearContent();
      }

      // if no band practice event on calendar do nothing
      if (practiceEvent === undefined) {
        return;
      }

      // get event attendees' emails and statuses
      practiceEvent.getGuestList()
        .forEach(guest => {
          const email = guest.getEmail();
          const status = guest.getGuestStatus().toString();
          dataMatrix.push([[email], [status]]);
        });

      // update spreadsheet roster with event attendees' emails and statuses
      rosterSheet.getRange(2, 1, dataMatrix.length, 2).setValues(dataMatrix);

      _Utils.sendMail(dataMatrix);
    }

    return Object.freeze({
      updateStatuses
    });
  }
)();
