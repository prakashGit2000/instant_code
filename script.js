let currentQ = "Q1";

function startTest() {
  let email = document.getElementById("email").value;

  fetch("YOUR_WEBAPP_URL", {
    method: "POST",
    body: JSON.stringify({
      action: "start",
      email: email,
      qid: currentQ
    })
  })
  .then(res => res.json())
  .then(data => {

    if (!data.allowed) {
      alert("Not approved or already attempted");
      return;
    }

    document.getElementById("questionBox").classList.remove("hidden");
    document.getElementById("question").innerText = data.problem;

    let sampleHTML = "";
    data.samples.forEach(s => {
      sampleHTML += `<p>Input: ${s.input} → Output: ${s.output}</p>`;
    });

    document.getElementById("samples").innerHTML = sampleHTML;

    startTimer(data.time);
  });
}

function startTimer(minutes) {
  let time = minutes * 60;

  const timer = setInterval(() => {
    let min = Math.floor(time / 60);
    let sec = time % 60;

    document.getElementById("timer").innerText =
      min + ":" + (sec < 10 ? "0" : "") + sec;

    if (time <= 0) {
      clearInterval(timer);
      autoSubmit();
    }

    time--;
  }, 1000);
}

function submitCode() {
  let email = document.getElementById("email").value;
  let code = document.getElementById("code").value;
  let lang = document.getElementById("language").value;

  fetch("YOUR_WEBAPP_URL", {
    method: "POST",
    body: JSON.stringify({
      action: "submit",
      email: email,
      qid: currentQ,
      code: code,
      language: lang
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      alert(data.error);
    } else {
      alert("Marks: " + data.marks + "/" + data.total);
    }
  });
}

function autoSubmit() {
  submitCode();
}
