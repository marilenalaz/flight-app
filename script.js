const API_KEY = 'a4e675fa9fd444aa6912f163830faed9';
const BASE_URL = 'http://localhost:8081/https://api.aviationstack.com/v1/flights';
const flightForm = document.getElementById('flightForm');
const flightResults = document.getElementById('flightResults');
const statusFilter = document.getElementById('statusFilter');

// Handle form submission
flightForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const searchType = document.getElementById('searchType').value;
  const depSearch = document.getElementById('depSearch').value.trim();
  const arrSearch = document.getElementById('arrSearch').value.trim();

  let queryParam = searchType === 'city' ? 'dep_city' : 'dep_iata';
  let arrQueryParam = searchType === 'city' ? 'arr_city' : 'arr_iata';

  flightResults.innerHTML = '<p>Loading...</p>';

  try {
    const response = await fetch(`${BASE_URL}?access_key=${API_KEY}&${queryParam}=${depSearch}&${arrQueryParam}=${arrSearch}`);
    const data = await response.json();

    if (data.data && data.data.length > 0) {
      displayFlights(data.data);
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
            <h5>${flight.airline.name} (${flight.flight.iata})</h5>
            <p><strong>Departure:</strong> ${flight.departure.airport} (${flight.departure.iata})</p>
            <p><strong>Arrival:</strong> ${flight.arrival.airport} (${flight.arrival.iata})</p>
            <p><strong>Status:</strong> ${flight.flight_status}</p>
          </div>
        </div>
      </div>`;
  }).join('');
}
