//@ts-check

function redirectAfterLogin() {
  location.href = getRedirectUrl();
}

/** @param {Account} account*/
function setCurrentAccount(account) {
  currentAccount = account;
  saveToLocalStorage();
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
    if (
      (xAcc.name === namail || xAcc.email === namail) &&
      xAcc.password === password
    ) {
      setCurrentAccount(xAcc);
      redirectAfterLogin();
      return;
    }
  }

  setFormStatus('Invalid credentials');
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

  const acc = { id: accounts.length.toString(), name, email, password };

  accounts.push(acc);
  setCurrentAccount(acc);
  redirectAfterLogin();
}

/**
 *
 * @param {MouseEvent} event
 */
function processLogout(event) {
  event.preventDefault();
  currentAccount = null;
  saveToLocalStorage();
  redirectAfterLogin();
}
