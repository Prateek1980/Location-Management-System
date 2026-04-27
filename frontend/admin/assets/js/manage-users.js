const API = "http://127.0.0.1:8000";

let usersData = [];
let deleteUserId = null;

const role = localStorage.getItem("role");
const email = localStorage.getItem("email");

// Redirect non-superadmin users to login page
if (role !== "superadmin") {
    window.location.href = "../login/login.html";
}

// Navigation from manage users page to home page
function goHome() {
    window.location.href = "../home/home.html";
}

// Load users from API
async function loadUsers() {
    try {
        const res = await fetch(`${API}/users`, {
            headers: {
                "role": "superadmin"
            }
        });

        const users = await res.json();

        usersData = users;
        renderUserTable(usersData);

    } catch (error) {
        console.error("Error loading users:", error);

        document.getElementById("userTable").innerHTML = `
            <div class="no-results">Failed to load users.</div>
        `;
    }
}

// Render user table
function renderUserTable(users) {

    // Empty state
    if (!users.length) {
        document.getElementById("userTable").innerHTML = `
            <div class="no-results">No users found.</div>
        `;
        return;
    }

    let tableHTML = `
        <div class="table-container">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;

    users.forEach(user => {

        const roleBtnText = user.role === "user" ? "Promote" : "Demote";
        const statusBtnText = user.is_active ? "Deactivate" : "Activate";
        const disableSelf = user.email === email ? "disabled" : "";

        const roleBtnClass = "action-btn";
        const statusBtnClass = user.is_active ? "action-btn delete" : "action-btn activate";
        const deleteBtnClass = "action-btn delete";

        tableHTML += `
            <tr>
                <td>${user.name}</td>
                <td>${user.phone}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>${user.is_active ? "Active" : "Inactive"}</td>
                <td>
                    <div class="action-buttons">
                        <button class="${roleBtnClass}" onclick="changeRole(${user.id}, '${user.role}')" ${disableSelf}>
                            ${roleBtnText}
                        </button>

                        <button class="${statusBtnClass}" onclick="toggleStatus(${user.id})" ${disableSelf}>
                            ${statusBtnText}
                        </button>

                        <button class="${deleteBtnClass}" onclick="openDeleteModal(${user.id})" ${disableSelf}>
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    tableHTML += `
                </tbody>
            </table>
        </div>
    `;

    document.getElementById("userTable").innerHTML = tableHTML;
}

// Change role function
async function changeRole(id, currentRole) {
    try {
        const newRole = currentRole === "user" ? "superadmin" : "user";

        await fetch(`${API}/users/${id}/role?new_role=${newRole}`, {
            method: "PUT",
            headers: {
                "role": "superadmin",
                "current-user-email": email
            }
        });

        loadUsers();

    } catch (error) {
        console.error("Error changing role:", error);
    }
}

// Toggle active/deactive status
async function toggleStatus(id) {
    try {
        await fetch(`${API}/users/${id}/status`, {
            method: "PUT",
            headers: {
                "current-user-email": email,
                "role": "superadmin"
            }
        });

        loadUsers();

    } catch (error) {
        console.error("Error toggling user status:", error);
    }
}

// Delete user functions
function openDeleteModal(id) {
    deleteUserId = id;

    document.getElementById("deleteMessage").innerText =
        "Are you sure you want to delete this user?";

    document.getElementById("deleteModal").style.display = "flex";
}

function closeDeleteModal() {
    deleteUserId = null;
    document.getElementById("deleteModal").style.display = "none";
}

async function confirmDelete() {
    if (!deleteUserId) return;

    try {
        await fetch(`${API}/users/${deleteUserId}`, {
            method: "DELETE",
            headers: {
                "current-user-email": email,
                "role": "superadmin"
            }
        });

        closeDeleteModal();
        loadUsers();

    } catch (error) {
        console.error("Error deleting user:", error);
    }
}

// Search function
function filterUsers() {
    const keyword = document.getElementById("userSearch").value.toLowerCase().trim();

    const filtered = usersData.filter(user =>
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.role.toLowerCase().includes(keyword) ||
        user.phone.toLowerCase().includes(keyword)
    );

    renderUserTable(filtered);
}

loadUsers();
