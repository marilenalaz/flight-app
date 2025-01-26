const historyBody = document.getElementById('historyBody');
const history = JSON.parse(localStorage.getItem('flightSearchHistory')) || [];

historyBody.innerHTML = history.map((item, index) => `
  <tr>
    <td>${index + 1}</td>
    <td>${item.depAirport}</td>
    <td>${item.arrAirport || 'N/A'}</td>
  </tr>
`).join('');
