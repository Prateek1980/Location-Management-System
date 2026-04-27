
let map;
let layers = {};
let activeLayer = null;
let activeCategoryLayer = null;
let activeCategoryFilter = "all";
let locationMarkers = L.layerGroup();
let locationsData = [];
let categoryLayers = {};
let allMarkersLayer = L.layerGroup();


// Initialize the map
function initMap() {

  map = L.map('map', {
    zoomControl: true,
    crs: L.CRS.EPSG4326
  }).setView([20, 78], 5);

  createLayers();

  setLayer("roads");

  loadLocations();

  buildCategoryButtons();

  setupSearch();

  setInterval(loadLocations, 60000);
}

// Create tile layers for satellite and roads
function createLayers() {

  layers.satellite = L.tileLayer(
    "http://106.51.140.227:8085/geoserver/gwc/service/wmts" +
    "?layer=India_Sat_Images:India_Sat_Images" +
    "&style=" +
    "&tilematrixset=EPSG:4326" +
    "&Service=WMTS" +
    "&Request=GetTile" +
    "&Version=1.0.0" +
    "&Format=image/png" +
    "&TileMatrix=EPSG:4326:{z}" +
    "&TileRow={y}" +
    "&TileCol={x}",
    { tileSize: 256, noWrap: true}
  );

  layers.roads = L.tileLayer(
    "http://106.51.140.227:8085/geoserver/gwc/service/wmts" +
    "?layer=India_Roads:India_Roads" +
    "&style=" +
    "&tilematrixset=EPSG:4326" +
    "&Service=WMTS" +
    "&Request=GetTile" +
    "&Version=1.0.0" +
    "&Format=image/png" +
    "&TileMatrix=EPSG:4326:{z}" +
    "&TileRow={y}" +
    "&TileCol={x}",

    { tileSize: 256, noWrap: true}
  );
}

// Function to switch layers
function setLayer(name) {

  if (activeLayer) {
    map.removeLayer(activeLayer);
  }

  activeLayer = layers[name];
  activeLayer.addTo(map);
}

// Functions to show specific layers
function showSatelliteLayer() {
  setLayer("satellite");
}

function showRoadLayer() {
  setLayer("roads");
}

// Function to toggle the layer selection panel
function toggleLayerPanel() {

  const layerPanel = document.getElementById("layerPanel");
  const categoryPanel = document.getElementById("categoryPanel");

  // close category panel first
  categoryPanel.style.display = "none";

  // toggle layer panel
  layerPanel.style.display =
    layerPanel.style.display === "block" ? "none" : "block";
}


//Function to load locations from backend and display on map
async function loadLocations() {

    const response = await fetch("http://127.0.0.1:8000/locations");
    const data = await response.json();
    locationsData = data; // Store for search functionality

    //Clear previous layers
    allMarkersLayer.clearLayers();
    categoryLayers = {};

    data.forEach(loc => {

        const category = loc.category_name;//returning category name

        //Create category layer if not exists
        if (!categoryLayers[category]) {
            categoryLayers[category] = L.layerGroup();
        }

        const marker = L.marker([loc.latitude, loc.longitude])
            .bindPopup(`<b>${loc.name}</b><br>${category}`);

        categoryLayers[category].addLayer(marker);
        allMarkersLayer.addLayer(marker);
    });

    //Apply current filter instead of showing all
    filterCategory(activeCategoryFilter);
}


// Function for search functionality
function setupSearch() {

  const input = document.querySelector(".search-input");
  const resultsBox = document.getElementById("searchResults");

  input.addEventListener("input", () => {

    const value = input.value.toLowerCase();
    resultsBox.innerHTML = "";

    if (value.length < 2) return;

    const matches = locationsData.filter(loc =>
      loc.name.toLowerCase().includes(value)
    );

    matches.forEach(loc => {

      const div = document.createElement("div");
      div.className = "search-item";
      div.innerText = loc.name;

      div.onclick = () => {
        map.flyTo([loc.latitude, loc.longitude], 13);
        resultsBox.innerHTML = "";
      };

      resultsBox.appendChild(div);

    });

  });
}

// Filter locations by category
function filterCategory(categoryName) {

    //remember current filter
    activeCategoryFilter = categoryName;

    // Remove currently active layer first
    if (activeCategoryLayer) {
        map.removeLayer(activeCategoryLayer);
    }

    // If ALL selected
    if (categoryName === "all") {
        activeCategoryLayer = allMarkersLayer;
        activeCategoryLayer.addTo(map);
        return;
    }

    // If specific category selected
    if (categoryLayers[categoryName]) {
        activeCategoryLayer = categoryLayers[categoryName];
        activeCategoryLayer.addTo(map);
    }
}



// Build category filter buttons dynamically in frontend
async function buildCategoryButtons() {

    try {

        const res = await fetch("http://127.0.0.1:8000/categories");
        const categories = await res.json();

        const panel = document.getElementById("categoryPanel");
        panel.innerHTML = "";

        // ALL button
        const allBtn = document.createElement("button");
        allBtn.innerText = "All";
        allBtn.onclick = () => filterCategory("all");
        panel.appendChild(allBtn);

        // Dynamic buttons
        categories.forEach(cat => {

            const btn = document.createElement("button");
            btn.innerText = cat.name;
            btn.onclick = () => filterCategory(cat.name);

            panel.appendChild(btn);

        });

    } catch(err) {

        console.error("CATEGORY LOAD FAILED:", err);

    }
}


// Function to toggle the category filter panel
function toggleCategoryPanel() {

    const categoryPanel = document.getElementById("categoryPanel");
    const layerPanel = document.getElementById("layerPanel");

    // close layer panel first
    layerPanel.style.display = "none";

    // toggle category panel
    categoryPanel.style.display =
        categoryPanel.style.display === "block" ? "none" : "block";
}


initMap();
