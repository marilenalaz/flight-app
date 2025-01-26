const API_KEY = 'a4e675fa9fd444aa6912f163830faed9';
const BASE_URL = 'http://localhost:8081/https://api.aviationstack.com/v1/flights';
const flightForm = document.getElementById('flightForm');
const flightResults = document.getElementById('flightResults');

let allFlights = []; // Store fetched flights here for filtering
const history = JSON.parse(localStorage.getItem('flightSearchHistory')) || []; // Load search history

// Handle form submission
flightForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const searchType = document.getElementById('searchType').value;
  const depSearch = document.getElementById('depSearch').value.trim();
  const arrSearch = document.getElementById('arrSearch').value.trim();
  const airlineSearch = document.getElementById('airlineSearch').value.trim();

  if (!depSearch) {
    alert('Please enter a departure value.');
    return;
  }

  // Build query parameters based on selected search type
  let queryParams = [];
  if (searchType === 'city') queryParams.push(`dep_city=${depSearch}`);
  else if (searchType === 'country') queryParams.push(`dep_country=${depSearch}`);
  else if (searchType === 'airline') queryParams.push(`airline_name=${airlineSearch}`);
  else queryParams.push(`dep_iata=${depSearch}`);
  if (arrSearch) queryParams.push(`arr_iata=${arrSearch}`);

  // Save to search history
  history.push({ depSearch, arrSearch, airlineSearch });
  localStorage.setItem('flightSearchHistory', JSON.stringify(history));

  // Fetch flight data
  flightResults.innerHTML = '<p>Loading...</p>';
  allFlights = []; // Reset flights before fetching new ones

  try {
    const response = await fetch(`${BASE_URL}?access_key=${API_KEY}&${queryParams.join('&')}`);
    const data = await response.json();

    if (data.data && data.data.length > 0) {
      allFlights = data.data; // Store flights for filtering
      displayFlights(allFlights);
    } else {
      flightResults.innerHTML = '<p class="text-danger">No flights found.</p>';
    }
  } catch (error) {
    flightResults.innerHTML = `<p class="text-danger">Error: ${error.message}</p>`;
  }
});

// Display flights
function displayFlights(flights) {
  flightResults.innerHTML = flights.map((flight) => {
    let statusClass = '';
    if (flight.flight_status === 'cancelled') statusClass = 'bg-danger text-white';
    else if (flight.flight_status === 'landed') statusClass = 'bg-success text-white';
    else if (flight.flight_status === 'delayed') statusClass = 'bg-warning text-dark';

    return `
      <div class="col-md-4">
        <div class="card ${statusClass}">
          <div class="card-body">
            <h5>${flight.airline.name || 'Unknown Airline'} (${flight.flight.iata || 'N/A'})</h5>
            <p><strong>Departure:</strong> ${flight.departure.airport || 'N/A'} (${flight.departure.iata || 'N/A'})</p>
            <p><strong>Arrival:</strong> ${flight.arrival.airport || 'N/A'} (${flight.arrival.iata || 'N/A'})</p>
            <p><strong>Status:</strong> ${flight.flight_status || 'Unknown'}</p>
          </div>
        </div>
      </div>`;
  }).join('');
}
