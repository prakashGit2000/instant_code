
const SHEET_ID = "https://script.google.com/macros/s/AKfycbyCJWvSfe1N0tzvNHjs6zYLeGT0u0hoosap4KY4pimlxpWIiCCEf2Bv_sPMdjMZJT3SjA/exec";

function doPost(e) {

  const ss = SpreadsheetApp.openById(SHEET_ID);

  const data = JSON.parse(e.postData.contents);

  const questionsSheet = ss.getSheetByName("Questions");
  const attemptsSheet = ss.getSheetByName("Attempts");
  const allowedSheet = ss.getSheetByName("Allowed");

  const questions = questionsSheet.getDataRange().getValues();
  const attempts = attemptsSheet.getDataRange().getValues();
  const allowed = allowedSheet.getDataRange().getValues();

  if (data.action === "getQuestions") {

    let qids = [];

    for (let i = 1; i < questions.length; i++) {
      qids.push(questions[i][0]);
    }

    return jsonOutput(qids);
  }

  if (data.action === "start") {

    let emailAllowed = false;

    for (let i = 1; i < allowed.length; i++) {
      if (allowed[i][0] === data.email) {
        emailAllowed = true;
      }
    }

    if (!emailAllowed) {
      return jsonOutput({
        allowed: false
      });
    }

    for (let i = 1; i < attempts.length; i++) {
      if (
        attempts[i][0] === data.email &&
        attempts[i][1] === data.qid
      ) {
        return jsonOutput({
          allowed: false
        });
      }
    }

    for (let i = 1; i < questions.length; i++) {

      if (questions[i][0] === data.qid) {

        const sampleString = questions[i][2];

        const sampleParts = sampleString.split("|");

        let samples = [];

        sampleParts.forEach(s => {

          const temp = s.split("=");

          samples.push({
            input: temp[0],
            output: temp[1]
          });

        });

        return jsonOutput({
          allowed: true,
          problem: questions[i][1],
          samples: samples,
          time: questions[i][3]
        });
      }
    }
  }

  if (data.action === "submit") {

    attemptsSheet.appendRow([
      data.email,
      data.qid,
      data.code,
      data.language,
      0,
      new Date()
    ]);

    return jsonOutput({
      marks: 0,
      total: 100
    });
  }

  return jsonOutput({
    error: "Invalid Action"
  });
}

function jsonOutput(obj) {

  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
