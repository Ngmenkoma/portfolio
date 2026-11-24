// Highlight the nav link for the section currently in view
const links = document.querySelectorAll('nav ul a');
const sections = [...links]
  .map(a => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);

function setActive() {
  const y = window.scrollY + 140;
  let current = sections[0];
  sections.forEach(sec => { if (sec.offsetTop <= y) current = sec; });
  links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + current.id));
}

window.addEventListener('scroll', setActive, { passive: true });
setActive();

// ---- Featured projects ----
// All project text and photos live in index.html (inside each .proj card).
// Nothing to edit here.
const dlg = document.getElementById('pmodal');
const mImg = document.getElementById('pm-img'), mPh = document.getElementById('pm-ph');
const mCount = document.getElementById('pm-count'), mThumbs = document.getElementById('pm-thumbs');
const prevBtn = dlg.querySelector('.prev'), nextBtn = dlg.querySelector('.next');
let imgs = [], idx = 0;

mImg.addEventListener('load',  () => { mImg.hidden = false; mPh.hidden = true; });
mImg.addEventListener('error', () => { mImg.hidden = true;  mPh.hidden = false; });

function show(i){
  if (!imgs.length) return;
  idx = (i + imgs.length) % imgs.length;
  mImg.alt = imgs[idx].caption || '';
  mImg.src = imgs[idx].src;
  mCount.textContent = (idx + 1) + ' / ' + imgs.length;
  document.getElementById('pm-cap').textContent = imgs[idx].caption || '';
  [...mThumbs.children].forEach((t, n) => t.classList.toggle('on', n === idx));
}

function openProject(card){
  const d = card.querySelector('.pdetails');
  imgs = [...d.querySelectorAll('.pgallery img')].map(i => ({ src: i.getAttribute('src'), caption: i.alt }));
  const title = card.querySelector('h3').textContent;
  document.getElementById('pm-title').textContent = title;
  document.getElementById('pm-stack').textContent = card.querySelector('p').textContent;
  document.getElementById('pm-desc').textContent = d.querySelector('.pdesc').textContent;
  document.getElementById('pm-list').innerHTML = d.querySelector('.pfeatures').innerHTML;
  document.getElementById('pm-live').href = card.querySelector('.visit').getAttribute('href');   // same link as the card's button

  const many = imgs.length > 1;
  prevBtn.hidden = nextBtn.hidden = mCount.hidden = mThumbs.hidden = !many;
  mThumbs.innerHTML = '';
  imgs.forEach((im, n) => {
    const b = document.createElement('button');
    b.type = 'button'; b.setAttribute('aria-label', 'Show image ' + (n + 1));
    b.innerHTML = '<img alt="" src="' + im.src + '" onerror="this.remove()">';
    b.addEventListener('click', () => show(n));
    mThumbs.appendChild(b);
  });
  show(0);
  dlg.showModal();
}

document.querySelectorAll('.proj').forEach(card => {
  card.addEventListener('click', e => { if (e.target.closest('a')) return; openProject(card); });   // clicking "Visit site" just follows the link
  card.addEventListener('keydown', e => {
    if (e.target.closest('a')) return;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProject(card); }
  });
});
prevBtn.addEventListener('click', () => show(idx - 1));
nextBtn.addEventListener('click', () => show(idx + 1));
dlg.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') show(idx - 1);
  if (e.key === 'ArrowRight') show(idx + 1);
});
dlg.querySelector('.x').addEventListener('click', () => dlg.close());
dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });

// ---- Contact form (sends through your own Google Apps Script) ----
const MY_EMAIL = 'kelvinyilob@gmail.com';   // shown to visitors only if sending fails

const form = document.getElementById('cform');
const statusEl = document.getElementById('cstatus');
function say(msg, cls){ statusEl.textContent = msg; statusEl.className = cls || ''; }

form.addEventListener('submit', async e => {
  e.preventDefault();
  const f = form.elements;
  let ok = true;
  ['name','email','message'].forEach(n => {
    const bad = !f[n].value.trim() || (n === 'email' && !/^\S+@\S+\.\S+$/.test(f[n].value));
    f[n].classList.toggle('invalid', bad); if (bad) ok = false;
  });
  if (!ok) return say('Please fill in your name, a valid email and a message.', 'err');
  if (f._gotcha.value) return;   // spam bot filled the hidden field
  if (form.action.includes('YOUR_SCRIPT_ID')) return say('The form is not connected yet. Please email ' + MY_EMAIL + ' instead.', 'err');

  const name = f['name'].value.trim();
  const btn = form.querySelector('button'); btn.disabled = true; say('Sending…');
  try {
    // Google Apps Script emails you the message AND sends the visitor a thank-you
    await fetch(form.action, { method: 'POST', mode: 'no-cors', body: new FormData(form) });
    form.reset();
    say('Thank you, ' + name + '! Your message has been received. I will get back to you as soon as possible.', 'ok');
  } catch (err) {
    say('Sorry, something went wrong. Please email ' + MY_EMAIL + ' instead.', 'err');
  } finally { btn.disabled = false; }
});
