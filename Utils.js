const _Utils = (function myFunction(MailApp, PropertiesService, SpreadsheetApp) {
  "use strict";

  function getContactsStr() {
    const contactsSSheetId = PropertiesService.getScriptProperties()
      .getProperty("sutherlandContactsSsID");
    const contactsSheet = SpreadsheetApp.openById(contactsSSheetId)
      .getSheetByName("Contact List");
    const contactsMatrix = contactsSheet.getDataRange().getValues();
    const contactsArr = contactsMatrix.filter(row => row[2] === "Y")
      .map(row => row[5]);

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
      htmlBody: htmlBody
    };

    MailApp.sendEmail(recipient, subject, body, options);
  }

  return Object.freeze({
    getContactsStr,
    sendMail
  });
})(MailApp, PropertiesService, SpreadsheetApp);
