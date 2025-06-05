const d = document,
  $verbCardsContainer = d.getElementById("verb-cards-container"),
  $template = d.getElementById("dataTemplate").content,
  $searchInput = d.getElementById("search-input"),
  $typeFilter = d.getElementById("type-filter"),
  $showAllBtn = d.getElementById("show-all-btn"),
  $showRandomBtn = d.getElementById("show-random-btn"),
  $notificacionVerbs = d.querySelector(".notificacion-verbs");

let allVerbsData = []; // To store all verbs fetched from data.json
let displayedVerbIds = []; // Used for random verb generation uniqueness

// Function to fetch data from local data.json
const readData = async () => {
  try {
    const response = await fetch("./data.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.englishVerbs || []; // Ensure it returns an array
  } catch (error) {
    console.error("Error fetching local data:", error);
    $notificacionVerbs.textContent = `Error loading verb data: ${error.message}. Please try again later.`;
    $notificacionVerbs.classList.add("active");
    return []; // Return empty array on error
  }
};

// Function to display verb cards
const displayVerbCards = (verbsToDisplay) => {
  $verbCardsContainer.innerHTML = ""; // Clear previous cards
  $notificacionVerbs.classList.remove("active");
  $notificacionVerbs.textContent = "";

  if (!verbsToDisplay || verbsToDisplay.length === 0) {
    $notificacionVerbs.textContent = "No verbs found matching your criteria.";
    $notificacionVerbs.classList.add("active");
    return;
  }

  const fragment = d.createDocumentFragment();
  verbsToDisplay.forEach((verb) => {
    const $clone = d.importNode($template, true);
    $clone.querySelector(".verb-simple-form").textContent = verb.simpleForm;
    $clone.querySelector(".verb-type").textContent = verb.type === "R" ? "Regular" : "Irregular";
    $clone.querySelector(".verb-third-person").textContent = verb.thirdPerson;
    $clone.querySelector(".verb-simple-past").textContent = verb.simplePast;
    $clone.querySelector(".verb-past-participle").textContent = verb.pastParticiple;
    $clone.querySelector(".verb-gerund").textContent = verb.gerund;
    $clone.querySelector(".verb-meaning").textContent = verb.meaning;
    fragment.appendChild($clone);
  });
  $verbCardsContainer.appendChild(fragment);
};

// Function to generate a unique random number (using verb ID)
function generateUniqueRandomId(maxId, excludedIds) {
  if (excludedIds.length >= maxId) { // Check if all possible IDs are excluded
    throw new Error("All verbs have been shown randomly. Click 'Show All' to reset.");
  }
  let randomId;
  let verbExistsWithId;
  do {
    randomId = Math.floor(Math.random() * maxId) + 1; // Assuming IDs are 1-based and consecutive
    // Check if this ID actually exists in our dataset and is not excluded
    verbExistsWithId = allVerbsData.some(verb => verb.id === randomId);
  } while (excludedIds.includes(randomId) || !verbExistsWithId);
  return randomId;
}

// Function to filter and display verbs based on search and type
const filterAndDisplayVerbs = () => {
  const searchTerm = $searchInput.value.toLowerCase().trim();
  const selectedType = $typeFilter.value;

  let filteredVerbs = allVerbsData;

  if (searchTerm) {
    filteredVerbs = filteredVerbs.filter(verb =>
      verb.simpleForm.toLowerCase().includes(searchTerm) ||
      verb.meaning.toLowerCase().includes(searchTerm) // Optionally search in meaning too
    );
  }

  if (selectedType !== "all") {
    filteredVerbs = filteredVerbs.filter(verb => verb.type === selectedType);
  }

  displayVerbCards(filteredVerbs);
};

// Event Listeners
d.addEventListener("DOMContentLoaded", async () => {
  allVerbsData = await readData();
  if (allVerbsData.length > 0) {
    displayVerbCards(allVerbsData); // Display all verbs initially
    // Load displayedVerbIds from localStorage if needed for persistence across sessions
    const storedIds = localStorage.getItem("displayedVerbIds");
    if (storedIds) {
      displayedVerbIds = JSON.parse(storedIds);
    }
  }
});

$showAllBtn.addEventListener("click", () => {
  $searchInput.value = ""; // Clear search
  $typeFilter.value = "all"; // Reset filter
  displayedVerbIds = []; // Reset random verb tracking
  localStorage.removeItem("displayedVerbIds");
  displayVerbCards(allVerbsData);
});

$showRandomBtn.addEventListener("click", () => {
  if (allVerbsData.length === 0) {
    $notificacionVerbs.textContent = "No verbs data loaded.";
    $notificacionVerbs.classList.add("active");
    return;
  }

  // Reset search and filter when showing random verbs
  $searchInput.value = "";
  $typeFilter.value = "all";

  const randomVerbsToShow = [];
  const numberOfRandomVerbs = 10;
  // Max ID in the dataset, assuming IDs are somewhat dense, or use allVerbsData.length as a proxy if IDs are not numbers.
  // For this implementation, we rely on verb.id being a number.
  const maxId = Math.max(...allVerbsData.map(v => v.id), 0);


  if (displayedVerbIds.length >= allVerbsData.filter(v => v.id <= maxId).length) {
     $notificacionVerbs.textContent = "All verbs have been shown randomly. Click 'Show All' to reset.";
     $notificacionVerbs.classList.add("active");
     return;
  }


  try {
    for (let i = 0; i < numberOfRandomVerbs; i++) {
      if (displayedVerbIds.length >= allVerbsData.length) break; // Stop if all shown
      const randomId = generateUniqueRandomId(maxId, displayedVerbIds);
      const verb = allVerbsData.find(v => v.id === randomId);
      if (verb) {
        randomVerbsToShow.push(verb);
        displayedVerbIds.push(randomId);
      }
    }
    localStorage.setItem("displayedVerbIds", JSON.stringify(displayedVerbIds));
    displayVerbCards(randomVerbsToShow);
  } catch (error) {
    $notificacionVerbs.textContent = error.message;
    $notificacionVerbs.classList.add("active");
  }
});

$searchInput.addEventListener("keyup", filterAndDisplayVerbs);
$typeFilter.addEventListener("change", filterAndDisplayVerbs);
