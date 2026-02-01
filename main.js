/**
 * @typedef {Object} Account
 * @property {String} name
 * @property {String} email
 * @property {String} password
 */

/** @type {Account[]} */
const accounts = [];

/** @type {Account | null} */
const currentAccount = null;

function setFormStatus(status, type = 'error', el) {
  /** @type {HTMLDivElement | null} */
  const formStatusEl = (el ?? document).querySelector('.formStatus');

  if (!formStatusEl) {
    throw new Error('Form status element not found');
  }

  if (status === undefined || status === null) {
    formStatusEl.innerHTML = '';
  }

  if (!Array.isArray(status)) {
    status = [status];
  }

  for (let s of status) {
    if (typeof s == 'string') {
      const pEl = document.createElement('p');
      pEl.classList.add(type);
      pEl.innerText = status;
      formStatusEl.appendChild(pEl);
    }
  }
}

/**
 *
 * @param {SubmitEvent} event
 */
function processLogin(event) {
  if (!event || !event.target) return;
  event.preventDefault();
  const data = new FormData(event.target);
  const namail = data.get('namail').trim();
  const password = data.get('password');

  if (namail.length === 0) {
    setFormStatus('Name/Email cannot be empty');
    return;
  }

  for (let xAcc of accounts) {
    if (xAcc.name === namail || xAcc.email === namail) {
      setCurrentAccount(xAcc);
    }
  }

  setFormStatus('Account not found');
}

/** @param {Account} */
function setCurrentAccount(account) {
  currentAccount = account;
}

/**
 *
 * @param {SubmitEvent} event
 */
function processSignUp(event) {
  if (!event || !event.target) return;
  event.preventDefault();
  const data = new FormData(event.target);
  const name = data.get('name').trim();
  const email = data.get('email').trim();
  const password = data.get('password');

  for (let xAcc of accounts) {
    if (xAcc.name === name) {
      setFormStatus('name used!!');
      return;
    }

    if (xAcc.email === email) {
      setFormStatus('email used!!');
      return;
    }
  }
}

class AppNavCompoenent extends HTMLElement {
  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.innerHTML = `
    <link rel="stylesheet" href="/common.css" />
    <header class="site-header">
      <nav class="nav">
        <a href="index.html" id="logo" style="view-transition-name: logo">
          <img src="/images/logo.webp" alt="Car Rental Logo" />
        </a>

        <input type="checkbox" id="nav-toggle" />
        <label for="nav-toggle">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-menu-icon lucide-menu hamburger"
          >
            <path d="M4 5h16" />
            <path d="M4 12h16" />
            <path d="M4 19h16" />
          </svg>
        </label>

        <ul id="menu" style="view-transition-name: nav">
          <li id="nav-home"><a href="index.html">Home</a></li>
          <li id="nav-about"><a href="about.html">About Us</a></li>
          <li id="nav-auth"><a href="login.html">Login</a></li>
        </ul>
      </nav>
    </header>`;
  }

  connectedCallback() {
    const currentPath =
      window.location.pathname.split('/').pop() || 'index.html';

    const links = this.shadowRoot.querySelectorAll('li > a');

    links.forEach(link => {
      const li = link.parentElement;
      const linkPath = link.getAttribute('href');

      li.classList.toggle('active', linkPath === currentPath);
    });
  }
}

customElements.define('app-nav', AppNavCompoenent);
