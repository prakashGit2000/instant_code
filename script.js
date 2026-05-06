// script.js

const CONFIG = {

  API_URL:
  "https://script.google.com/macros/s/AKfycbyCJWvSfe1N0tzvNHjs6zYLeGT0u0hoosap4KY4pimlxpWIiCCEf2Bv_sPMdjMZJT3SjA/exec"

};

let editor;

let questions = [];

let currentIndex = 0;

let emailGlobal = "";

let timerInterval;

let currentQuestionId = "";

window.onload = function(){

  editor = ace.edit("editor");

  editor.setTheme("ace/theme/monokai");

  editor.session.setMode("ace/mode/java");

  editor.setValue(
`public class Main {

    public static void main(String[] args) {

        System.out.println("Hello World");

    }

}`
  );

};

function startTest(){

  emailGlobal = document.getElementById("email").value;

  if(emailGlobal.trim() === ""){

    alert("Enter Email");

    return;
  }

  fetch(CONFIG.API_URL, {

    method:"POST",

    body:JSON.stringify({

      action:"getQuestions"

    })

  })
  .then(res => res.json())
  .then(data => {

    questions = data;

    currentIndex = 0;

    loadQuestion();

  });

}

function loadQuestion(){

  if(currentIndex >= questions.length){

    alert("Test Completed");

    return;
  }

  currentQuestionId = questions[currentIndex];

  fetch(CONFIG.API_URL, {

    method:"POST",

    body:JSON.stringify({

      action:"start",

      email:emailGlobal,

      qid:currentQuestionId

    })

  })
  .then(res => res.json())
  .then(data => {

    if(!data.allowed){

      alert("Not Allowed / Already Submitted");

      currentIndex++;

      loadQuestion();

      return;
    }

    document.getElementById("questionTitle").innerText =
      data.problem;

    document.getElementById("questionNumber").innerText =
      "Question: " + currentQuestionId;

    document.getElementById("questionText").innerText =
      data.problem;

    let html = "";

    data.samples.forEach(s => {

      html += `
      <div class="sample-box">

        <b>Input:</b>
        <br>
        ${s.input}

        <br><br>

        <b>Output:</b>
        <br>
        ${s.output}

      </div>
      `;

    });

    document.getElementById("samples").innerHTML = html;

    startTimer(data.time * 60);

    document.getElementById("output").innerText =
      "Question Loaded Successfully";

  });

}

function startTimer(seconds){

  clearInterval(timerInterval);

  let timeLeft = seconds;

  updateTimer(timeLeft);

  timerInterval = setInterval(() => {

    timeLeft--;

    updateTimer(timeLeft);

    if(timeLeft <= 0){

      clearInterval(timerInterval);

      submitCode();
    }

  },1000);

}

function updateTimer(seconds){

  let min = Math.floor(seconds / 60);

  let sec = seconds % 60;

  min = min < 10 ? "0" + min : min;

  sec = sec < 10 ? "0" + sec : sec;

  document.getElementById("timer").innerText =
    `${min}:${sec}`;

}

function getLanguageVersion(language){

  if(language === "java") return "5";

  if(language === "python3") return "4";

  if(language === "cpp17") return "0";

}

function getAceMode(language){

  if(language === "java") return "ace/mode/java";

  if(language === "python3") return "ace/mode/python";

  if(language === "cpp17") return "ace/mode/c_cpp";

}

document.addEventListener("DOMContentLoaded", () => {

  document.getElementById("language")
  .addEventListener("change", function(){

    editor.session.setMode(
      getAceMode(this.value)
    );

  });

});

function runCode(){

  const language =
    document.getElementById("language").value;

  const code = editor.getValue();

  document.getElementById("output").innerText =
    "Compiling...";

  fetch(CONFIG.API_URL, {

    method:"POST",

    body:JSON.stringify({

      action:"submit",

      email:"compile@temp.com",

      qid:currentQuestionId,

      code:code,

      language:language

    })

  })
  .then(res => res.json())
  .then(data => {

    document.getElementById("output").innerText =
      `Passed: ${data.marks}/${data.total}`;

  })
  .catch(err => {

    document.getElementById("output").innerText =
      err;

  });

}

function submitCode(){

  const language =
    document.getElementById("language").value;

  const code = editor.getValue();

  document.getElementById("output").innerText =
    "Submitting...";

  fetch(CONFIG.API_URL, {

    method:"POST",

    body:JSON.stringify({

      action:"submit",

      email:emailGlobal,

      qid:currentQuestionId,

      code:code,

      language:language

    })

  })
  .then(res => res.json())
  .then(data => {

    document.getElementById("output").innerText =
      `Final Score: ${data.marks}/${data.total}`;

    alert(
      `Marks: ${data.marks}/${data.total}`
    );

  });

}

function nextQuestion(){

  currentIndex++;

  loadQuestion();

}
