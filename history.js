const historyBody = document.getElementById('historyBody');
const history = JSON.parse(localStorage.getItem('flightSearchHistory')) || [];

if (history.length === 0) {
  historyBody.innerHTML = `<tr><td colspan="4" class="text-center">No search history available.</td></tr>`;
} else {
  historyBody.innerHTML = history
    .map((item, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${item.depSearch}</td>
        <td>${item.arrSearch || 'N/A'}</td>
        <td>${item.airlineSearch || 'N/A'}</td>
      </tr>
    `)
    .join('');
}
