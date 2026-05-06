const CONFIG = {

  SHEET_ID: "https://script.google.com/macros/s/AKfycbyCJWvSfe1N0tzvNHjs6zYLeGT0u0hoosap4KY4pimlxpWIiCCEf2Bv_sPMdjMZJT3SjA/exec",

  JDOODLE_CLIENT_ID: "9491bccf73d58219a773cb4b36d7432a",

  JDOODLE_CLIENT_SECRET: "ab5635380d4487d3a48432cf97441ba083d0c06fb836660ec5ce6d6b70675e40"

};

let editor;

let currentQuestion = null;

let timerInterval;

let timeLeft = 0;

window.onload = function () {

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

function startTest() {

  const email = document.getElementById("email").value;

  if(email.trim() === ""){

    alert("Enter Email");

    return;
  }

  fetch(CONFIG.SHEET_ID, {

    method:"POST",

    body:JSON.stringify({

      action:"getQuestion",

      email:email

    })

  })
  .then(res => res.json())
  .then(data => {

    currentQuestion = data;

    document.getElementById("questionTitle").innerText = data.title || "Coding Question";

    document.getElementById("questionText").innerText = data.problem || "";

    let sampleHTML = "";

    if(data.samples){

      data.samples.forEach(s => {

        sampleHTML += `
        <div class="sample-box">
          <b>Input:</b><br>${s.input}<br><br>
          <b>Output:</b><br>${s.output}
        </div>
        `;

      });

    }

    document.getElementById("samples").innerHTML = sampleHTML;

    startTimer(data.time || 300);

  })
  .catch(err => {

    console.log(err);

    alert("Backend Error");

  });

}

function startTimer(seconds){

  clearInterval(timerInterval);

  timeLeft = seconds;

  updateTimer();

  timerInterval = setInterval(() => {

    timeLeft--;

    updateTimer();

    if(timeLeft <= 0){

      clearInterval(timerInterval);

      alert("Time Up");

      submitCode();
    }

  },1000);

}

function updateTimer(){

  let min = Math.floor(timeLeft / 60);

  let sec = timeLeft % 60;

  min = min < 10 ? "0" + min : min;

  sec = sec < 10 ? "0" + sec : sec;

  document.getElementById("timer").innerText = `${min}:${sec}`;

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

  const lang = document.getElementById("language");

  if(lang){

    lang.addEventListener("change", function(){

      editor.session.setMode(getAceMode(this.value));

    });

  }

});

function runCode(){

  const language = document.getElementById("language").value;

  const code = editor.getValue();

  document.getElementById("output").innerText = "Compiling...";

  fetch("https://api.jdoodle.com/v1/execute", {

    method:"POST",

    headers:{
      "Content-Type":"application/json"
    },

    body:JSON.stringify({

      clientId:CONFIG.JDOODLE_CLIENT_ID,

      clientSecret:CONFIG.JDOODLE_CLIENT_SECRET,

      script:code,

      language:language,

      versionIndex:getLanguageVersion(language)

    })

  })
  .then(res => res.json())
  .then(data => {

    document.getElementById("output").innerText =
      data.output || data.error || "No Output";

  })
  .catch(err => {

    document.getElementById("output").innerText = err;

  });

}

function submitCode(){

  const email = document.getElementById("email").value;

  const language = document.getElementById("language").value;

  const code = editor.getValue();

  fetch(CONFIG.SHEET_ID, {

    method:"POST",

    body:JSON.stringify({

      action:"submit",

      email:email,

      language:language,

      code:code

    })

  })
  .then(res => res.json())
  .then(data => {

    alert("Code Submitted Successfully");

  })
  .catch(err => {

    console.log(err);

  });

}
