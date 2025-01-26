const watchlistContainer = document.getElementById('watchlistContainer');

async function fetchWatchlist() {
  if (!authToken) {
    alert('You must log in to view your watchlist.');
    return;
  }

  const response = await fetch('http://localhost:5000/watchlist', {
    headers: { Authorization: `Bearer ${authToken}` },
  });

  const watchlist = await response.json();

  watchlistContainer.innerHTML = watchlist
    .map(
      (flight) => `
    <div class="flight">
      <h3>${flight.airline} (${flight.flightNumber})</h3>
      <p>From: ${flight.departure}</p>
      <p>To: ${flight.arrival}</p>
      <button onclick="removeFromWatchlist('${flight.id}')">Remove</button>
    </div>`
    )
    .join('');
}

async function removeFromWatchlist(flightId) {
  const response = await fetch(`http://localhost:5000/watchlist/${flightId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${authToken}` },
  });

  const data = await response.json();
  alert(data.message || data.error);
  fetchWatchlist();
}

document.addEventListener('DOMContentLoaded', fetchWatchlist);
