const API_KEY = 'a4e675fa9fd444aa6912f163830faed9';
const BASE_URL = 'http://localhost:8081/https://api.aviationstack.com/v1/flights';
const flightForm = document.getElementById('flightForm');
const flightResults = document.getElementById('flightResults');
const sortOptions = document.getElementById('sortOptions');
const paginationContainer = document.createElement('div');
paginationContainer.classList.add('pagination-container');
document.querySelector('main').appendChild(paginationContainer);

// Initialize Flatpickr for date inputs
flatpickr('#dateFrom', { dateFormat: 'Y-m-d' });
flatpickr('#dateTo', { dateFormat: 'Y-m-d' });

let allFlights = []; // Store fetched flights
let filteredFlights = []; // Filtered flights
let currentPage = 1;
const resultsPerPage = 16; // Display 9 results per page (4x4 layout)
let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

// **Handle Form Submission**
flightForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const searchType = document.getElementById('searchType').value;
  const depSearch = document.getElementById('depSearch').value.trim();
  const arrSearch = document.getElementById('arrSearch').value.trim();
  const airlineSearch = document.getElementById('airlineSearch').value.trim();
  const flightNumber = document.getElementById('flightNumber').value.trim();
  const dateFrom = document.getElementById('dateFrom').value.trim();
  const dateTo = document.getElementById('dateTo').value.trim();

  if (!depSearch && !arrSearch && !airlineSearch && !flightNumber) {
    alert('Please enter at least one search criterion.');
    return;
  }

  // Build API query parameters
  let queryParams = [];
  if (searchType === 'city') queryParams.push(`dep_city=${depSearch}`);
  else if (searchType === 'country') queryParams.push(`dep_country=${depSearch}`);
  else if (searchType === 'airline' || airlineSearch) queryParams.push(`airline_name=${airlineSearch}`);
  else queryParams.push(`dep_iata=${depSearch}`);
  if (arrSearch) queryParams.push(`arr_iata=${arrSearch}`);
  if (flightNumber) queryParams.push(`flight_iata=${flightNumber}`);
  if (dateFrom) queryParams.push(`flight_date_from=${dateFrom}`);
  if (dateTo) queryParams.push(`flight_date_to=${dateTo}`);

  flightResults.innerHTML = '<p>Loading...</p>';
  paginationContainer.innerHTML = '';
  currentPage = 1;

  try {
    const response = await fetch(`${BASE_URL}?access_key=${API_KEY}&${queryParams.join('&')}`);
    const data = await response.json();

    if (data.data && data.data.length > 0) {
      allFlights = data.data;
      filteredFlights = allFlights;
      displayFlights();
    } else {
      flightResults.innerHTML = '<p class="text-danger">No flights found.</p>';
    }
  } catch (error) {
    flightResults.innerHTML = `<p class="text-danger">Error: ${error.message}</p>`;
  }
});

// **Display Flights (3x3 Grid)**
function displayFlights() {
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const flightsToShow = filteredFlights.slice(startIndex, endIndex);

  let output = '<div class="row">';

  flightsToShow.forEach((flight, index) => {
    const statusClass = {
      cancelled: 'bg-danger text-white',
      landed: 'bg-success text-white',
      active: 'bg-warning text-dark',
      scheduled: '',
    }[flight.flight_status] || '';

    const departureTime = flight.departure?.scheduled
      ? new Date(flight.departure.scheduled).toLocaleString()
      : 'N/A';
    const arrivalTime = flight.arrival?.scheduled
      ? new Date(flight.arrival.scheduled).toLocaleString()
      : 'N/A';

    output += `
      <div class="col-md-4 mb-4">
        <div class="card ${statusClass}">
          <div class="card-body">
            <h5>${flight.airline?.name || 'Unknown Airline'} (${flight.flight?.iata || 'N/A'})</h5>
            <p><strong>Departure:</strong> ${flight.departure?.airport || 'N/A'} (${flight.departure?.iata || 'N/A'})</p>
            <p><strong>Arrival:</strong> ${flight.arrival?.airport || 'N/A'} (${flight.arrival?.iata || 'N/A'})</p>
            <p><strong>Departure Time:</strong> ${departureTime}</p>
            <p><strong>Arrival Time:</strong> ${arrivalTime}</p>
            <p><strong>Status:</strong> ${flight.flight_status || 'Unknown'}</p>
            <button class="btn btn-primary mt-2" onclick="addToWatchlist(${index})">⭐ Add to Watchlist</button>
          </div>
        </div>
      </div>`;

    if ((index + 1) % 3 === 0) {
      output += '</div><div class="row">';
    }
  });

  output += '</div>';
  flightResults.innerHTML = output;
  renderPagination(filteredFlights);
}

// **Save to Watchlist (Local Storage)**
function addToWatchlist(index) {
  const flight = filteredFlights[index];

  // Avoid duplicates
  const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
  if (watchlist.some(watch => watch.flight?.iata === flight.flight?.iata)) {
    alert("⚠️ This flight is already in your watchlist!");
    return;
  }

  watchlist.push(flight);
  localStorage.setItem('watchlist', JSON.stringify(watchlist));
  alert("✅ Flight added to Watchlist!");
}

// **Render Pagination**
function renderPagination(filteredFlights) {
  const totalPages = Math.ceil(filteredFlights.length / resultsPerPage);

  if (totalPages <= 1) {
    paginationContainer.innerHTML = '';
    return;
  }

  let paginationHTML = '<div class="pagination d-flex justify-content-center mt-3">';
  for (let i = 1; i <= totalPages; i++) {
    paginationHTML += `
      <button class="btn ${i === currentPage ? 'btn-primary' : 'btn-light'} mx-1" data-page="${i}">
        ${i}
      </button>`;
  }
  paginationHTML += '</div>';

  paginationContainer.innerHTML = paginationHTML;

  paginationContainer.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => {
      currentPage = Number(button.dataset.page);
      displayFlights();
    });
  });
}

// **Sorting Flights**
sortOptions.addEventListener('change', () => {
  const sortValue = sortOptions.value;

  filteredFlights.sort((a, b) => {
    const depA = new Date(a.departure?.scheduled || 0).getTime();
    const depB = new Date(b.departure?.scheduled || 0).getTime();
    const arrA = new Date(a.arrival?.scheduled || 0).getTime();
    const arrB = new Date(b.arrival?.scheduled || 0).getTime();

    if (sortValue === 'departure-asc') {
      return depA - depB;
    } else if (sortValue === 'departure-desc') {
      return depB - depA;
    } else if (sortValue === 'arrival-asc') {
      return arrA - arrB;
    } else if (sortValue === 'arrival-desc') {
      return arrB - arrA;
    } else {
      return 0;
    }
  });

  currentPage = 1;
  displayFlights();
});
