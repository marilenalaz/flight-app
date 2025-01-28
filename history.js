const STORAGE_ACCOUNT_NAME = "flightappsearchstorage";  
const TABLE_URL = `https://${STORAGE_ACCOUNT_NAME}.table.core.windows.net`;
const API_VERSION = "2020-12-06"; // Azure API Version
const SAS_TOKEN = "sv=2022-11-02&ss=t&srt=o&sp=rwlau&se=2025-03-17T21:28:49Z&st=2025-01-28T13:28:49Z&spr=https&sig=CGJsVENZIHzlm9ATRrOVX%2BHgBxTWCxPqDy%2F3cu7mIH4%3D"; // Replace with your actual SAS token

const historyBody = document.getElementById('historyBody');

// Function to load search history from Azure Table Storage
async function loadSearchHistory(userId) {
  const url = `${TABLE_URL}/SearchHistory?${SAS_TOKEN}&$filter=PartitionKey eq '${userId}'`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-ms-version": API_VERSION,
        "x-ms-date": new Date().toUTCString(),
        "Accept": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.value.length === 0) {
        historyBody.innerHTML = `<tr><td colspan="4" class="text-center">No search history available.</td></tr>`;
      } else {
        historyBody.innerHTML = data.value
          .map((item, index) => {
            const searchData = JSON.parse(item.searchData);
            return `
              <tr>
                <td>${index + 1}</td>
                <td>${searchData.depSearch || 'N/A'}</td>
                <td>${searchData.arrSearch || 'N/A'}</td>
                <td>${searchData.airlineSearch || 'N/A'}</td>
              </tr>
            `;
          })
          .join('');
      }
    } else {
      console.error("❌ Failed to load search history:", await response.text());
      historyBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Error loading history.</td></tr>`;
    }
  } catch (error) {
    console.error("❌ Error fetching search history:", error);
    historyBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Error loading history.</td></tr>`;
  }
}

// **Load history for a test user (Replace with actual user ID if needed)**
loadSearchHistory("testUser123");
