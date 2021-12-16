/*global CalendarApp, PropertiesService, SpreadsheetApp, Utils*/

// eslint-disable-next-line no-unused-vars
const Calendar = (
  function () {
    "use strict";

    function getActiveEvent(eventType) {
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
        (ev) => ev.getTag("eventType") === eventType
      )[0];

      return practiceEvent;
    }

    function _getPlaceholderEvent(myCal, startTime, endTime, eventType) {
      const placeholderEvents = myCal.getEvents(startTime, endTime);
      // assuming only one practice event scheduled
      return placeholderEvents.filter(
        (event) => event.getTitle() === "Sutherland rehearsal"
        && event.getTag("eventType") !== eventType
      )[0];
    }

    // eslint-disable-next-line max-statements
    function addEvent(eventType) {
      const props = PropertiesService.getScriptProperties()
        .getProperties();
      const practiceDow = props.practiceDow;
      const title = props.eventTitle;
      const practiceStartTime = props.practiceStartTime;
      const practiceEndTime = props.practiceEndTime;
      const dt = new Date();
      const dow = dt.getDay(); // Sunday - Saturday : 0 - 6
      const startTime = Utils.getPracticeDateObject(
        practiceStartTime,
        dow
      );
      const endTime = Utils.getPracticeDateObject(
        practiceEndTime,
        dow
      );
      const description = props.eventDescription;
      const location = props.eventLocation;
      const calendarID = props.calendarID;
      const myCal = CalendarApp.getCalendarById(calendarID);
      let newEvent = {};
      const placeholderEvent = _getPlaceholderEvent(
        myCal, startTime, endTime, eventType
      );
      const spreadsheetID = props.spreadsheetID;
      const rosterSheet = SpreadsheetApp.openById(spreadsheetID)
        .getSheetByName("Roster");
      const rosterStr = Utils.getContactsStr();
      const options = {
        description,
        guests: rosterStr,
        location,
        sendInvites: true
      };

      // don't create events after practiceDow of the current week
      if (dow > practiceDow) {
        return;
      }

      // don't create event unless there's a placeholder event on calendar
      if (placeholderEvent == undefined) { // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Equality
        return;
      }

      placeholderEvent.deleteEvent();

      // clear statuses
      rosterSheet.getRange("Roster!A2:B").clearContent();

      newEvent = myCal.createEvent(
        title,
        startTime,
        endTime,
        options
      );
      newEvent.removeAllReminders();
      newEvent.setTag("eventType", eventType);
    }

    return Object.freeze({
      addEvent,
      getEvent: getActiveEvent
    });
  }());
