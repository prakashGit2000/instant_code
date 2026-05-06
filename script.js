// script.js

const CONFIG = {

  API_URL:
  "https://script.google.com/macros/s/AKfycbxWDgTgEAhPhSXZGmgjNJ4G23LC71g7nfmqEzuncnUN5YGeLFwYIYi5amCRmLErkKHA9A/exec"

};

let editor;

let questions = [];

let currentIndex = 0;

let emailGlobal = "";

let timerInterval;

let currentQuestionId = "";

window.onload = function () {

  editor = ace.edit("editor");

  editor.setTheme("ace/theme/monokai");

  editor.session.setMode("ace/mode/java");

  editor.setOptions({

    fontSize: "16px"

  });

  editor.setValue(
`public class Main {

    public static void main(String[] args) {

        System.out.println("Hello World");

    }

}`
  );

  editor.clearSelection();

};

function startTest() {

  emailGlobal =
    document.getElementById("email").value.trim();

  if (emailGlobal === "") {

    alert("Enter Email");

    return;
  }

  document.getElementById("output").innerText =
    "Loading Questions...";

  fetch(CONFIG.API_URL, {

    method: "POST",

    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },

    body: JSON.stringify({

      action: "getQuestions"

    })

  })
  .then(res => res.json())
  .then(data => {

    if(data.error){

      alert(data.error);

      return;
    }

    questions = data;

    currentIndex = 0;

    loadQuestion();

  })
  .catch(err => {

    console.log(err);

    alert(
      "Backend Connection Failed"
    );

    document.getElementById("output").innerText =
      "Backend Connection Failed";

  });

}

function loadQuestion() {

  if (currentIndex >= questions.length) {

    clearInterval(timerInterval);

    alert("Test Completed");

    document.getElementById("output").innerText =
      "All Questions Completed";

    return;
  }

  currentQuestionId = questions[currentIndex];

  document.getElementById("output").innerText =
    "Loading Question...";

  fetch(CONFIG.API_URL, {

    method: "POST",

    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },

    body: JSON.stringify({

      action: "start",

      email: emailGlobal,

      qid: currentQuestionId

    })

  })
  .then(res => res.json())
  .then(data => {

    if(data.error){

      alert(data.error);

      return;
    }

    if (!data.allowed) {

      alert(
        "Not Allowed / Already Submitted"
      );

      currentIndex++;

      loadQuestion();

      return;
    }

    document.getElementById("questionTitle").innerText =
      data.problem;

    document.getElementById("questionNumber").innerText =
      "Question ID: " + currentQuestionId;

    document.getElementById("questionText").innerText =
      data.problem;

    let html = "";

    data.samples.forEach(s => {

      html += `
      <div class="sample-box">

        <b>Input:</b>

        <pre>${s.input}</pre>

        <b>Output:</b>

        <pre>${s.output}</pre>

      </div>
      `;

    });

    document.getElementById("samples").innerHTML =
      html;

    startTimer(data.time * 60);

    document.getElementById("output").innerText =
      "Question Loaded Successfully";

  })
  .catch(err => {

    console.log(err);

    alert(
      "Question Loading Failed"
    );

    document.getElementById("output").innerText =
      "Question Loading Failed";

  });

}

function startTimer(seconds) {

  clearInterval(timerInterval);

  let timeLeft = seconds;

  updateTimer(timeLeft);

  timerInterval = setInterval(() => {

    timeLeft--;

    updateTimer(timeLeft);

    if (timeLeft <= 0) {

      clearInterval(timerInterval);

      alert("Time Up");

      submitCode();
    }

  }, 1000);

}

function updateTimer(seconds) {

  let min = Math.floor(seconds / 60);

  let sec = seconds % 60;

  min = min < 10 ? "0" + min : min;

  sec = sec < 10 ? "0" + sec : sec;

  document.getElementById("timer").innerText =
    `${min}:${sec}`;

}

function getAceMode(language) {

  if (language === "java")
    return "ace/mode/java";

  if (language === "python3")
    return "ace/mode/python";

  if (language === "cpp17")
    return "ace/mode/c_cpp";

}

document.addEventListener("DOMContentLoaded", () => {

  document.getElementById("language")
  .addEventListener("change", function () {

    editor.session.setMode(
      getAceMode(this.value)
    );

  });

});

function runCode() {

  const language =
    document.getElementById("language").value;

  const code =
    editor.getValue();

  document.getElementById("output").innerText =
    "Compiling...";

  fetch(CONFIG.API_URL, {

    method: "POST",

    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },

    body: JSON.stringify({

      action: "compile",

      code: code,

      language: language,

      qid: currentQuestionId

    })

  })
  .then(res => res.json())
  .then(data => {

    let outputText = "";

    // COMPILER ERROR
    if (!data.success) {

      outputText +=
        "COMPILER ERROR\n\n";

      outputText +=
        data.compilerError;

      document.getElementById("output").innerText =
        outputText;

      return;
    }

    // SAMPLE RESULTS
    outputText +=
      "SAMPLE TEST CASES\n";

    outputText +=
      "Passed: " +
      data.samplePassed +
      "/" +
      data.sampleTotal +
      "\n\n";

    data.sampleResults.forEach((t,index) => {

      outputText +=
        "Sample Test Case " +
        (index + 1) +
        " : " +
        (t.passed ? "PASS" : "FAIL") +
        "\n";

      outputText +=
        "Input:\n" +
        t.input +
        "\n\n";

      outputText +=
        "Expected:\n" +
        t.expected +
        "\n\n";

      outputText +=
        "Your Output:\n" +
        t.output +
        "\n\n";

    });

    // HIDDEN RESULTS
    outputText +=
      "\nHIDDEN TEST CASES\n";

    outputText +=
      "Passed: " +
      data.hiddenPassed +
      "/" +
      data.hiddenTotal +
      "\n\n";

    data.hiddenResults.forEach((t,index) => {

      outputText +=
        "Hidden Test Case " +
        (index + 1) +
        " : " +
        (t.passed ? "PASS" : "FAIL") +
        "\n";

    });

    document.getElementById("output").innerText =
      outputText;

  })
  .catch(err => {

    console.log(err);

    document.getElementById("output").innerText =
      err.toString();

  });

}

function submitCode() {

  const language =
    document.getElementById("language").value;

  const code =
    editor.getValue();

  document.getElementById("output").innerText =
    "Submitting...";

  fetch(CONFIG.API_URL, {

    method: "POST",

    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },

    body: JSON.stringify({

      action: "submit",

      email: emailGlobal,

      qid: currentQuestionId,

      code: code,

      language: language

    })

  })
  .then(res => res.json())
  .then(data => {

    if (data.error) {

      alert(data.error);

      document.getElementById("output").innerText =
        data.error;

      return;
    }

    let finalText = "";

    finalText +=
      "Marks: " +
      data.marks +
      "/" +
      data.total +
      "\n\n";

    finalText +=
      "Passed Hidden Test Cases: " +
      data.passed +
      "/" +
      data.totalCases +
      "\n\n";

    if(data.testcaseResults){

      data.testcaseResults.forEach((t,index) => {

        finalText +=
          "Test Case " +
          (index + 1) +
          " : " +
          (t.passed ? "PASS" : "FAIL") +
          "\n";

      });

    }

    document.getElementById("output").innerText =
      finalText;

    alert(
      `Marks: ${data.marks}/${data.total}`
    );

  })
  .catch(err => {

    console.log(err);

    alert(
      "Submission Failed"
    );

    document.getElementById("output").innerText =
      "Submission Failed";

  });

}

function nextQuestion() {

  currentIndex++;

  loadQuestion();

}
