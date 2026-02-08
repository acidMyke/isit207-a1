function initializeCarCheckout() {
  const caridInput = /** @type {HTMLInputElement | null} */ (
    document.getElementById('carid')
  );

  const placeIdSelect = /** @type {HTMLSelectElement | null} */ (
    document.getElementById('placeIdSelect')
  );

  if (!caridInput || !placeIdSelect) {
    return;
  }
  const params = new URLSearchParams(location.search);
  const caridStr = params.get('carid');
  if (!caridStr) {
    location.href = '/reserve.html';
    return;
  }

  caridInput.value = caridStr;

  for (const { name, id } of OFFICE_PLACES) {
    const optionEl = document.createElement('option');
    optionEl.value = id;
    optionEl.textContent = name;
    placeIdSelect.appendChild(optionEl);
  }

  onCheckoutFormChange();
}

localStorageInitPromise.then(() => initializeCarCheckout());

const DAYS_MS = 86_400_000;

function onCheckoutFormChange() {
  const checkoutform = /** @type {HTMLFormElement | null} */ (
    document.getElementById('checkoutform')
  );

  const dynamicCheckoutContentDiv = /** @type {HTMLDivElement | null} */ (
    document.getElementById('dynamicCheckoutContent')
  );
  const dynamicCheckoutMapDiv = /** @type {HTMLDivElement | null} */ (
    document.getElementById('dynamicCheckoutMap')
  );
  if (!checkoutform || !dynamicCheckoutContentDiv || !dynamicCheckoutMapDiv) {
    return;
  }

  const rentFromEl = /** @type {HTMLInputElement} */ (
    document.querySelector('input[name="rentFrom"]')
  );
  const rentToEl = /** @type {HTMLInputElement} */ (
    document.querySelector('input[name="rentTo"]')
  );
  const preCalcTotalEl = /** @type {HTMLInputElement} */ (
    document.querySelector('input[name="preCalcTotal"]')
  );
  const now = new Date();
  rentFromEl.min = now.toISOString().slice(0, 16);

  dynamicCheckoutContentDiv.innerHTML = '';

  const formData = new FormData(checkoutform);
  const carIdStr = formData.get('carid');
  const rentFromStr = formData.get('rentFrom');
  const rentToStr = formData.get('rentTo');
  const placeIdStr = formData.get('placeId');

  const carId = parseInt(carIdStr);
  const car = carListing.find(({ id }) => id === carId);

  if (!car) {
    return;
  }

  const carNameEl = document.createElement('h2');
  carNameEl.innerText = `${car.brand} ${car.model}`;

  dynamicCheckoutContentDiv.appendChild(carNameEl);
  const appendLabelAndValue = (
    /** @type {string} */ labelText,
    /** @type {string} */ value,
  ) => {
    const labelEl = document.createElement('p');
    labelEl.innerText = labelText;
    dynamicCheckoutContentDiv.appendChild(labelEl);

    const valueEl = document.createElement('p');
    valueEl.innerText = value;
    dynamicCheckoutContentDiv.appendChild(valueEl);
  };

  let rentToDate;
  let rentFromDate;
  if (rentFromStr) {
    rentFromDate = new Date(rentFromStr);
    if (!isNaN(rentFromDate.getTime())) {
      rentToEl.min = new Date(rentFromDate.getTime() + DAYS_MS)
        .toISOString()
        .slice(0, 10);
      appendLabelAndValue('From: ', dateFormatter.format(rentFromDate));
    }
  }

  if (rentToStr) {
    rentToDate = new Date(rentToStr);
    if (!isNaN(rentToDate.getTime())) {
      rentFromEl.max = new Date(rentToDate.getTime() - DAYS_MS)
        .toISOString()
        .slice(0, 16);
      appendLabelAndValue('To: ', dateFormatter.format(rentToDate));
    }
  }

  if (rentToDate && rentFromDate) {
    const msDiff = rentToDate.getTime() - rentFromDate.getTime();
    const daysDiff = Math.ceil(msDiff / DAYS_MS);

    appendLabelAndValue('Duration: ', `${daysDiff} days`);

    const subtotal = daysDiff * car.price;

    appendLabelAndValue('Subtotal: ', currencyFormatter.format(subtotal));

    const gst = subtotal * 0.09;
    const grandTotal = subtotal + gst;
    appendLabelAndValue('GST: ', currencyFormatter.format(gst));
    appendLabelAndValue('Total: ', currencyFormatter.format(grandTotal));
    preCalcTotalEl.value = grandTotal.toString();
  }

  if (placeIdStr && dynamicCheckoutMapDiv.dataset.placeid !== placeIdStr) {
    const office = OFFICE_PLACES.find(({ id }) => id === placeIdStr);
    if (office) {
      dynamicCheckoutMapDiv.dataset.placeid = placeIdStr;
      dynamicCheckoutMapDiv.innerHTML = `<label>Pick Up and Return: </label>\n`;
      dynamicCheckoutMapDiv.appendChild(createGoogleMapEmbed(office));
    }
  }
}

/**
 *
 * @param {SubmitEvent} event
 */
function processCheckout(event) {
  if (!event || !event.target) return;
  event.preventDefault();
  const formData = new FormData(/** @type {HTMLFormElement} */ (event.target));
  const carIdStr = formData.get('carid');
  const rentFromStr = formData.get('rentFrom');
  const rentToStr = formData.get('rentTo');
  const ccStr = formData.get('cc');
  const preCalcTotalStr = formData.get('preCalcTotal');
  const placeIdStr = formData.get('placeId');

  const carId = parseInt(carIdStr);
  const car = carListing.find(({ id }) => id === carId);

  if (!car) {
    return;
  }

  bookings.unshift({
    id: bookings.length,
    userId: currentAccount?.id,
    carId,
    dateTimeFrom: rentFromStr,
    dateTo: rentToStr,
    last4cc: ccStr?.slice(12, 16),
    total: parseFloat(preCalcTotalStr),
    status: 'reserved',
    checkedOutAt: new Date().getTime(),
    penalty: 0,
    photos: [],
    placeId: placeIdStr,
  });

  carQty[carId.toString().padStart(2, '0')] -= 1;
  saveToLocalStorage();

  location.replace('/history.html');
}

/**
 * @param {Place} place
 */
function createGoogleMapEmbed(place) {
  const iframe = document.createElement('iframe');

  const src = `https://www.google.com/maps?q=${place.latitude},${place.longitude}&z=15&output=embed`;

  iframe.src = src;
  iframe.width = '100%';
  iframe.height = '300';
  iframe.style.border = '0';
  iframe.loading = 'lazy';
  iframe.referrerPolicy = 'no-referrer-when-downgrade';
  iframe.setAttribute('credentialless', '');

  return iframe;
}
