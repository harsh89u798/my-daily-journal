document.getElementById("loginForm").onsubmit = function(e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const password = document.getElementById("password").value;

  const user = { username, email, phone };
  localStorage.setItem("user", JSON.stringify(user));

  // In real-world you'd validate credentials
  window.location.href = "journal.html";
};
