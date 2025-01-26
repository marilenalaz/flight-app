const flightForm = document.getElementById('flightForm');
const flightResults = document.getElementById('flightResults');
const loadingIndicator = document.getElementById('loading');

const API_KEY = 'a4e675fa9fd444aa6912f163830faed9';
const BASE_URL = 'http://localhost:8080/https://api.aviationstack.com/v1/flights';

flightForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const depAirport = document.getElementById('depAirport').value.trim();
  const arrAirport = document.getElementById('arrAirport').value.trim();

  if (!depAirport) {
    alert('Please enter a departure airport code.');
    return;
  }

  // Show loading indicator
  loadingIndicator.style.display = 'block';
  flightResults.innerHTML = '';

  try {
    const url = `${BASE_URL}?access_key=${API_KEY}&dep_iata=${depAirport}&arr_iata=${arrAirport}`;
    const response = await fetch(url);
    const data = await response.json();

    if (response.ok && data.data && data.data.length > 0) {
      // Generate HTML for flight results
      flightResults.innerHTML = data.data.map((flight) => `
        <div class="flight ${flight.flight_status}">
          <h3>Flight: ${flight.airline.name} (${flight.flight.iata})</h3>
          <p><strong>Departure:</strong> ${flight.departure.airport} (${flight.departure.iata})</p>
          <p><strong>Arrival:</strong> ${flight.arrival.airport} (${flight.arrival.iata})</p>
          <p><strong>Status:</strong> ${formatStatus(flight.flight_status)}</p>
          <p><strong>Flight Duration:</strong> ${calculateDuration(flight.departure.estimated, flight.arrival.estimated)}</p>
        </div>
      `).join('');
    } else {
      flightResults.innerHTML = '<p>No flights found for the specified criteria.</p>';
    }
  } catch (error) {
    flightResults.innerHTML = `<p>Error fetching flight data: ${error.message}</p>`;
    console.error(error);
  } finally {
    // Hide loading indicator
    loadingIndicator.style.display = 'none';
  }
});

// Helper function to format flight status
function formatStatus(status) {
  const statuses = {
    active: 'Active',
    scheduled: 'Scheduled',
    cancelled: 'Cancelled',
  };
  return statuses[status] || 'Unknown';
}

// Helper function to calculate flight duration
function calculateDuration(depTime, arrTime) {
  if (!depTime || !arrTime) return 'N/A';

  const depDate = new Date(depTime);
  const arrDate = new Date(arrTime);

  const diffMs = arrDate - depDate;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return `${diffHours}h ${diffMinutes}m`;
}
