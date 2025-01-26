const API_KEY = 'a4e675fa9fd444aa6912f163830faed9';
const BASE_URL = 'http://localhost:8081/https://api.aviationstack.com/v1/flights';
const flightForm = document.getElementById('flightForm');
const flightResults = document.getElementById('flightResults');
const countryFilter = document.getElementById('countryFilter');
const cityFilter = document.getElementById('cityFilter');
const airlineFilter = document.getElementById('airlineFilter');

let allFlights = []; // Store fetched flights
let allCountries = []; // Store fetched countries
let allCities = []; // Store fetched cities
let allAirlines = []; // Store fetched airlines

// Fetch and Populate Countries
async function fetchCountries() {
  try {
    const response = await fetch(`${BASE_URL}/countries?access_key=${API_KEY}`);
    const data = await response.json();
    if (data && data.data) {
      allCountries = data.data;
      populateDropdown(countryFilter, allCountries.map(country => country.name));
    }
  } catch (error) {
    console.error('Error fetching countries:', error);
  }
}

// Fetch and Populate Cities for a Country
async function fetchCities(country) {
  try {
    const response = await fetch(`${BASE_URL}/cities?access_key=${API_KEY}&country_name=${country}`);
    const data = await response.json();
    if (data && data.data) {
      allCities = data.data;
      populateDropdown(cityFilter, allCities.map(city => city.name));
    }
  } catch (error) {
    console.error('Error fetching cities:', error);
  }
}

// Fetch and Populate Airlines
async function fetchAirlines() {
  try {
    const response = await fetch(`${BASE_URL}/airlines?access_key=${API_KEY}`);
    const data = await response.json();
    if (data && data.data) {
      allAirlines = data.data;
      populateDropdown(airlineFilter, allAirlines.map(airline => airline.name));
    }
  } catch (error) {
    console.error('Error fetching airlines:', error);
  }
}

// Populate a dropdown with options
function populateDropdown(dropdown, items) {
  dropdown.innerHTML = `<option value="">Choose an Option</option>`;
  items.forEach(item => {
    const option = document.createElement('option');
    option.value = item;
    option.textContent = item;
    dropdown.appendChild(option);
  });
}

// Event: Country selection changes
countryFilter.addEventListener('change', () => {
  const selectedCountry = countryFilter.value;
  if (selectedCountry) {
    fetchCities(selectedCountry);
  } else {
    cityFilter.innerHTML = '<option value="">Choose a City</option>';
  }
});

// Handle form submission
flightForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const selectedCountry = countryFilter.value;
  const selectedCity = cityFilter.value;
  const selectedAirline = airlineFilter.value;

  if (!selectedCountry && !selectedCity && !selectedAirline) {
    alert('Please select at least one search criterion.');
    return;
  }

  // Build query parameters
  let queryParams = [];
  if (selectedCountry) queryParams.push(`dep_country=${selectedCountry}`);
  if (selectedCity) queryParams.push(`dep_city=${selectedCity}`);
  if (selectedAirline) queryParams.push(`airline_name=${selectedAirline}`);

  // Fetch flight data
  flightResults.innerHTML = '<p>Loading...</p>';
  allFlights = []; // Reset flights before fetching new ones

  try {
    const response = await fetch(`${BASE_URL}/flights?access_key=${API_KEY}&${queryParams.join('&')}`);
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

// Fetch initial data
fetchCountries();
fetchAirlines();
