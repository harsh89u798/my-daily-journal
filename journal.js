window.onload = function () {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) window.location.href = "index.html";

  showEntries();

  const toggle = document.getElementById("themeToggle");
  toggle.checked = localStorage.getItem("theme") === "dark";
  applyTheme(toggle.checked);

  toggle.addEventListener("change", () => {
    applyTheme(toggle.checked);
    localStorage.setItem("theme", toggle.checked ? "dark" : "light");
  });

  document.getElementById("settingsBtn").onclick = () => {
    const menu = document.getElementById("settingsMenu");
    menu.style.display = menu.style.display === "block" ? "none" : "block";
  };
};

function applyTheme(isDark) {
  document.body.classList.toggle("dark-mode", isDark);
}

function saveEntry() {
  const entryText = document.getElementById("entry").value.trim();
  if (!entryText) return alert("Please write something!");

  const date = new Date().toLocaleString();
  const entry = { date, text: entryText };

  const journal = JSON.parse(localStorage.getItem("journal") || "[]");
  journal.unshift(entry);
  localStorage.setItem("journal", JSON.stringify(journal));

  document.getElementById("entry").value = "";
  showEntries();
}

function showEntries() {
  const journal = JSON.parse(localStorage.getItem("journal") || "[]");
  const list = document.getElementById("entriesList");
  list.innerHTML = "";

  journal.slice(0, 2).forEach(entry => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${entry.date}</strong><br>${entry.text}`;
    list.appendChild(li);
  });
}

function viewAll() {
  alert("This will be implemented later. For now, it’s a placeholder.");
}
