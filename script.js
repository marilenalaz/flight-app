const API_KEY = 'a4e675fa9fd444aa6912f163830faed9';
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
const BASE_URL = 'https://api.aviationstack.com/v1/flights';

const flightForm = document.getElementById('flightForm');
const flightResults = document.getElementById('flightResults');

flightForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const depAirport = document.getElementById('depAirport').value.trim();
  const arrAirport = document.getElementById('arrAirport').value.trim();

  if (!depAirport) {
    alert('Please enter a departure airport code.');
    return;
  }

  flightResults.innerHTML = '<p>Loading...</p>';

  try {
    // Fetch flight data from AviationStack API using CORS Anywhere proxy
    const response = await fetch(
      `${CORS_PROXY}${BASE_URL}?access_key=${API_KEY}&dep_iata=${depAirport}&arr_iata=${arrAirport}`
    );
    const data = await response.json();

    if (data.data && data.data.length > 0) {
      displayFlights(data.data);
    } else {
      flightResults.innerHTML = '<p>No flights found for the specified criteria.</p>';
    }
  } catch (error) {
    flightResults.innerHTML = `<p>Error fetching flight data: ${error.message}</p>`;
    console.error(error);
  }
});

function displayFlights(flights) {
  flightResults.innerHTML = flights.map((flight) => `
    <div class="flight">
      <h3>${flight.airline.name} (${flight.flight.iata})</h3>
      <p><strong>Departure:</strong> ${flight.departure.airport} (${flight.departure.iata})</p>
      <p><strong>Arrival:</strong> ${flight.arrival.airport} (${flight.arrival.iata})</p>
      <p><strong>Status:</strong> ${flight.flight_status}</p>
    </div>
  `).join('');
}
