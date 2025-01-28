const STORAGE_ACCOUNT_NAME = "flightappsearchstorage"; // Your Storage Account Name
const TABLE_URL = `https://${STORAGE_ACCOUNT_NAME}.table.core.windows.net`;
const API_VERSION = "2020-12-06";
const SAS_TOKEN = "sv=2022-11-02&ss=t&srt=o&sp=rwlau&se=2025-03-17T21:28:49Z&st=2025-01-28T13:28:49Z&spr=https&sig=CGJsVENZIHzlm9ATRrOVX%2BHgBxTWCxPqDy%2F3cu7mIH4%3D";

const historyBody = document.getElementById('historyBody');

// **Load Search History from Azure Table Storage**
async function loadSearchHistory(userId) {
  const url = `${TABLE_URL}/SearchHistory()?${SAS_TOKEN}&$filter=PartitionKey eq '${userId}'`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-ms-version": API_VERSION,
        "x-ms-date": new Date().toUTCString(),
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    
    if (!data.value || data.value.length === 0) {
      historyBody.innerHTML = `<tr><td colspan="4" class="text-center">No search history available.</td></tr>`;
      return;
    }

    historyBody.innerHTML = data.value.map((item, index) => {
      let searchData;
      try {
        searchData = JSON.parse(item.searchData);
      } catch (error) {
        console.error("❌ Failed to parse searchData:", error);
        searchData = { depSearch: "Error", arrSearch: "Error", airlineSearch: "Error" };
      }

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${searchData.depSearch || 'N/A'}</td>
          <td>${searchData.arrSearch || 'N/A'}</td>
          <td>${searchData.airlineSearch || 'N/A'}</td>
        </tr>`;
    }).join('');

  } catch (error) {
    console.error("❌ Error fetching search history:", error);
    historyBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Error loading history.</td></tr>`;
  }
}

// **Load history for user (Replace with actual user ID if needed)**
loadSearchHistory("testUser123");
