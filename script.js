document.getElementById('loginForm').addEventListener('submit', e => {
  e.preventDefault();
  const user = {
    username: username.value.trim(),
    email: email.value.trim(),
    phone: phone.value.trim(),
    pwd: password.value
  };
  localStorage.setItem('djUser', JSON.stringify(user));
  if (!localStorage.getItem('djEntries')) localStorage.setItem('djEntries', '[]');
  location = 'journal.html';
});
