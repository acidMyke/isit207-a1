// @ts-check
const SPA_ACTIVE_CLASSNAME = 'spaactive';
let activeViewElId = 'loginView';

/**
 * @param {string} viewElId
 */
function toggleSpaView(viewElId) {
  const activeViewEl = document.getElementById(activeViewElId);
  const nextViewEl = document.getElementById(viewElId);

  if (!activeViewEl || !nextViewEl) {
    throw new Error('cant find the id!!');
  }

  activeViewEl.classList.remove(SPA_ACTIVE_CLASSNAME);
  nextViewEl.classList.add(SPA_ACTIVE_CLASSNAME);
}

const adminCredentials = [{ username: 'notadmin', password: 'notpassword' }];

/**
 *
 * @param {SubmitEvent} event
 */
function processAdminLogin(event) {
  if (!event || !event.target) return;
  event.preventDefault();
  const data = new FormData(event.target);
  const username = data.get('username').trim();
  const password = data.get('password');

  if (username.length === 0) {
    setFormStatus('Username cannot be empty');
    return;
  }

  for (let creds of adminCredentials) {
    if ((creds.username = username && creds.password == password)) {
      toggleSpaView('bookingListView');
    }
  }

  setFormStatus('Invalid credentials');
}

function initCars() {
  const carSelectEl = document.getElementById('bookingFilterCar');

  if (!carSelectEl) {
    return;
  }

  for (const car of carListing) {
    const optionEl = document.createElement('option');
    optionEl.value = car.id.toString();
    optionEl.textContent = `${car.brand} ${car.model}`;
    carSelectEl.appendChild(optionEl);
  }
}

/**
 *
 * @param {Account[]} accounts
 */
function initAccounts(accounts) {
  const customerSelectEl = document.getElementById('bookingFilterCust');

  if (!customerSelectEl) {
    return;
  }

  for (const account of accounts) {
    const optionEl = document.createElement('option');
    optionEl.value = account.id;
    optionEl.textContent = account.name;
    customerSelectEl.appendChild(optionEl);
  }
}

initFromLocalStorage(function main(data) {
  const { accounts } = data;

  initCars();
  initAccounts(accounts);
  renderBookingList();
});

/**
 *
 * @param {Event} [event]
 */
function renderBookingList(event) {
  event?.preventDefault();

  const bookingFilterFormEl = /** @type {HTMLFormElement} */ (
    document.getElementById('bookingFilter')
  );

  const bookingListResultEl = document.getElementById('bookingListResult');

  if (!bookingFilterFormEl || !bookingListResultEl) {
    return;
  }

  bookingListResultEl.innerHTML = '';

  const filterData = new FormData(bookingFilterFormEl);
  const userIdStr = /** @type {string} */ (filterData.get('userId'));
  const carIdStr = /** @type {string} */ (filterData.get('carId'));
  const statusStr = /** @type {string} */ (filterData.get('status'));

  const carId = parseInt(carIdStr);
  let totalCount = 0;
  let shownCount = 0;

  for (const booking of bookings) {
    totalCount++;
    if (!isNaN(carId) && carId !== -1 && carId !== booking.carId) {
      continue;
    }
    if (userIdStr !== '-1' && userIdStr !== booking.userId) {
      continue;
    }
    if (statusStr !== '' && statusStr !== booking.status) {
      continue;
    }

    const bookingCard = renderBookingCard(booking);
    if (bookingCard) {
      shownCount++;
      bookingListResultEl.appendChild(bookingCard);
    }
  }
}

/**
 *
 * @param {Booking} booking
 */
function renderBookingCard(booking) {
  const car = carListing.find(({ id }) => id === booking.carId);
  const user = accounts.find(({ id }) => id === booking.userId);

  if (!car || !user) {
    return null;
  }

  const card = document.createElement('div');
  card.className = 'card';
  card.setAttribute('data-status', booking.status);

  card.innerHTML = `
  <div class="card-title">
    <span>Booking ${booking.id}</span>
  </div>
  <div class="card-content">
    <p>Status: <strong>${booking.status}</strong></p>
    <p>Customer: <strong>${user.name}</strong></p>
    <p>Car: <strong>${car.brand} ${car.model}</strong></p>
    <p>Checkout at: <strong>${dateTimeFormatter.format(booking.checkedOutAt)}</strong></p>
    <p>From: <strong>${dateFormatter.format(new Date(booking.dateTimeFrom))}</strong></p>
    <p>To: <strong>${dateFormatter.format(new Date(booking.dateTo))}</strong></p>
    <p>Total: <strong>${currencyFormatter.format(booking.total)}</strong></p>
    ${booking.penalty ? `<p>Penalty: ${currencyFormatter.format(booking.penalty)}</p>` : ''}
  </div>`;

  let contentEl = card.querySelector('.accordion-content');
  let primaryButtonEl = document.createElement('button');
  primaryButtonEl.classList.add('btn-primary');

  return card;
}
