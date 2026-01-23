fetch('/partials/header.html')
  .then(r => r.text())
  .then(t => document.getElementById('header').innerHTML = t);

fetch('/partials/footer.html')
  .then(r => r.text())
  .then(t => document.getElementById('footer').innerHTML = t);

fetch('/partials/head.html')
  .then(r => r.text())
  .then(t => document.getElementById('head').innerHTML = t);