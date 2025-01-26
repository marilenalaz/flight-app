const flightForm = document.getElementById('flightForm');
const flightResults = document.getElementById('flightResults');

const API_KEY = 'a4e675fa9fd444aa6912f163830faed9';
const BASE_URL = 'http://api.aviationstack.com/v1/flights';

flightForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const airportCode = document.getElementById('airport').value.trim();

  flightResults.innerHTML = '<p>Loading...</p>';

  try {
    const response = await fetch(`${BASE_URL}?access_key=${API_KEY}&dep_iata=${airportCode}`);
    const data = await response.json();

    if (data.data && data.data.length > 0) {
      flightResults.innerHTML = data.data.map((flight) => `
        <div class="flight">
          <h3>Flight: ${flight.airline.name} (${flight.flight.iata})</h3>
          <p>Departure: ${flight.departure.airport} (${flight.departure.iata})</p>
          <p>Arrival: ${flight.arrival.airport} (${flight.arrival.iata})</p>
          <p>Status: ${flight.flight_status}</p>
        </div>
      `).join('');
    } else {
      flightResults.innerHTML = '<p>No flights found for this airport code.</p>';
    }
  } catch (error) {
    flightResults.innerHTML = `<p>Error fetching flight data: ${error.message}</p>`;
  }
});
