if (!localStorage.getItem("role")) {
    window.location.href = "login/login.html";
}

const API = "http://127.0.0.1:8000";

// Global variables to track editing state and store locations data
let editingId = null;

// Store locations data for easy access during view/edit operations
let locationsData = [];

// Cache for categories 
let categoriesCache = [];

//Delete State Variable
let deleteId = null;

let deleteType = null; // "location" or "category"


// Show the add and manage location section and hide the other sections
function showLocations() {

    document.getElementById("addSection").style.display = "block";
    document.getElementById("manageCategorySection").style.display = "none";

    // AUTO CLOSE SIDEBAR
    closeSidebar()

}


// Show the category management section and hide the other sections
function showCategories() {

    document.getElementById("addSection").style.display = "none";
    document.getElementById("manageCategorySection").style.display = "block";

    // AUTO CLOSE SIDEBAR
    closeSidebar()

    loadCategoryTable();
}

const layout = document.querySelector(".admin-layout");

function toggleSidebar() {
    if (!layout) return;
    layout.classList.toggle("sidebar-open");
}

function closeSidebar() {
    if (!layout) return;
    layout.classList.remove("sidebar-open");
}



//========== Category Management Functions ==========

// Load categories from backend and add into the dropdown
async function loadCategories() {

    const res = await fetch(`${API}/categories`);
    const data = await res.json();

    categoriesCache = data;

    const select = document.getElementById("categorySelect");
    select.innerHTML = "";

    data.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat.id;
        opt.innerText = cat.name;
        select.appendChild(opt);
    });
}

// Load categories and build filter buttons when the page loads
async function loadCategoryTable() {

    const res = await fetch(`${API}/categories`);
    const data = await res.json();

    const table = document.getElementById("categoryTable");

    table.innerHTML = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th style="width:200px;">Actions</th>
                </tr>
            </thead>
            <tbody id="categoryBody"></tbody>
        </table>
    `;

    const body = document.getElementById("categoryBody");

    data.forEach(cat => {

        const row = document.createElement("tr");
        row.setAttribute("data-id", cat.id);

        row.innerHTML = `
            <td class="cat-name">${cat.name}</td>
            <td>
                <div class="action-buttons">
                    <button onclick="startCategoryEdit(${cat.id})"><i class="fa-regular fa-pen-to-square"></i></button>
                    <button onclick="openDeleteModal(${cat.id}, 'category')"><i class="fa-regular fa-trash-can"></i></button>
                </div>
            </td>
        `;


        body.appendChild(row);
    });
}

// Start inline editing for a category row in the table
async function addCategory() {

    const name = document.getElementById("newCategoryName").value;
    if (!name.trim()) return;

    await fetch(`${API}/categories`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: name
        })
    });

    document.getElementById("newCategoryName").value = "";

    loadCategoryTable();
    loadCategories(); // refresh dropdown
}

// Filter categories in the table based on category name.
function filterCategories() {

    const keyword = document.getElementById("categorySearch").value.toLowerCase();

    const rows = document.querySelectorAll("#categoryBody tr");

    rows.forEach(row => {

        const name = row.querySelector(".cat-name").innerText.toLowerCase();

        row.style.display = name.includes(keyword) ? "" : "none";

    });
}

// Delete a category by sending a delete request to the backend
function startCategoryEdit(id) {

    const row = document.querySelector(`#categoryBody tr[data-id="${id}"]`);
    if (!row) return;

    const nameCell = row.querySelector(".cat-name");
    if (!nameCell) return;

    const name = nameCell.innerText;

    row.innerHTML = `
        <td>
            <input id="edit-cat-name-${id}" value="${name}">
        </td>
        <td>
            <div class="action-buttons">
                <button onclick="saveCategoryEdit(${id})">
                    <i class="fa-regular fa-floppy-disk"></i>
                </button>
                <button onclick="loadCategoryTable()">
                    <i class="fa-solid fa-x"></i>
                </button>
            </div>
        </td>
    `;
}

// Save inline edits by sending an update request to the backend
async function saveCategoryEdit(id) {

    const name = document.getElementById(`edit-cat-name-${id}`).value;

    await fetch(`${API}/categories/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: name
        })
    });

    loadCategoryTable();
    loadCategories(); // refresh dropdown cache
}

// Clear JSON category file input
function clearJsonCategoryFile() {
    document.getElementById("jsonCategoryFile").value = "";
}

// Import categories from JSON file
async function importJsonCategories() {
    const fileInput = document.getElementById("jsonCategoryFile");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a JSON file");
        return;
    }

    try {
        const fileContent = await file.text();
        const categories = JSON.parse(fileContent);

        if (!Array.isArray(categories)) {
            alert("JSON must be an array of categories");
            return;
        }

        // Get existing categories to check for duplicates
        const res = await fetch(`${API}/categories`);
        const existingCategories = await res.json();
        const existingNames = new Set(existingCategories.map(cat => cat.name.toLowerCase()));

        let successCount = 0;
        let duplicateCount = 0;
        let failureCount = 0;

        for (const category of categories) {
            try {
                // Validate required fields
                if (!category.name || typeof category.name !== "string") {
                    console.error("Skipping category - missing or invalid name:", category);
                    failureCount++;
                    continue;
                }

                const categoryName = category.name.trim();

                // Check if name is empty after trimming
                if (!categoryName) {
                    failureCount++;
                    continue;
                }

                // Check for duplicates (case-insensitive)
                if (existingNames.has(categoryName.toLowerCase())) {
                    console.warn("Skipping duplicate category:", categoryName);
                    duplicateCount++;
                    continue;
                }

                // Add category to database
                const response = await fetch(`${API}/categories`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: categoryName
                    })
                });

                if (response.ok) {
                    successCount++;
                    existingNames.add(categoryName.toLowerCase()); // Update set for next iteration
                } else {
                    failureCount++;
                }
            } catch (error) {
                console.error("Error adding category:", error);
                failureCount++;
            }
        }

        clearJsonCategoryFile();
        loadCategoryTable();
        loadCategories();

        alert(`Import completed!\nSuccessfully added: ${successCount}\nDuplicate skipped: ${duplicateCount}\nFailed: ${failureCount}`);

    } catch (error) {
        alert("Error parsing JSON file: " + error.message);
    }
}


//========== Location Management Functions ==========

// Add a new location and update location
async function addLocation() {

    const name = document.getElementById("locName").value;
    const lat = document.getElementById("lat").value;
    const lon = document.getElementById("lon").value;
    const category_id = document.getElementById("categorySelect").value;

    const payload = {
        name: name,
        latitude: Number(parseFloat(lat).toFixed(6)),
        longitude: Number(parseFloat(lon).toFixed(6)),
        category_id: parseInt(category_id)
    };

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        alert("Invalid decimal degree coordinates");
        return;
    }

    if (editingId) {

        // UPDATE
        await fetch(`${API}/locations/${editingId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        editingId = null;
        alert("Location updated!");

    } else {

        // CREATE
        await fetch(`${API}/locations`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        alert("Location added!");
    }

    clearLocationForm();
    loadLocations();
}

// Load all locations and display in a table with view/edit/delete options
async function loadLocations() {

    const res = await fetch(`${API}/locations`);
    const data = await res.json();

    locationsData = data;

    const table = document.getElementById("locationTable");

    if (!data.length) {
        table.innerHTML = `<div class="no-results">No locations found</div>`;
        return;
    }

    table.innerHTML = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Latitude</th>
                    <th>Longitude</th>
                    <th>Category</th>
                    
                    <th>Actions</th>
                </tr>
            </thead>
        <tbody id="tableBody"></tbody>
        </table>
    `;

    const body = document.getElementById("tableBody");

    data.forEach(loc => {

        const row = document.createElement("tr");

        row.setAttribute("data-id", loc.id);

        row.innerHTML = `
        <td class="cell-name">${loc.name}</td>
        <td class="cell-lat">${loc.latitude}</td>
        <td class="cell-lon">${loc.longitude}</td>
        <td class="cell-cat" data-id="${loc.category_id}">${loc.category_name}</td>
        

        <td>
            <div class="action-buttons">
                <button onclick="viewLocation(${loc.id})"><i class="fa-regular fa-eye"></i></button>
                <button onclick="startInlineEdit(${loc.id})"><i class="fa-regular fa-pen-to-square"></i></button>
                <button onclick="openDeleteModal(${loc.id}, 'location')"><i class="fa-regular fa-trash-can"></i></button>
            </div>
        </td>
        `;

        body.appendChild(row);

    });

    clearLocationForm(); // Clear form after loading locations
}

// View location details in an alert box
function viewLocation(id) {

    const loc = locationsData.find(l => l.id === id);

    alert(
        "Name: " + loc.name +
        "\nLatitude: " + loc.latitude +
        "\nLongitude: " + loc.longitude +
        "\nCategory: " + loc.category_name
    );

}


// Filter locations in the table based on location name or category.
function filterLocations() {

    const keyword = document.getElementById("locationSearch").value.toLowerCase();

    const rows = document.querySelectorAll("#tableBody tr");

    rows.forEach(row => {

        const name = row.querySelector(".cell-name").innerText.toLowerCase();

        const category = row.querySelector(".cell-cat").innerText.toLowerCase();

        if (name.includes(keyword) || category.includes(keyword)) {
            row.style.display = "";
        }

        else {
            row.style.display = "none";
        }
    });
}


// Clear the add location form fields
function clearLocationForm() {

    document.getElementById("locName").value = "";
    document.getElementById("lat").value = "";
    document.getElementById("lon").value = "";

    // reset dropdown to first option
    document.getElementById("categorySelect").selectedIndex = 0;

    editingId = null; // also exit edit mode if active
}


// Start inline editing for a location row in the table
function startInlineEdit(id) {

    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (!row) return;

    const name = row.querySelector(".cell-name").innerText;
    const lat = row.querySelector(".cell-lat").innerText;
    const lon = row.querySelector(".cell-lon").innerText;
    const catId = row.querySelector(".cell-cat").dataset.id;

    // Build dropdown dynamically
    let optionsHTML = "";

    categoriesCache.forEach(cat => {

        const selected = cat.id == catId ? "selected" : "";

        optionsHTML += `
            <option value="${cat.id}" ${selected}>
                ${cat.name}
            </option>
        `;
    });

    row.innerHTML = `
        <td><input class="row-input" id="edit-name-${id}" value="${name}" /></td>
        <td><input class="row-input" id="edit-lat-${id}" value="${lat}" /></td>
        <td><input class="row-input" id="edit-lon-${id}" value="${lon}" /></td>
        <td>
            <select class="row-input" id="edit-cat-${id}">
                ${optionsHTML}
            </select>
        </td>
        <td style="display:flex; gap:6px;">
            <button class="save-btn" onclick="saveInlineEdit(${id})"><i class="fa-regular fa-floppy-disk"></i></button>
            <button class="cancel-btn" onclick="loadLocations()"><i class="fa-solid fa-x"></i></button>
        </td>
    `;
}


// Save inline edits by sending an update request to the backend
async function saveInlineEdit(id) {

    const name = document.getElementById(`edit-name-${id}`).value;
    const lat = document.getElementById(`edit-lat-${id}`).value;
    const lon = document.getElementById(`edit-lon-${id}`).value;
    const category_id = document.getElementById(`edit-cat-${id}`).value;

    await fetch(`${API}/locations/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: name,
            latitude: parseFloat(lat),
            longitude: parseFloat(lon),
            category_id: parseInt(category_id)
        })
    });

    loadLocations();
}

// Clear JSON file input
function clearJsonFile() {
    document.getElementById("jsonFile").value = "";
}

// Import locations from JSON file
async function importJsonLocations() {
    const fileInput = document.getElementById("jsonFile");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a JSON file");
        return;
    }

    try {
        const fileContent = await file.text();
        const locations = JSON.parse(fileContent);

        if (!Array.isArray(locations)) {
            alert("JSON must be an array of locations");
            return;
        }

        // Get existing locations to check for duplicates
        const res = await fetch(`${API}/locations`);
        const existingLocations = await res.json();

        // Create a set of existing location keys (name + lat + lon + category_id) for duplicate detection
        const existingLocKeys = new Set(
            existingLocations.map(loc =>
                `${loc.name.toLowerCase()}|${parseFloat(loc.latitude).toFixed(6)}|${parseFloat(loc.longitude).toFixed(6)}|${loc.category_id}`
            )
        );

        let successCount = 0;
        let duplicateCount = 0;
        let failureCount = 0;

        for (const location of locations) {
            try {
                // Validate required fields
                if (!location.name || location.latitude === undefined || location.longitude === undefined || !location.category_id) {//
                    console.error("Skipping location - missing required fields:", location);//
                    failureCount++;
                    continue;
                }

                // Validate coordinates
                const lat = parseFloat(location.latitude);
                const lon = parseFloat(location.longitude);

                if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
                    console.error("Skipping location - invalid coordinates:", location);
                    failureCount++;
                    continue;
                }
                
                const locationName = location.name.trim();
                const categoryId = parseInt(location.category_id);
                const latFixed = lat.toFixed(6);
                const lonFixed = lon.toFixed(6);

                // Check for duplicate (same name, coordinates, and category)
                const locKey = `${locationName.toLowerCase()}|${latFixed}|${lonFixed}|${categoryId}`;
                if (existingLocKeys.has(locKey)) {
                    console.warn("Skipping duplicate location:", locationName, "at", latFixed, lonFixed, "in category:", categoryId);
                    duplicateCount++;
                    continue;
                }

                const payload = {
                    name: locationName,
                    latitude: Number(latFixed),
                    longitude: Number(lonFixed),
                    category_id: categoryId
                };

                // Add location to database
                const response = await fetch(`${API}/locations`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    successCount++;
                    existingLocKeys.add(locKey); // Update set for next iteration
                } else {
                    failureCount++;
                }
            } catch (error) {
                console.error("Error adding location:", error);
                failureCount++;
            }
        }

        clearJsonFile();
        loadLocations();

        alert(`Import completed!\nSuccessfully added: ${successCount}\nDuplicate skipped: ${duplicateCount}\nFailed: ${failureCount}`);

    } catch (error) {
        console.error("Import error:", error);
        alert("Error parsing JSON file: " + error.message);
    }
}


//========== Go To Home Dashboard Function ==========
function goHome() {
    window.location.href = "home/home.html";
}



//========== Logout confirmation modal functions ==========

// Functions to handle logout confirmation modal
function openLogoutModal() {
    document.getElementById("logoutModal").style.display = "flex";
}

function closeLogoutModal() {
    document.getElementById("logoutModal").style.display = "none";
}

function confirmLogout() {

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");

    window.location.href = "login/login.html";
}


//========== Delete confirmation modal functions ==========

// Functions to handle delete confirmation modal
function openDeleteModal(id, type) {

    deleteId = id;
    deleteType = type;

    const msg = document.getElementById("deleteMessage");

    if (type === "location") {
        msg.innerText = "Are you sure you want to delete this location?";
    } else if (type === "category") {
        msg.innerText = "Are you sure you want to delete this category?";
    }

    document.getElementById("deleteModal").style.display = "flex";
}


function closeDeleteModal() {

    deleteId = null;
    document.getElementById("deleteModal").style.display = "none";
}

async function confirmDelete() {

    if (!deleteId) return;

    if (deleteType === "location") {

        await fetch(`${API}/locations/${deleteId}`, {
            method: "DELETE"
        });

        loadLocations();

    } else if (deleteType === "category") {

        await fetch(`${API}/categories/${deleteId}`, {
            method: "DELETE"
        });

        loadCategoryTable();
        loadCategories();
    }

    closeDeleteModal();
}

// Initialize page on load
loadLocations();
loadCategories();
