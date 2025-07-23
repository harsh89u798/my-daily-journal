document.getElementById('entryForm').addEventListener('submit', function (e) {
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\d{10}$/;

  if (!emailRegex.test(email)) {
    alert("Please enter a valid email address.");
    e.preventDefault();
    return;
  }

  if (!phoneRegex.test(phone)) {
    alert("Please enter a valid 10-digit phone number.");
    e.preventDefault();
    return;
  }

  // Save data to localStorage (optional)
  const entry = document.getElementById('entry').value;
  localStorage.setItem('journal', JSON.stringify({ email, phone, entry }));

  alert("Your journal entry has been saved successfully!");
  e.preventDefault(); // Prevent page reload for demo
});

// Change background when wallpaper changes
document.getElementById('wallpaper').addEventListener('change', function () {
  document.body.style.backgroundImage = this.value ? `url(${this.value})` : 'none';
});



