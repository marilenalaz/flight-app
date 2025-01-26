const API_KEY = 'a4e675fa9fd444aa6912f163830faed9';
const BASE_URL = 'http://localhost:8080/https://api.aviationstack.com/v1/flights';

const flightForm = document.getElementById('flightForm');
const flightResults = document.getElementById('flightResults');
const searchHistory = document.getElementById('searchHistory');
const loading = document.getElementById('loading');

// Load search history from localStorage
const history = JSON.parse(localStorage.getItem('flightSearchHistory')) || [];
updateSearchHistory();

// Event listener for form submission
flightForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const depAirport = document.getElementById('depAirport').value.trim();
  const arrAirport = document.getElementById('arrAirport').value.trim();

  if (!depAirport) {
    alert('Please enter a departure airport code.');
    return;
  }

  // Save to history
  history.push({ depAirport, arrAirport });
  localStorage.setItem('flightSearchHistory', JSON.stringify(history));
  updateSearchHistory();

  flightResults.innerHTML = '';
  loading.classList.remove('d-none');

  try {
    const response = await fetch(
      `${BASE_URL}?access_key=${API_KEY}&dep_iata=${depAirport}&arr_iata=${arrAirport}`
    );
    const data = await response.json();

    if (data.data && data.data.length > 0) {
      displayFlights(data.data);
    } else {
      flightResults.innerHTML = '<p class="text-center text-danger">No flights found.</p>';
    }
  } catch (error) {
    flightResults.innerHTML = `<p class="text-center text-danger">Error: ${error.message}</p>`;
  } finally {
    loading.classList.add('d-none');
  }
});

// Display flights
function displayFlights(flights) {
  flightResults.innerHTML = flights.map((flight) => `
    <div class="col-md-4">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">${flight.airline.name} (${flight.flight.iata})</h5>
          <p class="card-text"><strong>Departure:</strong> ${flight.departure.airport} (${flight.departure.iata})</p>
          <p class="card-text"><strong>Arrival:</strong> ${flight.arrival.airport} (${flight.arrival.iata})</p>
          <p class="card-text"><strong>Status:</strong> ${flight.flight_status}</p>
        </div>
      </div>
    </div>
  `).join('');
}

// Update search history
function updateSearchHistory() {
  searchHistory.innerHTML = history.map((item, index) => `
    <li class="list-group-item">
      Departure: ${item.depAirport}, Arrival: ${item.arrAirport || 'N/A'}
      <button class="btn btn-sm btn-danger float-end" onclick="removeHistory(${index})">Remove</button>
    </li>
  `).join('');
}

// Remove history item
function removeHistory(index) {
  history.splice(index, 1);
  localStorage.setItem('flightSearchHistory', JSON.stringify(history));
  updateSearchHistory();
}
