// ===== Element References =====
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const recipeForm = document.getElementById("recipe-form");

const loginSection = document.getElementById("login-section");
const registerSection = document.getElementById("register-section");
const recipeSection = document.getElementById("recipe-section");
const recipeList = document.getElementById("recipe-list");
const logoutBtn = document.getElementById("logout-btn");
const msg = document.getElementById("msg");

const showRegisterBtn = document.getElementById("show-register-btn");
const showLoginBtn = document.getElementById("show-login-btn");

let token = "";

// ===== Backend API URL =====
const API_URL = "https://recipe-tracker-umwu.onrender.com/api";

// ===== Show/Hide Login & Register =====
showRegisterBtn.onclick = () => {
  loginSection.style.display = "none";
  registerSection.style.display = "block";
  msg.textContent = "";
};

showLoginBtn.onclick = () => {
  registerSection.style.display = "none";
  loginSection.style.display = "block";
  msg.textContent = "";
};

// ===== Check for Token on Page Load =====
window.addEventListener("DOMContentLoaded", () => {
  const savedToken = localStorage.getItem("token");
  if (savedToken) {
    token = savedToken;
    loginSection.style.display = "none";
    registerSection.style.display = "none";
    recipeSection.style.display = "block";
    fetchRecipes();
  }
});

// ===== Register =====
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("reg-username").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value.trim();

  // ----- Simple Form Validation -----
  if (!username || !email || !password) {
    msg.textContent = "⚠️ Please fill in all fields.";
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    msg.textContent = "⚠️ Please enter a valid email address.";
    return;
  }

  if (password.length < 6) {
    msg.textContent = "⚠️ Password must be at least 6 characters long.";
    return;
  }

  // ----- Send Registration -----
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();

    if (res.ok) {
      msg.textContent = "✅ Registration successful! Please login.";
      registerForm.reset();
      registerSection.style.display = "none";
      loginSection.style.display = "block";
    } else {
      msg.textContent = data.error || "Registration failed.";
    }
  } catch (err) {
    console.error(err);
    msg.textContent = "Registration failed.";
  }
});

// ===== Login =====
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  // ----- Simple Form Validation -----
  if (!email || !password) {
    msg.textContent = "⚠️ Email and password are required.";
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    msg.textContent = "⚠️ Please enter a valid email address.";
    return;
  }

  // ----- Send Login -----
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (res.ok) {
      token = data.token;
      localStorage.setItem("token", token);

      msg.textContent = "";
      loginForm.reset();
      loginSection.style.display = "none";
      recipeSection.style.display = "block";
      fetchRecipes();
    } else {
      msg.textContent = data.error || "Login failed.";
    }
  } catch (err) {
    console.error(err);
    msg.textContent =
      "Login failed. Make sure your backend is running and CORS is configured.";
  }
});

// ===== Fetch Recipes =====
async function fetchRecipes() {
  try {
    const res = await fetch(`${API_URL}/recipes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch recipes");

    const recipes = await res.json();
    recipeList.innerHTML = "";

    recipes.forEach((recipe) => {
      const li = document.createElement("li");
      li.textContent = `${recipe.name} - ${recipe.source}`;

      // Edit button
      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.onclick = () =>
        editRecipe(recipe._id, recipe.name, recipe.source);
      editBtn.style.marginLeft = "10px";

      // Delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.onclick = () => deleteRecipe(recipe._id);
      deleteBtn.style.marginLeft = "5px";

      li.appendChild(editBtn);
      li.appendChild(deleteBtn);
      recipeList.appendChild(li);
    });
  } catch (err) {
    console.error(err);
    msg.textContent = "Failed to load recipes.";
  }
}

// ===== Add Recipe =====
recipeForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("recipe-name").value.trim();
  const source = document.getElementById("recipe-source").value.trim();

  // ----- Simple Validation -----
  if (!name || !source) {
    msg.textContent = "⚠️ Please enter both a recipe name and source.";
    return;
  }

  try {
    const res = await fetch(`${API_URL}/recipes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, source }),
    });

    if (res.ok) {
      recipeForm.reset();
      fetchRecipes();
    } else {
      msg.textContent = "Failed to add recipe.";
    }
  } catch (err) {
    console.error(err);
    msg.textContent = "Failed to add recipe.";
  }
});

// ===== Edit Recipe =====
async function editRecipe(id, currentName, currentSource) {
  const newName = prompt("Edit recipe name:", currentName);
  const newSource = prompt("Edit recipe source:", currentSource);

  if (newName && newSource) {
    try {
      const res = await fetch(`${API_URL}/recipes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName, source: newSource }),
      });
      if (res.ok) fetchRecipes();
    } catch (err) {
      console.error(err);
      msg.textContent = "Failed to edit recipe.";
    }
  }
}

// ===== Delete Recipe =====
async function deleteRecipe(id) {
  if (!confirm("Are you sure you want to delete this recipe?")) return;

  try {
    const res = await fetch(`${API_URL}/recipes/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) fetchRecipes();
  } catch (err) {
    console.error(err);
    msg.textContent = "Failed to delete recipe.";
  }
}

// ===== Logout =====
logoutBtn.addEventListener("click", () => {
  token = "";
  localStorage.removeItem("token");
  recipeSection.style.display = "none";
  loginSection.style.display = "block";
  msg.textContent = "";
});

// ===== Footer Dynamic Year =====
const yearSpan = document.getElementById("year");
if (yearSpan) yearSpan.textContent = new Date().getFullYear();
