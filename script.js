const API_KEY = 'a4e675fa9fd444aa6912f163830faed9';
const BASE_URL = 'http://localhost:8081/https://api.aviationstack.com/v1/flights';
const flightForm = document.getElementById('flightForm');
const flightResults = document.getElementById('flightResults');
const sortOptions = document.getElementById('sortOptions');
const paginationContainer = document.createElement('div');
paginationContainer.classList.add('pagination-container');
document.querySelector('main').appendChild(paginationContainer);

let allFlights = []; // Store fetched flights
let filteredFlights = []; // Filtered flights
let currentPage = 1; // Current page for pagination
const resultsPerPage = 9; // Number of results per page

// Handle form submission
flightForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  // Collect user input
  const searchType = document.getElementById('searchType').value;
  const depSearch = document.getElementById('depSearch').value.trim();
  const arrSearch = document.getElementById('arrSearch').value.trim();
  const airlineSearch = document.getElementById('airlineSearch').value.trim();
  const flightNumber = document.getElementById('flightNumber').value.trim();
  const dateFrom = document.getElementById('dateFrom').value.trim();
  const dateTo = document.getElementById('dateTo').value.trim();

  // Validate input
  if (!depSearch && !arrSearch && !airlineSearch && !flightNumber) {
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
  if (flightNumber) queryParams.push(`flight_iata=${flightNumber}`);
  if (dateFrom) queryParams.push(`flight_date=${dateFrom}`);
  if (dateTo) queryParams.push(`flight_date=${dateTo}`); // Additional date filter logic

  // Fetch data
  flightResults.innerHTML = '<p>Loading...</p>';
  paginationContainer.innerHTML = '';
  currentPage = 1;

  try {
    const response = await fetch(`${BASE_URL}?access_key=${API_KEY}&${queryParams.join('&')}`);
    const data = await response.json();

    if (data.data && data.data.length > 0) {
      allFlights = data.data;
      filteredFlights = allFlights; // Initialize filtered flights
      displayFlights();
    } else {
      flightResults.innerHTML = '<p class="text-danger">No flights found.</p>';
    }
  } catch (error) {
    flightResults.innerHTML = `<p class="text-danger">Error: ${error.message}</p>`;
  }
});

// Display flights
function displayFlights() {
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
          </div>
        </div>
      </div>`;
  }).join('');

  renderPagination(filteredFlights);
}

// Render pagination controls
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

// Handle sorting
sortOptions.addEventListener('change', () => {
  const sortValue = sortOptions.value;

  filteredFlights.sort((a, b) => {
    const depA = new Date(a.departure?.scheduled || 0).getTime();
    const depB = new Date(b.departure?.scheduled || 0).getTime();
    const arrA = new Date(a.arrival?.scheduled || 0).getTime();
    const arrB = new Date(b.arrival?.scheduled || 0).getTime();

    if (sortValue === 'departure-asc') {
      return depA - depB; // Ascending departure time
    } else if (sortValue === 'departure-desc') {
      return depB - depA; // Descending departure time
    } else if (sortValue === 'arrival-asc') {
      return arrA - arrB; // Ascending arrival time
    } else if (sortValue === 'arrival-desc') {
      return arrB - arrA; // Descending arrival time
    } else {
      return 0; // No sorting
    }
  });

  currentPage = 1; // Reset to the first page after sorting
  displayFlights();
});
