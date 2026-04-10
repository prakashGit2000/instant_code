const CONFIG = {
  API_URL: "https://script.google.com/macros/s/AKfycbyCJWvSfe1N0tzvNHjs6zYLeGT0u0hoosap4KY4pimlxpWIiCCEf2Bv_sPMdjMZJT3SjA/exec"
};

let questions = [];
let currentIndex = 0;
let emailGlobal = "";

function startTest() {
  emailGlobal = document.getElementById("email").value;

  fetch(CONFIG.API_URL, {
    method: "POST",
    body: JSON.stringify({ action: "getQuestions" })
  })
  .then(res => res.json())
  .then(qList => {
    questions = qList;
    loadQuestion();
  });
}

function loadQuestion() {
  let qid = questions[currentIndex];

  fetch(CONFIG.API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "start",
      email: emailGlobal,
      qid: qid
    })
  })
  .then(res => res.json())
  .then(data => {

    if (!data.allowed) {
      alert("Not allowed or already attempted");
      return;
    }

    document.getElementById("questionBox").classList.remove("hidden");
    document.getElementById("question").innerText = data.problem;

    let sampleHTML = "";
    data.samples.forEach(s => {
      sampleHTML += `<p>${s.input} → ${s.output}</p>`;
    });

    document.getElementById("samples").innerHTML = sampleHTML;

    startTimer(data.time);
  });
}

function submitCode() {
  let code = document.getElementById("code").value;
  let lang = document.getElementById("language").value;

  let qid = questions[currentIndex];

  fetch(CONFIG.API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "submit",
      email: emailGlobal,
      qid: qid,
      code: code,
      language: lang
    })
  })
  .then(res => res.json())
  .then(data => {

    if (data.error) {
      alert(data.error);
      return;
    }

    alert(`Marks: ${data.marks}/${data.total}`);

    currentIndex++;

    if (currentIndex < questions.length) {
      loadQuestion();
    } else {
      alert("Test Completed 🎉");
    }
  });
}
