const API_KEY = 'a4e675fa9fd444aa6912f163830faed9';
const BASE_URL = 'http://localhost:8081/https://api.aviationstack.com/v1/flights';
const flightForm = document.getElementById('flightForm');
const flightResults = document.getElementById('flightResults');

// Handle form submission
flightForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  // Get user input
  const depAirport = document.getElementById('depAirport').value.trim();
  const arrAirport = document.getElementById('arrAirport').value.trim();

  if (!depAirport) {
    alert('Please enter a departure airport code.');
    return;
  }

  // Build query parameters
  let queryParams = [`dep_iata=${encodeURIComponent(depAirport)}`];
  if (arrAirport) {
    queryParams.push(`arr_iata=${encodeURIComponent(arrAirport)}`);
  }

  // Fetch flight data
  flightResults.innerHTML = '<p>Loading...</p>';
  try {
    const response = await fetch(`${BASE_URL}?access_key=${API_KEY}&${queryParams.join('&')}`);
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
            <h5>${flight.airline?.name || 'Unknown Airline'} (${flight.flight?.iata || 'N/A'})</h5>
            <p><strong>Departure:</strong> ${flight.departure?.airport || 'N/A'} (${flight.departure?.iata || 'N/A'})</p>
            <p><strong>Arrival:</strong> ${flight.arrival?.airport || 'N/A'} (${flight.arrival?.iata || 'N/A'})</p>
            <p><strong>Status:</strong> ${flight.flight_status || 'Unknown'}</p>
          </div>
        </div>
      </div>`;
  }).join('');
}
