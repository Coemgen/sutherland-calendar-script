/* global ScriptApp */

// eslint-disable-next-line no-unused-vars
function setScriptTriggers() {
  ScriptApp.getProjectTriggers()
    .forEach(trigger => ScriptApp.deleteTrigger(trigger));

  // Runs between 6am-7am in the timezone of the script
  ScriptApp.newTrigger("__createPracticeEvent")
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(6)
    .everyWeeks(1) // Frequency is required if you are using atHour() or nearMinute()
    .create();

  // Runs between 5pm-6pm in the timezone of the script
  ScriptApp.newTrigger("__updateSpreadsheetStatuses")
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.THURSDAY)
    .atHour(17)
    .everyWeeks(1) // Frequency is required if you are using atHour() or nearMinute()
    .create();
}
