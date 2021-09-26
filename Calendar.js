/* global CalendarApp, PropertiesService, SpreadsheetApp, _Utils */

// eslint-disable-next-line no-unused-vars
const _Calendar = (
  function () {
    "use strict";

    function getEvent(eventType) {
      const props = PropertiesService.getScriptProperties()
        .getProperties();
      const practiceDow = props.practiceDow;
      const calendarID = props.calendarID;
      const myCal = CalendarApp.getCalendarById(calendarID);
      const tdy = new Date();
      const dow = tdy.getDay(); // Sunday - Saturday : 0 - 6
      const practiceDate = new Date(
        tdy.setDate(tdy.getDate() + (practiceDow - dow))
      );
      const myEvents = myCal.getEventsForDay(practiceDate);
      // assuming only one practice event scheduled
      const practiceEvent = myEvents.filter(
        ev => ev.getTag("eventType") === eventType
      )[0];

      return practiceEvent;
    }

    function addEvent(eventType) {
      const props = PropertiesService.getScriptProperties()
        .getProperties();
      const practiceDow = props.practiceDow;
      const title = props.eventTitle;
      const practiceStartTime = props.practiceStartTime;
      const practiceEndTime = props.practiceEndTime;
      const dt = new Date();
      const dow = dt.getDay(); // Sunday - Saturday : 0 - 6
      const startTime = _Utils.getPracticeDateObject(
        practiceStartTime,
        dow
      );
      const endTime = _Utils.getPracticeDateObject(
        practiceEndTime,
        dow
      );
      const description = props.eventDescription;
      const location = props.eventLocation;
      const calendarID = props.calendarID;
      const myCal = CalendarApp.getCalendarById(calendarID);
      let myEvent = {};
      const placeholderEvents = myCal.getEvents(startTime, endTime);
      // assuming only one practice event scheduled
      const placeholderEvent = placeholderEvents.filter(
        event => event.getTitle() === "Sutherland rehearsal"
          && event.getTag("eventType") !== eventType
      )[0];
      const spreadsheetID = props.spreadsheetID;
      const rosterSheet = SpreadsheetApp.openById(spreadsheetID)
        .getSheetByName("Roster");
      const rosterStr = _Utils.getContactsStr();
      const options = {
        description: description,
        location: location,
        guests: rosterStr,
        sendInvites: true
      };

      // don't create events after practiceDow of the current week
      if (dow > practiceDow) {
        return;
      }

      // don't create event unless there's a placeholder event on calendar
      if (placeholderEvent === undefined) {
        return;
      } else {
        placeholderEvent.deleteEvent();
      }

      // clear statuses
      rosterSheet.getRange("Roster!A2:B").clearContent();

      myEvent = myCal.createEvent(
        title,
        startTime,
        endTime,
        options
      );
      myEvent.removeAllReminders();
      myEvent.setTag("eventType", eventType);
    }

    return Object.freeze({
      addEvent,
      getEvent
    });
  }
)();
