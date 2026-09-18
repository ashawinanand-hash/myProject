let speak = document.querySelectorAll(".speak");
let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

recognition.lang = "en-US";
recognition.interimResults = false;
recognition.maxAlternatives = 1;

let input;

for (let i = 0; i < speak.length; i++) {
  speak[i].addEventListener("click", function () {
    input = speak[i].parentElement.querySelector("input,textarea");
    recognition.start();
  });
}

recognition.onresult = function (event) {
  let result = event.results[0][0].transcript;

  if (input.id == "email") {
    result = result.toLowerCase();
    result = result.replace(/\s+at\s+the\s+rate\s+/g, "@");
    result = result.replace(/\s+dot\s+/g, ".");
    result = result.replace(/\s+/g, "");
  }

  if (input.id == "Contactno") {
    result = result.replace(/\D/g, "");

   
    let errorEl = document.getElementById("contact-error");
    if (errorEl) errorEl.remove();

    if (result.length !== 10) {
      let error = document.createElement("p");
      error.id = "contact-error";
      error.style.color = "red";
      error.style.fontStyle = "italic";
      error.style.fontSize = "13px";
      error.textContent = "*Invalid Contact";
      input.parentElement.appendChild(error);
    }
  }

  if (input.id === "dob") {
    let cleaned = result.replace(/[^\d]+/g, "/").replace(/^\/|\/$/g, "");
    let date = cleaned.split("/").filter(Boolean);

    if (date.length === 3) {
      let day = date[0].padStart(2, "0");
      let month = date[1].padStart(2, "0");
      let year = date[2].length === 2 ? "20" + date[2] : date[2];

      let iso = `${year}-${month}-${day}`;
      let d = new Date(iso);

      if (!isNaN(d.getTime()) && d.toISOString().slice(0, 10) === iso) {
        result = iso; // <-- key fix: update result, not input.value directly
      } else {
        console.warn("Invalid date parsed from speech:", cleaned);
      }
    } else {
      console.warn("Could not find 3 date parts in:", cleaned);
    }
  }

  input.value = result;
};


document.querySelector("form").addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = {
    sname: document.getElementById("sname").value,
    fname: document.getElementById("fname").value,
    mname: document.getElementById("mname").value,
    Contactno: document.getElementById("Contactno").value,
    email: document.getElementById("email").value,
    dob: document.getElementById("dob").value,
    address: document.getElementById("address").value,
  };

  fetch("http://localhost:3000/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        alert("✅ " + data.message);
        document.querySelector("form").reset();
      } else {
        alert("❌ " + data.message);
      }
    })
    .catch((err) => {
      console.error("Request failed:", err);
      alert("❌ Could not reach server. Is it running?");
    });
});