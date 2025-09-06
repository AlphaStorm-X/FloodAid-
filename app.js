
const steps = document.querySelectorAll(".step");
const loginStep = document.getElementById("step-login");
const dashboardStep = document.getElementById("step-dashboard");
const submitRequestStep = document.getElementById("step-submit-request");
const floodPredictionStep = document.getElementById("step-flood-prediction");
const aiChatbotStep = document.getElementById("step-ai-chatbot");
const requestInventoryStep = document.getElementById("step-request-inventory");

const loginBtn = document.getElementById("login-btn");
const loginUsername = document.getElementById("login-username");
const loginPassword = document.getElementById("login-password");
const loginError = document.getElementById("login-error");

const dashboardUsername = document.getElementById("dashboard-username");

const btnToSubmitRequest = document.getElementById("btn-to-submit-request");
const btnToFloodPrediction = document.getElementById("btn-to-flood-prediction");
const btnToAIChatbot = document.getElementById("btn-to-ai-chatbot");
const btnToRequestInventory = document.getElementById("btn-to-request-inventory");
const btnLogout = document.getElementById("btn-logout");

const submitRequestBack = document.getElementById("submit-request-back");
const submitRequestNext = document.getElementById("submit-request-next");
const reqName = document.getElementById("req-name");
const reqDetails = document.getElementById("req-details");
const reqUrgency = document.getElementById("req-urgency");
const reqFacility = document.getElementById("req-facility");
const submitRequestError = document.getElementById("submit-request-error");

const floodPredictionBack = document.getElementById("flood-prediction-back");
const floodPredictionNext = document.getElementById("flood-prediction-next");
const locationName = document.getElementById("location-name");
const floodRiskPercentage = document.getElementById("flood-risk-percentage");
const mapDiv = document.getElementById("map");
const highRiskPlacesList = document.getElementById("high-risk-places");

const aiChatbotBack = document.getElementById("ai-chatbot-back");
const aiChatbotLogout = document.getElementById("ai-chatbot-logout");
const chatWindow = document.getElementById("chat-window");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatError = document.getElementById("chat-error");

const requestInventoryList = document.getElementById("request-inventory-list");
const requestInventorySummary = document.getElementById("request-inventory-summary");
const requestInventoryBack = document.getElementById("request-inventory-back");

// State variables
let currentUser = null;
let requests = [];
let map, marker;
let currentLocation = null;

// Show only one step (section) at a time
function showStep(stepToShow) {
  steps.forEach(step => step.classList.remove("active-step"));
  stepToShow.classList.add("active-step");
}

// Reset the submit request form fields
function resetSubmitRequestForm() {
  reqName.value = "";
  reqDetails.value = "";
  reqUrgency.value = "high";
  for (let i = 0; i < reqFacility.options.length; i++) {
    reqFacility.options[i].selected = false;
  }
  submitRequestError.textContent = "";
}

// Validate submit request form
function validateSubmitRequest() {
  if (!reqName.value.trim()) {
    submitRequestError.textContent = "Please enter your name.";
    return false;
  }
  if (!reqDetails.value.trim()) {
    submitRequestError.textContent = "Please provide emergency details.";
    return false;
  }
  const selectedFacilities = Array.from(reqFacility.selectedOptions).map(opt => opt.value);
  if (selectedFacilities.length === 0) {
    submitRequestError.textContent = "Please select at least one facility.";
    return false;
  }
  submitRequestError.textContent = "";
  return true;
}

//  new rescue request to state
function addRequest(request) {
  requests.push(request);
}

// Update username display in dashboard
function updateDashboardUsername() {
  dashboardUsername.textContent = currentUser;
}

// Event Listeners

// Login button
loginBtn.addEventListener("click", () => {
  const username = loginUsername.value.trim();
  const password = loginPassword.value.trim();
  if (username === "admin" && password === "1234") {
    currentUser = username;
    updateDashboardUsername();
    showStep(dashboardStep);
    loginError.textContent = "";
    loginUsername.value = "";
    loginPassword.value = "";
  } else {
    loginError.textContent = "Invalid username or password.";
  }
});

// Logout button
btnLogout.addEventListener("click", () => {
  currentUser = null;
  showStep(loginStep);
});

// Navigate to Submit Rescue Request page
btnToSubmitRequest.addEventListener("click", () => {
  resetSubmitRequestForm();
  showStep(submitRequestStep);
});

// Back from Submit Request to Dashboard
submitRequestBack.addEventListener("click", () => {
  showStep(dashboardStep);
});

// Submit Request form submission
submitRequestNext.addEventListener("click", () => {
  if (!validateSubmitRequest()) return;
  const newRequest = {
    name: reqName.value.trim(),
    details: reqDetails.value.trim(),
    urgency: reqUrgency.value,
    facilities: Array.from(reqFacility.selectedOptions).map(opt => opt.value),
    timestamp: new Date().toISOString(),
  };
  addRequest(newRequest);
  alert("Request submitted!");
  resetSubmitRequestForm();
  showStep(dashboardStep);
});

// Navigate to Flood Prediction page
btnToFloodPrediction.addEventListener("click", () => {
  showStep(floodPredictionStep);
  initializeMapAndLocation();
});

// Back from Flood Prediction to Dashboard
floodPredictionBack.addEventListener("click", () => {
  showStep(dashboardStep);
});

// Next from Flood Prediction to AI Chatbot
floodPredictionNext.addEventListener("click", () => {
  showStep(aiChatbotStep);
  scrollChatToBottom();
});

// Navigate to AI Chatbot from Dashboard
btnToAIChatbot.addEventListener("click", () => {
  showStep(aiChatbotStep);
  scrollChatToBottom();
});

// Back from AI Chatbot to Dashboard
aiChatbotBack.addEventListener("click", () => {
  showStep(dashboardStep);
});

// Logout from AI Chatbot
aiChatbotLogout.addEventListener("click", () => {
  currentUser = null;
  showStep(loginStep);
});

// Navigate to Request Inventory 
if (btnToRequestInventory) {
  btnToRequestInventory.addEventListener("click", () => {
    renderRequestInventory();
    showStep(requestInventoryStep);
  });
}


requestInventoryBack.addEventListener("click", () => {
  showStep(dashboardStep);
});

function initializeMapAndLocation() {
  if (map) {
    map.remove();
  }

  map = L.map('map').setView([20.5937, 78.9629], 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 10,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  const highRiskPlaces = [
    { name: "Odisha", lat: 20.9517, lon: 85.0985, risk: 85 },
    { name: "Assam", lat: 26.2006, lon: 92.9376, risk: 75 },
    { name: "Bihar", lat: 25.0961, lon: 85.3131, risk: 70 },
    { name: "West Bengal", lat: 22.9868, lon: 87.8550, risk: 65 },
  ];
  highRiskPlaces.forEach(place => {
    const circleColor = place.risk >= 80 ? "#d32f2f" : "#fbc02d";
    L.circle([place.lat, place.lon], {
      color: circleColor,
      fillColor: circleColor,
      fillOpacity: 0.5,
      radius: 35000
    }).addTo(map).bindPopup(`${place.name} — Risk: ${place.risk}%`);
  });

  //  high risk places list
  if (highRiskPlacesList) {
    highRiskPlacesList.innerHTML = "";
    highRiskPlaces.forEach(place => {
      const li = document.createElement("li");
      li.textContent = `${place.name}: ${place.risk}% Flood Risk`;
      highRiskPlacesList.appendChild(li);
    });
  }

  //  user location
  locationName.textContent = "Detecting...";
  floodRiskPercentage.textContent = "--%";

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      currentLocation = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
      };
      locationName.textContent = `Lat: ${currentLocation.lat.toFixed(2)}, Lon: ${currentLocation.lon.toFixed(2)}`;
      floodRiskPercentage.textContent = calculateFloodRisk(currentLocation.lat, currentLocation.lon) + "%";

      
      marker = L.marker([currentLocation.lat, currentLocation.lon]).addTo(map)
        .bindPopup("Your Location").openPopup();

      map.setView([currentLocation.lat, currentLocation.lon], 7);

    }, () => {
      locationName.textContent = "Location not available";
      floodRiskPercentage.textContent = "N/A";
    });
  } else {
    locationName.textContent = "Geolocation not supported";
    floodRiskPercentage.textContent = "N/A";
  }
}


function calculateFloodRisk(lat, lon) {

  let risk = Math.max(0, 100 - (lat - 10) * 3);
  return Math.round(risk);
}


function scrollChatToBottom() {
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// AI Chatbot form submission
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const userMessage = chatInput.value.trim();
  if (!userMessage) {
    chatError.textContent = "Please enter a message.";
    return;
  }
  chatError.textContent = "";
  appendMessage("You", userMessage);
  chatInput.value = "";
  simulateBotResponse(userMessage);
});

function appendMessage(sender, message) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("chat-message");
  msgDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
  chatWindow.appendChild(msgDiv);
  scrollChatToBottom();
}

// Simple bot response simulator
function simulateBotResponse(userMsg) {
  setTimeout(() => {
    const response = generateBotResponse(userMsg);
    appendMessage("Bot", response);
  }, 1000);
}

// Simple bot 
const botAnswers = {
  hi: "Hello! I'm your AI assistant. How can I support you during this emergency?",
  flood: "Floods occur due to excessive rain, river overflow, or cyclones. Stay alert and follow evacuation orders.",
  rescue: "If you need rescue, please submit a request with your details in the 'Submit Rescue Request' section.",
  help: "You can ask me about floods, rescue, safety tips, or submit requests via the dashboard.",
  medicine: "Make sure you have a first aid kit and medicines ready. Contact local health services if needed.",
  food: "Ensure you have clean drinking water and non-perishable food during flood emergencies.",
  safetytips: "Stay calm, move to higher ground immediately, avoid fast-moving water, and call for help if possible.",
  hello: "Hi! How can I help you today?",
  thanks: "You're welcome! Stay safe."
};

// Replace your existing generateBotResponse function with this:
function generateBotResponse(message) {
  message = message.toLowerCase();

  for (const key in botAnswers) {
    if (message.includes(key)) {
      return botAnswers[key];
    }
  }
  return "Sorry, I didn't understand that. Please ask about flood risks, rescue, or safety tips.";
}

// Render the request inventory list and summary
function renderRequestInventory() {
  if (!requestInventoryList || !requestInventorySummary) return;

  requestInventoryList.innerHTML = "";

  if (requests.length === 0) {
    requestInventoryList.innerHTML = "<li>No requests submitted yet.</li>";
    requestInventorySummary.innerHTML = "";
    return;
  }

  let counts = { high: 0, medium: 0, low: 0 };
  let facilitiesCount = {};

  requests.forEach(req => {
    // Count urgencies
    if (req.urgency in counts) {
      counts[req.urgency]++;
    }
    // Count facilities needed
    req.facilities.forEach(fac => {
      facilitiesCount[fac] = (facilitiesCount[fac] || 0) + 1;
    });

    const li = document.createElement("li");
    li.textContent = `${req.name} - ${req.urgency.toUpperCase()} urgency - Facilities: ${req.facilities.join(", ")}`;
    requestInventoryList.appendChild(li);
  });

  let total = requests.length;
  let summaryText = `Total requests: ${total} | Urgency - High: ${counts.high}, Medium: ${counts.medium}, Low: ${counts.low}<br/>Facilities needed: `;
  summaryText += Object.entries(facilitiesCount).map(([f, c]) => `${f}: ${c}`).join(", ");
  requestInventorySummary.innerHTML = summaryText;
}

// Start on login page
showStep(loginStep);
