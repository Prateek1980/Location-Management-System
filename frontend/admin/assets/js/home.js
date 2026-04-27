const API = "http://127.0.0.1:8000";

const name = localStorage.getItem("name");
const role = localStorage.getItem("role");
const email = localStorage.getItem("email");



if (!role) {
    window.location.href = "../login/login.html";
}

// Functions to handle logout confirmation modal
function openLogoutModal() {
    document.getElementById("logoutModal").style.display = "flex";
}

function closeLogoutModal() {
    document.getElementById("logoutModal").style.display = "none";
}

function confirmLogout() {
    localStorage.clear();
    window.location.href = "../login/login.html";
}

async function loadHome() {

    // ========== Welcome ==========
    document.getElementById("welcomeBox").innerHTML = `
        <h2>Welcome, ${name}</h2>
        <p>Role: ${role}</p>
        
    `;

    // ========== Fetch stats ==========
    const locationsRes = await fetch(`${API}/locations`);
    const locations = await locationsRes.json();

    const categoriesRes = await fetch(`${API}/categories`);
    const categories = await categoriesRes.json();

    document.getElementById("statsContainer").innerHTML = `
        <div class="stat-card">
            <h3>Total Locations</h3>
            <p>${locations.length}</p>
        </div>
        <div class="stat-card">
            <h3>Total Categories</h3>
            <p>${categories.length}</p>
        </div>
    `;


    // ========== Locations Per Category Breakdown ==========

    const categoryCount = {};

    // Initialize counts
    categories.forEach(cat => {
        categoryCount[cat.name] = 0;
    });

    // Count locations
    locations.forEach(loc => {
        if (categoryCount.hasOwnProperty(loc.category_name)) {
            categoryCount[loc.category_name]++;
        }
    });

    // Convert to array for sorting
    let sortedCategories = Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1]); // descending

    let topLimit = 5;
    let othersTotal = 0;

    let breakdownHTML = ``;

    sortedCategories.forEach((entry, index) => {
    const [category, count] = entry;

    if (index < topLimit && count > 0) {
        breakdownHTML += `
            <div class="stat-card">
                <h3>${category}</h3>
                <p>${count}</p>
            </div>
        `;
    } else {
        othersTotal += count;
    }
    });

    if (othersTotal > 0) {
    breakdownHTML += `
        <div class="stat-card">
            <h3>Others</h3>
            <p>${othersTotal}</p>
        </div>
    `;
    }

    document.getElementById("categoryBreakdown").innerHTML = breakdownHTML;


    // ========== Recent Locations =========
    const recent = locations.slice(-5).reverse();

    let recentHTML = ``;

    recent.forEach(loc => {
        recentHTML += `
            <div class="recent-item">
                ${loc.name} — ${loc.category_name}
                
            </div>
        `;
    });

    document.getElementById("recentLocations").innerHTML += recentHTML;

        // ========== Superadmin Section ==========
        if (role === "superadmin") {

            const usersRes = await fetch(`${API}/users`, {
                headers: {
                    "role": "superadmin"
                }
            });

            const users = await usersRes.json();

            const active = users.filter(u => u.is_active).length;
            const inactive = users.filter(u => !u.is_active).length;

            document.getElementById("superAdminPanel").style.display = "block";

            document.getElementById("superAdminStats").innerHTML = `
                <div class="stat-card">
                    <h3>Total Users</h3>
                    <p>${users.length}</p>
                </div>
                <div class="stat-card">
                    <h3>Active Users</h3>
                    <p>${active}</p>
                </div>
                <div class="stat-card">
                    <h3>Inactive Users</h3>
                    <p>${inactive}</p>
                </div>
            `;
        }
    }

function goToDashboard() {
    window.location.href = "../dashboard.html";
}

function goToUserManagement() {
    window.location.href = "../manage-users/manage-users.html";
}

loadHome();