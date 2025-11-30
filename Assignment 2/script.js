// =======================
// CONFIG – PUT YOUR NASA API KEY HERE
// =======================

// Get a free key at https://api.nasa.gov
const NASA_API_KEY = "Your_api_Key";  // <-- paste your key here
const APOD_URL = "https://api.nasa.gov/planetary/apod";

// =======================
// DOM ELEMENTS
// =======================
const form = document.getElementById("apod-form");
const dateInput = document.getElementById("apod-date-input");
const statusEl = document.getElementById("status");
const resultsCard = document.getElementById("results-card");

const apodImage = document.getElementById("apod-image");
const apodTitle = document.getElementById("apod-title");
const apodDate = document.getElementById("apod-date");
const apodDescription = document.getElementById("apod-description");
const apodCopy = document.getElementById("apod-copy");

const historyList = document.getElementById("history-list");
const clearHistoryBtn = document.getElementById("clear-history-btn");

// =======================
// INITIAL SETUP
// =======================

// Event type #2: change on date input
dateInput.addEventListener("change", () => {
  if (dateInput.value) {
    showStatus(`Date selected: ${dateInput.value}`, false);
  }
});

// Optional: default date = today
(function setTodayAsDefault() {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  dateInput.value = `${y}-${m}-${d}`;
})();

// Event type #3: click on "Clear list" button
clearHistoryBtn.addEventListener("click", () => {
  historyList.innerHTML = "";          // remove all <li>
  showStatus("Viewed dates list cleared.");
});

// =======================
// FORM SUBMIT (event type #1)
// =======================
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!NASA_API_KEY || NASA_API_KEY === "YOUR_API_KEY_HERE") {
    showStatus("Please add your NASA API key in script.js first.", true);
    hideResults();
    return;
  }

  const selectedDate = dateInput.value;
  if (!selectedDate) {
    showStatus("Please choose a date.", true);
    hideResults();
    return;
  }

  showStatus("Loading image from NASA...");
  hideResults();

  try {
    const url = `${APOD_URL}?api_key=${encodeURIComponent(
      NASA_API_KEY
    )}&date=${selectedDate}`;

    const response = await fetch(url);  // AJAX call via fetch()

    if (!response.ok) {
      if (response.status === 400) {
        showStatus(
          "Invalid date. NASA APOD works from 1995-06-16 to today.",
          true
        );
      } else {
        showStatus("Error fetching data from NASA. Try again later.", true);
      }
      return;
    }

    const data = await response.json();

    // Fill text fields (5+ API elements: image, title, date, copyright, description)
    apodTitle.textContent = data.title || "No title available";
    apodDate.textContent = data.date || selectedDate;
    apodCopy.textContent = data.copyright || "Public domain / not specified";

    if (data.media_type !== "image") {
      apodImage.style.display = "none";
      apodDescription.textContent =
        "The Astronomy Picture of the Day for this date is a video. " +
        "You can view it here: " +
        (data.url || "No URL provided.");
    } else {
      apodImage.style.display = "block";
      apodImage.src = data.url;
      apodImage.alt = data.title || "NASA Astronomy Picture of the Day";
      apodDescription.textContent =
        data.explanation || "No description available.";
    }

    // DOM creation + removal: keep last 5 viewed dates
    addDateToHistory(data.date || selectedDate);

    showStatus("Image loaded successfully!");
    showResults();
  } catch (error) {
    console.error(error);
    showStatus(
      "Something went wrong. Please check your internet or API key.",
      true
    );
    hideResults();
  }
});

// =======================
// HISTORY LIST (DOM create + remove)
// =======================
function addDateToHistory(dateStr) {
  const li = document.createElement("li");
  li.textContent = dateStr;
  historyList.appendChild(li);

  // If more than 5 items, remove the oldest one
  while (historyList.children.length > 5) {
    historyList.removeChild(historyList.firstElementChild);
  }
}

// =======================
// HELPERS
// =======================
function showStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", !!isError);
}

function showResults() {
  resultsCard.style.display = "block";
}

function hideResults() {
  resultsCard.style.display = "none";
}
