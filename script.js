const flightForm = document.getElementById('flightForm');
const flightResults = document.getElementById('flightResults');

// API Configuration
const API_KEY = 'a4e675fa9fd444aa6912f163830faed9';
const BASE_URL = 'http://localhost:8080/https://api.aviationstack.com/v1/flights';

flightForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const airportCode = document.getElementById('airport').value.trim();

  flightResults.innerHTML = '<p>Loading...</p>';

  try {
    const response = await fetch(`${BASE_URL}?access_key=${API_KEY}&dep_iata=${airportCode}`);
    
    // Check if the response is JSON
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${errorText}`);
    }

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
    console.error(error);
  }
});
