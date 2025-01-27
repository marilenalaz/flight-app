const API_KEY = 'a4e675fa9fd444aa6912f163830faed9';
const BASE_URL = 'http://localhost:8081/https://api.aviationstack.com/v1/flights';
const flightForm = document.getElementById('flightForm');
const flightResults = document.getElementById('flightResults');
const statusFilter = document.getElementById('statusFilter');
const paginationContainer = document.createElement('div');
paginationContainer.classList.add('pagination-container');
document.querySelector('main').appendChild(paginationContainer);

let allFlights = []; // Store fetched flights
let currentPage = 1;
const resultsPerPage = 9;
const watchlist = JSON.parse(localStorage.getItem('watchlist')) || []; // Load watchlist from localStorage

// Handle form submission
flightForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const searchType = document.getElementById('searchType').value;
  const depSearch = document.getElementById('depSearch').value.trim();
  const arrSearch = document.getElementById('arrSearch').value.trim();
  const airlineSearch = document.getElementById('airlineSearch').value.trim();

  if (!depSearch && !arrSearch && !airlineSearch) {
    alert('Please enter at least one search criterion.');
    return;
  }

  let queryParams = [];
  if (searchType === 'city') queryParams.push(`dep_city=${depSearch}`);
  else if (searchType === 'country') queryParams.push(`dep_country=${depSearch}`);
  else if (searchType === 'airline' || airlineSearch) queryParams.push(`airline_name=${airlineSearch}`);
  else queryParams.push(`dep_iata=${depSearch}`);
  if (arrSearch) queryParams.push(`arr_iata=${arrSearch}`);

  flightResults.innerHTML = '<p>Loading...</p>';
  paginationContainer.innerHTML = '';
  currentPage = 1;

  try {
    const response = await fetch(`${BASE_URL}?access_key=${API_KEY}&${queryParams.join('&')}`);
    const data = await response.json();

    if (data.data && data.data.length > 0) {
      allFlights = data.data;
      displayFlights();
    } else {
      flightResults.innerHTML = '<p class="text-danger">No flights found.</p>';
    }
  } catch (error) {
    flightResults.innerHTML = `<p class="text-danger">Error: ${error.message}</p>`;
  }
});

// Display flights with status filter
function displayFlights() {
  const selectedStatus = statusFilter.value;
  const filteredFlights = selectedStatus
    ? allFlights.filter((flight) => flight.flight_status === selectedStatus)
    : allFlights;

  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const flightsToShow = filteredFlights.slice(startIndex, endIndex);

  flightResults.innerHTML = flightsToShow.map((flight) => {
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

    return `
      <div class="col-md-4">
        <div class="card ${statusClass}">
          <div class="card-body">
            <h5>${flight.airline?.name || 'Unknown Airline'} (${flight.flight?.iata || 'N/A'})</h5>
            <p><strong>Departure:</strong> ${flight.departure?.airport || 'N/A'} (${flight.departure?.iata || 'N/A'})</p>
            <p><strong>Arrival:</strong> ${flight.arrival?.airport || 'N/A'} (${flight.arrival?.iata || 'N/A'})</p>
            <p><strong>Departure Time:</strong> ${departureTime}</p>
            <p><strong>Arrival Time:</strong> ${arrivalTime}</p>
            <p><strong>Status:</strong> ${flight.flight_status || 'Unknown'}</p>
            <button class="bookmark-btn" onclick="addToWatchlist(${JSON.stringify(flight).replace(/"/g, '&quot;')})">
              Add to Watchlist
            </button>
          </div>
        </div>
      </div>`;
  }).join('');

  renderPagination(filteredFlights);
}

// Add flight to watchlist
function addToWatchlist(flight) {
  watchlist.push(flight);
  localStorage.setItem('watchlist', JSON.stringify(watchlist));
  alert('Flight added to watchlist!');
}

// Render pagination
function renderPagination(filteredFlights) {
  const totalPages = Math.ceil(filteredFlights.length / resultsPerPage);
  let paginationHTML = '';
  for (let i = 1; i <= totalPages; i++) {
    paginationHTML += `
      <button class="btn ${i === currentPage ? 'btn-primary' : 'btn-light'} mx-1" data-page="${i}">
        ${i}
      </button>`;
  }

  paginationContainer.innerHTML = paginationHTML;

  paginationContainer.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => {
      currentPage = Number(button.dataset.page);
      displayFlights();
    });
  });
}
