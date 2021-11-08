/*global ScriptApp */

// eslint-disable-next-line no-unused-vars
function setScriptTriggers() {
  ScriptApp.getProjectTriggers()
    .forEach(trigger => ScriptApp.deleteTrigger(trigger));

  // Runs between 12n-1pm in the timezone of the script
  ScriptApp.newTrigger("createPracticeEvent")
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.SUNDAY)
    .atHour(12)
    .everyWeeks(1)  // Frequency is required if you are using atHour() or nearMinute()
    .create();

  // Runs between 5pm-6pm in the timezone of the script
  ScriptApp.newTrigger("updateSpreadsheetStatuses")
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.WEDNESDAY)
    .atHour(21)
    .everyWeeks(1)  // Frequency is required if you are using atHour() or nearMinute()
    .create();
}
