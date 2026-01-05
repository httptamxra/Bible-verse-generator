console.log("JS LOADED");

/* ELEMENTS */
const btn = document.getElementById("btn");
const verseTextEl = document.getElementById("verse-text");
const verseRefEl = document.getElementById("verse-ref");

const usernameInput = document.getElementById("username");
const loginBtn = document.getElementById("loginBtn");
const userInfo = document.getElementById("userInfo");
const saveBtn = document.getElementById("saveBtn");
const favoritesList = document.getElementById("favoritesList");

/* USER / LOGIN */
let currentUser = localStorage.getItem("currentUser");

if (currentUser) {
  userInfo.textContent = `Logged in as ${currentUser}`;
  loadFavorites();
}

loginBtn.addEventListener("click", () => {
  const name = usernameInput.value.trim();
  if (!name) return;

  currentUser = name;
  localStorage.setItem("currentUser", name);
  userInfo.textContent = `Logged in as ${name}`;
  loadFavorites();
});

/* FETCH VERSE */
btn.addEventListener("click", async () => {
  verseTextEl.textContent = "Loading...";
  verseRefEl.textContent = "";

  try {
    const res = await fetch("https://bible-api.com/data/web/random");
    if (!res.ok) throw new Error("Request failed: " + res.status);

    const data = await res.json();

    let text = "";
    let ref = "";

    if (data.text && data.reference) {
      text = data.text;
      ref = data.reference;
    } else if (data.random_verse) {
      text = data.random_verse.text;
      ref = `${data.random_verse.book} ${data.random_verse.chapter}:${data.random_verse.verse}`;
    } else if (data.verses && data.verses.length > 0) {
      text = data.verses[0].text;
      ref = data.reference;
    }

    if (!text) throw new Error("Verse text not found");

    verseTextEl.textContent = text;
    verseRefEl.textContent = ref;
  } catch (e) {
    verseTextEl.textContent = "Failed to load verse";
    console.error(e);
  }
});

/* SAVE FAVORITES */
saveBtn.addEventListener("click", () => {
  if (!currentUser) {
    alert("Please log in first");
    return;
  }

  const text = verseTextEl.textContent.trim();
  const reference = verseRefEl.textContent.trim();

  if (!text || text === "Loading..." || text.startsWith("Failed")) return;

  const key = `favorites_${currentUser}`;
  const favorites = JSON.parse(localStorage.getItem(key)) || [];

  // prevent duplicates by reference + text
  const exists = favorites.some(f => f.reference === reference && f.text === text);
  if (!exists) {
    favorites.push({ text, reference });
    localStorage.setItem(key, JSON.stringify(favorites));
  }

  loadFavorites();
});

/* LOAD FAVORITES */
function loadFavorites() {
  favoritesList.innerHTML = "";
  if (!currentUser) return;

  const key = `favorites_${currentUser}`;
  const favorites = JSON.parse(localStorage.getItem(key)) || [];

  favorites.forEach((fav, index) => {
    const li = document.createElement("li");
    li.textContent = `${fav.reference} — ${fav.text}`;
    favoritesList.appendChild(li);
  });
}
