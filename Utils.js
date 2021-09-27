/*global PropertiesService, MailApp, SpreadsheetApp */

// eslint-disable-next-line no-unused-vars
const Utils = (
  function () {
    "use strict";

    function getPracticeDateObject(time, dow) {
      const practiceDow = PropertiesService.getScriptProperties()
        .getProperty("practiceDow");
      const dt = new Date();

      // set practice to practiceDow of the current week
      dt.setDate(dt.getDate() + (practiceDow - dow));
      dt.setMinutes(0);
      dt.setSeconds(0);
      dt.setHours(time);

      return dt;
    }

    function getContactsStr() {
      const contactsSSheetId = PropertiesService.getScriptProperties()
        .getProperty("sutherlandContactsSsID");
      const contactsSheet = SpreadsheetApp.openById(contactsSSheetId)
        .getSheetByName("Contact List");
      const contactsMatrix = contactsSheet.getDataRange().getValues();
      const contactsArr = contactsMatrix.filter((row) => row[2] === "Y")
        .map((row) => row[5]);

      return contactsArr.toString();
    }

    function sendMail(dataMatrix) {
      const yesCount = dataMatrix.filter((row) => row[1][0] === "YES").length;
      const props = PropertiesService.getScriptProperties()
        .getProperties();
      const recipient = props.pipeMajor;
      const spreadsheetID = props.spreadsheetID;
      const spreadsheetURL = encodeURI(
        `https://docs.google.com/spreadsheets/d/${spreadsheetID}/edit#gid=0`
      );
      const spreadsheetName = SpreadsheetApp.openById(spreadsheetID).getName();
      const subject = "Sutherland Pipe Band confirmed attendees: " + yesCount;
      const body = spreadsheetName + "\n" + spreadsheetURL;
      const htmlBody = `<a href="${spreadsheetURL}">${spreadsheetName}</a>`;
      const options = {
        htmlBody
      };

      MailApp.sendEmail(recipient, subject, body, options);
    }

    return Object.freeze({
      getContactsStr,
      getPracticeDateObject,
      sendMail
    });
  }());
