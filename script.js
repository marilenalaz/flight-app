const API_KEY = 'a4e675fa9fd444aa6912f163830faed9';
const BASE_URL = 'http://localhost:8080/https://api.aviationstack.com/v1/flights';

// Placeholder for your auth token
let authToken = null;

// Search Flights
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

  try {
    const response = await fetch(
      `${BASE_URL}?access_key=${API_KEY}&dep_iata=${depAirport}&arr_iata=${arrAirport}`
    );
    const data = await response.json();

    if (data.data && data.data.length > 0) {
      displayFlights(data.data);
    } else {
      flightResults.innerHTML = '<p>No flights found.</p>';
    }
  } catch (error) {
    flightResults.innerHTML = `<p>Error: ${error.message}</p>`;
  }
});

function displayFlights(flights) {
  flightResults.innerHTML = flights
    .map(
      (flight) => `
    <div class="flight">
      <h3>${flight.airline.name} (${flight.flight.iata})</h3>
      <p>From: ${flight.departure.airport} (${flight.departure.iata})</p>
      <p>To: ${flight.arrival.airport} (${flight.arrival.iata})</p>
      <button onclick="addToWatchlist(${JSON.stringify({
        id: flight.flight.iata,
        airline: flight.airline.name,
        departure: flight.departure.airport,
        arrival: flight.arrival.airport,
      })})">Add to Watchlist</button>
    </div>`
    )
    .join('');
}

// Add to watchlist
async function addToWatchlist(flight) {
  if (!authToken) {
    alert('You must log in to use the watchlist.');
    return;
  }

  const response = await fetch('http://localhost:5000/watchlist', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ flight }),
  });

  const data = await response.json();
  alert(data.message || data.error);
}
