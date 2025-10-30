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

// api url to backend
const API_URL = "https://recipe-tracker-umwu.onrender.com/api";

// ===== SHOW/HIDE LOGIN & REGISTER =====
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

// ===== CHECK FOR TOKEN ON LOAD =====
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

// ===== REGISTER =====
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("reg-username").value;
  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-password").value;

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
      msg.textContent = data.error || "Registration failed";
    }
  } catch (err) {
    console.error(err);
    msg.textContent = "Registration failed";
  }
});

// ===== LOGIN =====
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

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
      msg.textContent = data.error || "Login failed";
    }
  } catch (err) {
    console.error(err);
    msg.textContent =
      "Login failed. Make sure your backend is running and CORS is configured.";
  }
});

// ===== FETCH RECIPES =====
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
    msg.textContent = "Failed to load recipes";
  }
}

// ===== ADD RECIPE =====
recipeForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("recipe-name").value;
  const source = document.getElementById("recipe-source").value;

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
      msg.textContent = "Failed to add recipe";
    }
  } catch (err) {
    console.error(err);
    msg.textContent = "Failed to add recipe";
  }
});

// ===== EDIT RECIPE =====
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
      msg.textContent = "Failed to edit recipe";
    }
  }
}

// ===== DELETE RECIPE =====
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
    msg.textContent = "Failed to delete recipe";
  }
}

// ===== LOGOUT =====
logoutBtn.addEventListener("click", () => {
  token = "";
  localStorage.removeItem("token");
  recipeSection.style.display = "none";
  loginSection.style.display = "block";
  msg.textContent = "";
});


// ===== Footer Dynamic Year =====
const yearSpan = document.getElementById("year");
const currentYear = new Date().getFullYear();
yearSpan.textContent = currentYear;

