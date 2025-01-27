const API_KEY = 'a4e675fa9fd444aa6912f163830faed9';
const BASE_URL = 'http://localhost:8081/https://api.aviationstack.com/v1/flights';
const flightForm = document.getElementById('flightForm');
const flightResults = document.getElementById('flightResults');
const paginationContainer = document.createElement('div'); // For pagination
paginationContainer.classList.add('pagination-container');
document.querySelector('main').appendChild(paginationContainer);

let allFlights = []; // Store fetched flights
let currentPage = 1; // Track the current page
const resultsPerPage = 9; // Number of results per page

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

  // Build query parameters
  let queryParams = [];
  if (searchType === 'city') queryParams.push(`dep_city=${depSearch}`);
  else if (searchType === 'country') queryParams.push(`dep_country=${depSearch}`);
  else if (searchType === 'airline' || airlineSearch) queryParams.push(`airline_name=${airlineSearch}`);
  else queryParams.push(`dep_iata=${depSearch}`);
  if (arrSearch) queryParams.push(`arr_iata=${arrSearch}`);

  // Fetch flight data
  flightResults.innerHTML = '<p>Loading...</p>';
  paginationContainer.innerHTML = ''; // Clear pagination
  currentPage = 1; // Reset to the first page

  try {
    const response = await fetch(`${BASE_URL}?access_key=${API_KEY}&${queryParams.join('&')}`);
    const data = await response.json();

    if (data.data && data.data.length > 0) {
      allFlights = data.data; // Store all fetched flights
      displayFlights(); // Show the first page of results
    } else {
      flightResults.innerHTML = '<p class="text-danger">No flights found.</p>';
    }
  } catch (error) {
    flightResults.innerHTML = `<p class="text-danger">Error: ${error.message}</p>`;
  }
});

// Display flights with pagination
function displayFlights() {
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;

  const flightsToShow = allFlights.slice(startIndex, endIndex);

  flightResults.innerHTML = flightsToShow.map((flight) => {
    let statusClass = '';
    if (flight.flight_status === 'cancelled') statusClass = 'bg-danger text-white';
    else if (flight.flight_status === 'landed') statusClass = 'bg-success text-white';
    else if (flight.flight_status === 'delayed') statusClass = 'bg-warning text-dark';

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
            <p><strong>Departure:</strong> ${flight.departure?.airport || 'N/A'} (${flight.departure?.iata || 'N/A'}) - ${departureTime}</p>
            <p><strong>Arrival:</strong> ${flight.arrival?.airport || 'N/A'} (${flight.arrival?.iata || 'N/A'}) - ${arrivalTime}</p>
            <p><strong>Status:</strong> ${flight.flight_status || 'Unknown'}</p>
          </div>
        </div>
      </div>`;
  }).join('');

  renderPagination();
}

// Render pagination controls
function renderPagination() {
  const totalPages = Math.ceil(allFlights.length / resultsPerPage);

  let paginationHTML = '';
  for (let i = 1; i <= totalPages; i++) {
    paginationHTML += `
      <button class="btn ${i === currentPage ? 'btn-primary' : 'btn-light'} mx-1" data-page="${i}">
        ${i}
      </button>`;
  }

  paginationContainer.innerHTML = paginationHTML;

  const buttons = paginationContainer.querySelectorAll('button');
  buttons.forEach((button) => {
    button.addEventListener('click', (event) => {
      currentPage = Number(event.target.getAttribute('data-page'));
      displayFlights();
    });
  });
}
