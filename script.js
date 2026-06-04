// ================= FIREBASE STABLE IMPORTS (VERSION 10.12.0) =================
// Core Firebase App
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

// Firebase Authentication (Saare zaroori functions ek hi file se)
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Firebase Firestore (Database jo hum aage use karenge)
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  setDoc 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ================= CONFIGURATION =================
const firebaseConfig = {
  apiKey: "AIzaSyAmUDulMn4IIQyUlpzUWhv6iJ_Bw8jCO14",
  authDomain: "moneymanagement12.firebaseapp.com",
  projectId: "moneymanagement12",
  storageBucket: "moneymanagement12.firebasestorage.app",
  messagingSenderId: "517659973889",
  appId: "1:517659973889:web:a7a8bca095e3e90de86300",
  measurementId: "G-QRE1MTJ4JY"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app); 
const db = getFirestore(app);


// ================= CLOUDINARY CONFIGURATION =================
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/ddzh3hqk3/image/upload";
const CLOUDINARY_PRESET = "satyam_cloudImg"; 

// Image upload karne wala Helper Function
async function uploadToCloudinary(file) {
  if (!file) return null;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_PRESET);

  try {
    const response = await fetch(CLOUDINARY_URL, {
      method: "POST",
      body: formData
    });
    if (!response.ok) throw new Error("Cloudinary upload failed");
    
    const data = await response.json();
    return data.secure_url; 
  } catch (error) {
    console.error("Cloudinary Error:", error);
    return null;
  }
}


let currentUser = null;
let unsubscribeTransactions = null;
let isRegistering = false;
let unsubscribeUserData = null;

// ================= STORAGE KEYS =================
const T_KEY = "transactions_v2";
const B_KEY = "budget_v2";
const F_KEY = "friends_v2";
const TE_KEY = "trip_expenses_v2";
const THEME_KEY = "theme_v2";
const LOGIN_KEY = "finance_login_v2";
const CARRY_KEY = "carry_forward_v2";
const CYCLE_KEY = "budget_cycle_v1";
const CURRENCY_KEY = "currency_v1";
const LANGUAGE_KEY = "language_v1";
const COLOR_THEME_KEY = "color_theme_v1";
const TRASH_KEY = "trash_v1";

// ================= ELEMENTS =================
const loginScreen = document.getElementById("loginScreen");
const appWrapper = document.getElementById("appWrapper");
const loginForm = document.getElementById("loginForm");
const loginName = document.getElementById("loginName");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const logoutBtn = document.getElementById("logoutBtn");
const welcomeText = document.getElementById("welcomeText");
// ================= new =========================
const loginTitle = document.getElementById("loginTitle");
const loginDesc = document.getElementById("loginDesc");
const nameField = document.getElementById("nameField");
const loginSubmitBtn = document.getElementById("loginSubmitBtn");
const toggleText = document.getElementById("toggleText");
const toggleAuthMode = document.getElementById("toggleAuthMode");
//----------------------------------------------------------
const sidebar = document.getElementById("sidebar");
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const themeToggle = document.getElementById("themeToggle");
const toastBox = document.getElementById("toastBox");

const form = document.getElementById("transactionForm");
const type = document.getElementById("type");
const amount = document.getElementById("amount");
const category = document.getElementById("category");
const date = document.getElementById("date");
const note = document.getElementById("note");
const transactionPhoto = document.getElementById("transactionPhoto");
const photoPreview = document.getElementById("photoPreview");
const budgetInput = document.getElementById("budgetInput");
const submitBtn = document.getElementById("submitBtn");
const formTitle = document.getElementById("formTitle");
const cancelEditBtn = document.getElementById("cancelEditBtn");

const totalBalance = document.getElementById("totalBalance");
const totalIncome = document.getElementById("totalIncome");
const totalExpense = document.getElementById("totalExpense");
const totalSavings = document.getElementById("totalSavings");

const budgetValue = document.getElementById("budgetValue");
const budgetSpent = document.getElementById("budgetSpent");
const budgetRemaining = document.getElementById("budgetRemaining");
const carryForward = document.getElementById("carryForward");
const budgetBar = document.getElementById("budgetBar");
const budgetWarning = document.getElementById("budgetWarning");

const transactionList = document.getElementById("transactionList");
const searchInput = document.getElementById("searchInput");
const filterType = document.getElementById("filterType");

const pieCanvas = document.getElementById("pieChart");
const barCanvas = document.getElementById("barChart");

const friendForm = document.getElementById("friendForm");
const friendName = document.getElementById("friendName");
const friendContribution = document.getElementById("friendContribution");
const friendList = document.getElementById("friendList");

const tripForm = document.getElementById("tripExpenseForm");
const spentBy = document.getElementById("spentBy");
const tripAmount = document.getElementById("tripAmount");
const tripPlace = document.getElementById("tripPlace");
const tripDate = document.getElementById("tripDate");
const tripDesc = document.getElementById("tripDesc");
const tripExpenseList = document.getElementById("tripExpenseList");

const tripCollected = document.getElementById("tripCollected");
const tripSpent = document.getElementById("tripSpent");
const tripRemaining = document.getElementById("tripRemaining");
const equalRemaining = document.getElementById("equalRemaining");
const friendSummaryCards = document.getElementById("friendSummaryCards");

const aiAnalysis = document.getElementById("aiAnalysis");
const budgetSuggestions = document.getElementById("budgetSuggestions");

const currencySelector = document.getElementById("currencySelector");
const languageSelector = document.getElementById("languageSelector");
const themeSelector = document.getElementById("themeSelector");
const appLoader = document.querySelector(".app-loader-wrapper");
let isLoginMode = true


// ================= FORGOT PASSWORD SYSTEM =================
const forgotPasswordLink = document.getElementById("forgotPasswordLink");


forgotPasswordLink.addEventListener("click", async (e) => {
  e.preventDefault();

  const email = loginEmail.value.trim();

  
  if (!email) {
    showToast("Please enter your registered email address first!", "error");
    loginEmail.focus();
    return;
  }

  try {
    
    await sendPasswordResetEmail(auth, email);
    showToast(`Password reset link sent to ${email}! Check your inbox/spam.`, "success");
  } catch (error) {
    console.error("Forgot Password Error:", error);
    
    // 3. Error Handling
    if (error.code === "auth/user-not-found") {
      showToast("This email is not registered with us!", "error");
    } else if (error.code === "auth/invalid-email") {
      showToast("Please enter a valid email address!", "error");
    } else {
      showToast("Something went wrong. Please try again later.", "error");
    }
  }
});




// ================= DATA =================
let transactions = []; // 🔥 Local storage hataya, ab direct cloud se aayega
let budget = 0;
let wallet = 0;

let friends = [];
let tripExpenses = [];
let carryAmount = 0;
let cycle = { start: null, end: null };
let editId = null;
let trash = [];

// ================= LOGIN / SIGNUP TOGGLE LOGIC =================
toggleAuthMode.addEventListener("click", (e) => {
  e.preventDefault();
  isLoginMode = !isLoginMode; 

  if (isLoginMode) {
    
    loginTitle.textContent = "Expense X";
    loginDesc.textContent = "Login to manage your finance and friends trip planner";
    nameField.style.display = "none"; 
    loginName.required = false; 
    loginName.value = ""; 
    
    loginSubmitBtn.textContent = "Login";
    toggleText.textContent = "Don't have an account?";
    toggleAuthMode.textContent = "Register here";
  } else {
    
    loginTitle.textContent = "Create Account";
    loginDesc.textContent = "Join Expense X today to track your cashflow seamlessly";
    nameField.style.display = "block"; 
    
    loginName.required = true;
    
    loginSubmitBtn.textContent = "Register";
    toggleText.textContent = "Already have an account?";
    toggleAuthMode.textContent = "Login here";
  }
});



// ====== login aur data fetch wala kaam yaha hoga ================
onAuthStateChanged(auth, (user) => {
  if (isRegistering) return; 

  loginSubmitBtn.disabled = false;
  loginSubmitBtn.textContent = isLoginMode ? "Login" : "Register";

  if (user) {
    currentUser = user;
    loginScreen.classList.add("hidden");
    appWrapper.classList.remove("hidden");
    
    welcomeText.textContent = user.displayName ? `Welcome, ${user.displayName}` : `Welcome, ${user.email.split('@')[0]}`;
    
    // 🛑 Purane chal rahe listener ko close karo safety ke liye
    if (unsubscribeUserData) unsubscribeUserData();
    
  
    const userDocRef = doc(db, "users", currentUser.uid);
    
    unsubscribeUserData = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const cloudData = docSnap.data();
        
        
        transactions = cloudData.transactions || [];
        budget = Number(cloudData.budget) || 0;
        wallet = Number(cloudData.wallet) || 0;
        friends = cloudData.friends || [];
        tripExpenses = cloudData.tripExpenses || [];
        carryAmount = Number(cloudData.carryAmount) || 0;
        cycle = cloudData.cycle || { start: null, end: null };
        trash = cloudData.trash || [];
        
       console.log(cloudData)
        if (typeof budgetInput !== 'undefined') budgetInput.value = budget || "";
      } else {
        
        transactions = []; budget = 0; wallet = 0; friends = []; tripExpenses = []; trash = [];
        cycle = { start: null, end: null };
      }
      
      
      renderAll();
      if (appLoader) appLoader.classList.add("hidden");
    });

  } else {
    
    currentUser = null;
    
    if (unsubscribeUserData) {
      unsubscribeUserData();
      unsubscribeUserData = null;
    }

    transactions = [];
    budget = 0;
    wallet = 0;
    friends = [];
    tripExpenses = [];
    carryAmount = 0;
    trash = [];
    cycle = { start: null, end: null };

    
    renderAll();

    loginScreen.classList.remove("hidden");
    appWrapper.classList.add("hidden");
    if (appLoader) appLoader.classList.add("hidden");
  }
});

// ================= FIREBASE LOGIN & REGISTER SUBMIT =================
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();
  
  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();
  const name = loginName.value.trim();

  loginSubmitBtn.disabled = true;
  const originalBtnText = loginSubmitBtn.textContent;

  if (isLoginMode) {
   
    isRegistering = false;
    loginSubmitBtn.textContent = "Logging in... ⏳";
    
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        showToast("Login successful", "success");
      })
      .catch((error) => {
        console.error(error);
        showToast("Invalid email or password!", "error");
        loginSubmitBtn.disabled = false;
        loginSubmitBtn.textContent = originalBtnText;
      });

  } else {
    
    isRegistering = true;
    loginSubmitBtn.textContent = "Registering... ⏳";
    
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        
        
        return updateProfile(user, { displayName: name })
          .then(() => {
            showToast("Account created successfully!", "success");
            
            
            isRegistering = false; 
            currentUser = auth.currentUser; 
            
            
            loginScreen.classList.add("hidden");
            appWrapper.classList.remove("hidden");
            welcomeText.textContent = `Welcome, ${name}`;
            
            loginSubmitBtn.disabled = false;
            loginSubmitBtn.textContent = originalBtnText;
          loginForm.reset();
            renderAll();
          });
      })
      .catch((error) => {
        console.error(error);
        isRegistering = false; 
        if (error.code === "auth/email-already-in-use") {
          showToast("This email is already registered!", "error");
        } else {
          showToast(error.message, "error");
        }
        loginSubmitBtn.disabled = false;
        loginSubmitBtn.textContent = originalBtnText;
      });
  }
});
// ===========LOG OUT===============
logoutBtn.addEventListener("click", () => {
  
  

  signOut(auth)
    .then(() => {
      showToast("Logged out successfully", "success");
      if (loginEmail) loginEmail.value = "";
      if (loginPassword) loginPassword.value = "";
      if (loginName) loginName.value = "";
      
      currentUser = null;
      
      
      if (unsubscribeTransactions) {
        unsubscribeTransactions();
        unsubscribeTransactions = null;
      }

      //  Hume manually classes hidden/remove karne ki zarurat nahi hai, 
      // kyunki onAuthStateChanged automatic detect karke login screen par bhej dega!
    })
    .catch((error) => {
      console.error("Logout Error:", error);
      showToast("Logout failed: " + error.message, "error");
    });
});




// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {

  // 🎨 LOAD THEME & PREFERENCES (Yeh browser level par rehne de sakte hain taaki login screen se pehle loading sahi dikhe)
  const savedTheme = localStorage.getItem(COLOR_THEME_KEY);
  if (savedTheme && savedTheme !== "default") {
    document.body.classList.add(savedTheme);
    themeSelector.value = savedTheme;
  }

  const savedCurrency = localStorage.getItem(CURRENCY_KEY);
  if (savedCurrency) currencySelector.value = savedCurrency;

  const savedLang = localStorage.getItem(LANGUAGE_KEY) || "en";
  languageSelector.value = savedLang;

  if (cycle.end) {
    const today = new Date().toISOString().split("T")[0];

    if (today > cycle.end) {
      setTimeout(() => {
        let newBudget = prompt("Cycle ended! Enter new budget:");
        let start = prompt("Enter new cycle START date (YYYY-MM-DD):");
        let end = prompt("Enter new cycle END date (YYYY-MM-DD):");

        if (newBudget && start && end) {
          const cycleExpense = calculateCycleExpense();
          const remaining = budget - cycleExpense;

          carryAmount = remaining > 0 ? remaining : 0;
          budget = Number(newBudget) + carryAmount;
          cycle = { start, end };

          saveAll(); // Direct Cloud Sync
          renderAll();
          showToast("New cycle started with carry forward", "success");
        }
      }, 800);
    }
  }


  let currentMonth = new Date().getMonth();
  
  if (currentUser) {
    // Note: Agar aap chahein to month tracking ko Firestore me saveMasterData me rakh sakte hain
    let savedMonth = localStorage.getItem("current_month"); 

    if (savedMonth === null) {
      localStorage.setItem("current_month", currentMonth);
    } else if (Number(savedMonth) !== currentMonth) {
      setTimeout(() => {
        let newBudget = prompt("New month started! Enter your new monthly budget:");

        if (newBudget && !isNaN(newBudget)) {
          budget = Number(newBudget);
          localStorage.setItem("current_month", currentMonth);
          saveAll(); // Cloud Par Save
          renderAll();
          showToast("New month budget updated", "success");
        }
      }, 1000);
    }
  }

  const today = new Date().toISOString().split("T")[0];
  date.value = today;
  tripDate.value = today;
  loadTheme();

  cleanOldTrash();
  renderAll();

  document.getElementById("tripFilterFriend").addEventListener("change", renderTripExpenseTable);
  const trashFilterEl = document.getElementById("trashFilter");
  if (trashFilterEl) trashFilterEl.addEventListener("change", renderTrash);
});
transactionPhoto?.addEventListener("change", (e) => {
  const file = e.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (event) {
    photoPreview.src = event.target.result;
    photoPreview.style.display = "block";
  };

  reader.readAsDataURL(file);
});






function showApp(user) {
  loginScreen.classList.add("hidden");
  appWrapper.classList.remove("hidden");
  welcomeText.textContent = `Welcome, ${user.name}`;
}

// ================= MOBILE MENU =================
mobileMenuBtn.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});

// ================= TOAST =================
function showToast(msg, type = "success") {
  let div = document.createElement("div");
  div.className = `toast ${type}`;
  div.innerText = msg;
  toastBox.appendChild(div);
  setTimeout(() => div.remove(), 2500);
}

// ================= THEME =================
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");
  const mode = document.body.classList.contains("light") ? "light" : "dark";
  localStorage.setItem(THEME_KEY, mode);
  themeToggle.textContent = mode === "light" ? "🌙 Dark Mode" : "☀️ Light Mode";
  drawChartsAnimated();
});

function loadTheme() {
  const mode = localStorage.getItem(THEME_KEY) || "dark";
  if (mode === "light") {
    document.body.classList.add("light");
    themeToggle.textContent = "🌙 Dark Mode";
  } else {
    document.body.classList.remove("light");
    themeToggle.textContent = "☀️ Light Mode";
  }
}

// ================= HELPERS =================

// ================= UPGRADED CLOUD SAVEALL FUNCTION =================
async function saveAll() {
  if (!currentUser) return;

  // Saare local variables ka ek master object banao
  const userMasterData = {
    transactions: transactions,
    budget: Number(budget),
    wallet: Number(wallet),
    friends: friends,
    tripExpenses: tripExpenses,
    carryAmount: Number(carryAmount),
    cycle: cycle,
    trash: trash,
    updatedAt: new Date().toISOString()
  };

  try {
   
    const userDocRef = doc(db, "users", currentUser.uid);
    await setDoc(userDocRef, userMasterData, { merge: true });
    console.log("All data successfully synced to Cloud Firestore!");
  } catch (error) {
    console.error("Error syncing data to Cloud:", error);
    showToast("Cloud sync failed!", "error");
  }
}

function formatCurrency(num) {
  const symbol = localStorage.getItem(CURRENCY_KEY) || "₹";
  return `${symbol}${Number(num).toLocaleString()}`;
}

currencySelector.addEventListener("change", () => {
  localStorage.setItem(CURRENCY_KEY, currencySelector.value);
  renderAll();
});

const translations = {
  en: {
    welcome: "Welcome"
  },
  hi: {
    welcome: "स्वागत है"
  },
  es: {
    welcome: "Bienvenido"
  }
};

languageSelector.addEventListener("change", () => {
  const lang = languageSelector.value;
  localStorage.setItem(LANGUAGE_KEY, lang);

  // 🔥 FIX: LocalStorage hata kar Firebase display name use kiya
  const nameToShow = currentUser?.displayName || currentUser?.email.split('@')[0] || "User";
  welcomeText.textContent = `${translations[lang].welcome}, ${nameToShow}`;
});

function getTextColor() {
  return getComputedStyle(document.body).getPropertyValue("--text").trim();
}

function getMutedColor() {
  return getComputedStyle(document.body).getPropertyValue("--muted").trim();
}

function getCycleTransactions() {

  if (!cycle.start || !cycle.end) return transactions;

  return transactions.filter(t => {
    return t.date >= cycle.start && t.date <= cycle.end;
  });
}

function calculateCycleExpense() {
  return getCycleTransactions()
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0); 
}

function calculateTotals() {
  let income = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0); 

  let expense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0); 


  const currentBudget = Number(budget) || 0;

  let balance = currentBudget; 
  let savings = currentBudget + income - expense; 

  return { income, expense, balance, savings };
}

// ================= TRANSACTION FORM SUBMIT (WITH IMAGE) =================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!currentUser) {
    showToast("You must be logged in!", "error");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Uploading Bill... ⏳";

  const file = transactionPhoto?.files[0]; 
  const billImageUrl = await uploadToCloudinary(file);

  // 🔥 ID ko strict rakhenge (Agar editId hai to use hi barkarar rakhenge)
  const currentId = editId ? editId : Date.now().toString();

  const transactionData = {
    id: currentId, 
    type: type.value, 
    amount: Number(amount.value),
    category: category.value,
    date: date.value,
    note: note.value.trim(),
    billUrl: billImageUrl || "", 
    createdAt: new Date().toISOString()
  };

  if (!editId && budgetInput && budgetInput.value.trim() !== "") {
    const enteredBudget = Number(budgetInput.value);
    if (!isNaN(enteredBudget) && enteredBudget >= 0) {
      budget = enteredBudget;
      wallet = budget; 
    }
  }

  try {
    if (editId) {
     
      const index = transactions.findIndex(t => t.id == editId);
      
      if (index !== -1) {
      
        if (!billImageUrl && transactions[index].billUrl) {
          transactionData.billUrl = transactions[index].billUrl;
        }
        
        
        transactions[index] = transactionData;
        showToast("Transaction updated successfully", "success");
      } else {
        console.error("Transaction index not found for ID:", editId);
      }
    } else {
      transactions.unshift(transactionData);
      showToast("Transaction added with Bill", "success");
    }

    
    await saveAll(); 
    
    
    if (typeof renderAll === "function") {
      renderAll(); 
    } else {
      
      renderTransactionTable();
      renderSummary();
    }

    resetForm();
    
    if (photoPreview) {
      photoPreview.src = "";
      photoPreview.style.display = "none";
    }

  } catch (error) {
    console.error("Error saving transaction: ", error);
    showToast("Failed to sync transaction", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = editId ? "Update Transaction" : "Add Transaction";
  }
});

cancelEditBtn.addEventListener("click", () => {
  resetForm();
});

function resetForm() {
  editId = null;
  form.reset();
  date.value = new Date().toISOString().split("T")[0];
  budgetInput.value = budget || "";
  submitBtn.textContent = "Add Transaction";
  formTitle.textContent = "Add Transaction";
  cancelEditBtn.classList.add("hidden");
}

function editTransaction(id) {
  const t = transactions.find(item => item.id == id);
  if (!t) return;

  editId = id;
  type.value = t.type;
  amount.value = t.amount;
  category.value = t.category;
  date.value = t.date;
  note.value = t.note || "";
  budgetInput.value = budget || "";

  if (t.billUrl && photoPreview) {
    photoPreview.src = t.billUrl; 
    photoPreview.style.display = "block"; 
  } else if (photoPreview) {
    photoPreview.src = "";
    photoPreview.style.display = "none";
  }

  submitBtn.textContent = "Update Transaction";
  formTitle.textContent = "Edit Transaction";
  cancelEditBtn.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}



function deleteTransaction(id) {

  const transaction = transactions.find(t => t.id == id);

  if (transaction) {
    if (transaction.type === "income") {
      wallet -= Number(transaction.amount);
    } else {
      wallet += Number(transaction.amount);
    }
    trash.push({
      type: "transaction",
      data: transaction,
      deletedAt: new Date().toISOString()
    });
  }

 
  transactions = transactions.filter(t => t.id != id);
  
  saveAll();  
  saveTrash();
  renderAll(); 
  showToast("Moved to Trash", "info");
}


window.deleteTransaction = deleteTransaction;

// ================= SUMMARY =================
function renderSummary() {
  const { income, expense, balance, savings } = calculateTotals();
  const cycleExpense = calculateCycleExpense();
  const remaining = budget - cycleExpense;

  totalIncome.textContent = formatCurrency(income);
  totalExpense.textContent = formatCurrency(expense);
  totalBalance.textContent = formatCurrency(balance); // Shows monthly budget

  // ✅ FIXED: Show actual savings calculation
  totalSavings.textContent = formatCurrency(savings);

  budgetValue.textContent = formatCurrency(budget);
  if (cycle.start && cycle.end) {
    budgetValue.textContent += ` (${cycle.start} → ${cycle.end})`;
  }
  budgetSpent.textContent = formatCurrency(cycleExpense);
  budgetRemaining.textContent = formatCurrency(remaining);
  carryForward.textContent = formatCurrency(remaining > 0 ? remaining : 0);

  let percentage = budget > 0 ? (cycleExpense / budget) * 100 : 0;
  if (percentage > 100) percentage = 100;
  budgetBar.style.width = `${percentage}%`;

  if (cycleExpense > budget) {
    budgetWarning.textContent = "⚠ Budget exceeded before next salary.";
  } else if (budget > 0 && remaining < budget * 0.2) {
    budgetWarning.textContent = "⚠ Low budget remaining. Spend carefully.";
  } else {
    budgetWarning.textContent = "Budget is under control.";
  }
}

// ================= TABLE =================
searchInput.addEventListener("input", renderTransactionTable);
filterType.addEventListener("change", renderTransactionTable);

function renderTransactionTable() {
  const search = searchInput.value.toLowerCase().trim();
  const filter = filterType.value;

  const filtered = transactions.filter(t => {
    const matchedType = filter === "all" || t.type === filter;
    const matchedSearch =
      t.category.toLowerCase().includes(search) ||
      (t.note || "").toLowerCase().includes(search);
    return matchedType && matchedSearch;
  });

  transactionList.innerHTML = "";

  filtered.forEach(t => {
    transactionList.innerHTML += `
      <tr>
       <tr>
  <td>
    ${
    t.billUrl 
            ? `<a href="${t.billUrl}" target="_blank">
                 <img src="${t.billUrl}" class="transaction-photo" style="cursor: pointer;" title="Click to view full bill">
               </a>`
            : `<img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" class="transaction-photo">`
        
    }
  </td>

  <td>
    <span class="type-badge type-${t.type}">
      ${t.type}
    </span>
  </td>
        <td>${formatCurrency(t.amount)}</td>
        <td>${t.category}</td>
        <td>${t.date}</td>
        <td>${t.note || "-"}</td>
        <td>
          <button class="edit-btn" onclick="editTransaction(${t.id})">Edit</button>
          <button class="delete-btn" onclick="deleteTransaction(${t.id})">Delete</button>
        </td>
      </tr>
    `;
  });

  if (filtered.length === 0) {
    transactionList.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; color:var(--muted);">No transactions found</td>
      </tr>
    `;
  }
}

// ================= CHARTS =================
function drawChartsAnimated() {
  animateBarChart();
  animatePieChart();
}

function animateBarChart() {
  const ctx = barCanvas.getContext("2d");
  const width = barCanvas.width;
  const height = barCanvas.height;
  const { income, expense } = calculateTotals();
  let progress = 0;

  function drawFrame() {
    ctx.clearRect(0, 0, width, height);

    const padding = 55;
    const chartHeight = height - 100;
    const chartWidth = width - 100;
    const maxVal = Math.max(income, expense, 1000);
    const stepCount = 5;
    const axisColor = getMutedColor();
    const textColor = getTextColor();

    // Y-axis grid + labels
    ctx.strokeStyle = "rgba(148,163,184,0.25)";
    ctx.fillStyle = axisColor;
    ctx.font = "12px Arial";

    for (let i = 0; i <= stepCount; i++) {
      const y = padding + (chartHeight / stepCount) * i;
      const value = Math.round(maxVal - (maxVal / stepCount) * i);

      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - 30, y);
      ctx.stroke();

      ctx.fillText("₹" + value.toLocaleString("en-IN"), 6, y + 4);
    }

    // Axes
    ctx.strokeStyle = axisColor;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - 45);
    ctx.lineTo(width - 30, height - 45);
    ctx.stroke();

    const animatedIncome = income * progress;
    const animatedExpense = expense * progress;

    const incomeBarHeight = (animatedIncome / maxVal) * chartHeight;
    const expenseBarHeight = (animatedExpense / maxVal) * chartHeight;

    const barWidth = 90;
    const x1 = 120;
    const x2 = 280;
    const baseY = height - 45;

    // Bars
    ctx.fillStyle = "#22c55e";
    ctx.fillRect(x1, baseY - incomeBarHeight, barWidth, incomeBarHeight);

    ctx.fillStyle = "#ef4444";
    ctx.fillRect(x2, baseY - expenseBarHeight, barWidth, expenseBarHeight);

    // X labels
    ctx.fillStyle = textColor;
    ctx.font = "14px Arial";
    ctx.fillText("Income", x1 + 18, height - 18);
    ctx.fillText("Expense", x2 + 12, height - 18);

    // Total labels
    ctx.fillText(formatCurrency(income), x1 - 5, baseY - incomeBarHeight - 10);
    ctx.fillText(formatCurrency(expense), x2 - 5, baseY - expenseBarHeight - 10);

    // Title note
    ctx.font = "13px Arial";
    ctx.fillStyle = axisColor;
    ctx.fillText("X-axis: Type", width - 120, height - 5);
    ctx.fillText("Y-axis: Amount", 10, 20);

    progress += 0.04;
    if (progress <= 1) {
      requestAnimationFrame(drawFrame);
    }
  }

  drawFrame();
}

function animatePieChart() {
  const ctx = pieCanvas.getContext("2d");
  const width = pieCanvas.width;
  const height = pieCanvas.height;
  const expenses = transactions.filter(t => t.type === "expense");

  const categoryTotals = {};
  expenses.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  const entries = Object.entries(categoryTotals);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);

  ctx.clearRect(0, 0, width, height);

  if (total === 0) {
    ctx.fillStyle = getMutedColor();
    ctx.font = "16px Arial";
    ctx.fillText("No expense data available", 150, 150);
    return;
  }

  const colors = ["#8b5cf6", "#06b6d4", "#22c55e", "#f97316", "#ef4444", "#eab308", "#ec4899"];
  let progress = 0;

  function drawFrame() {
    ctx.clearRect(0, 0, width, height);

    let startAngle = 0;
    const centerX = 160;
    const centerY = 155;
    const radius = 100;

    entries.forEach(([label, value], index) => {
      const sliceAngle = (value / total) * Math.PI * 2 * progress;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();

      startAngle += (value / total) * Math.PI * 2 * progress;
    });

    // Center label
    ctx.fillStyle = getTextColor();
    ctx.font = "bold 16px Arial";
    ctx.fillText("Total", 140, 150);
    ctx.font = "bold 18px Arial";
    ctx.fillText(formatCurrency(total), 110, 175);

    // Legend
    let legendY = 40;
    entries.forEach(([label, value], index) => {
      ctx.fillStyle = colors[index % colors.length];
      ctx.fillRect(320, legendY, 14, 14);

      ctx.fillStyle = getTextColor();
      ctx.font = "13px Arial";
      ctx.fillText(`${label}: ${formatCurrency(value)}`, 342, legendY + 12);

      legendY += 28;
    });

    progress += 0.04;
    if (progress <= 1) {
      requestAnimationFrame(drawFrame);
    }
  }

  drawFrame();
}

// ================= AI ANALYSIS =================
function renderAIAnalysis() {
  aiAnalysis.innerHTML = "";
  budgetSuggestions.innerHTML = "";

  const { income, expense, balance, savings } = calculateTotals();
  const cycleExpense = calculateCycleExpense();

  const expenseCategories = {};
  transactions
    .filter(t => t.type === "expense")
    .forEach(t => {
      expenseCategories[t.category] = (expenseCategories[t.category] || 0) + t.amount;
    });

  const sortedCategories = Object.entries(expenseCategories).sort((a, b) => b[1] - a[1]);
  const topCategory = sortedCategories[0];

  const insights = [];
  const suggestions = [];

  if (topCategory) {
    insights.push(`Highest spending is in <strong>${topCategory[0]}</strong> with ${formatCurrency(topCategory[1])}.`);
  }

  if (income > 0) {
    const savingsRate = ((Math.max(balance, 0) / income) * 100).toFixed(1);
    insights.push(`Your estimated savings rate is <strong>${savingsRate}%</strong> of total income.`);
  }

  if (cycleExpense > budget && budget > 0) {
    insights.push(`You are spending more than your current salary cycle budget.`);
  } else if (budget > 0) {
    insights.push(`You are managing your salary cycle budget well so far.`);
  }

  if (sortedCategories.length >= 2) {
    suggestions.push(`Try reducing <strong>${sortedCategories[0][0]}</strong> and <strong>${sortedCategories[1][0]}</strong> expenses first.`);
  }

  if (income > 0 && expense > income * 0.7) {
    suggestions.push(`Your expenses are above 70% of income. Consider a stricter monthly cap.`);
  } else {
    suggestions.push(`Your spending ratio looks healthier. Try increasing savings by 10% next month.`);
  }

  suggestions.push(`Keep at least <strong>20% of salary</strong> reserved until the next salary arrives.`);
  suggestions.push(`Carry forward unused money to the next month instead of resetting your budget.`);

  if (insights.length === 0) {
    insights.push("Add more transactions to unlock detailed AI insights.");
  }

  insights.forEach(item => {
    aiAnalysis.innerHTML += `<div class="analysis-item">${item}</div>`;
  });

  suggestions.forEach(item => {
    budgetSuggestions.innerHTML += `<div class="analysis-item">${item}</div>`;
  });
}

// ================= FRIENDS =================
friendForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = friendName.value.trim();
  const contribution = Number(friendContribution.value);

  if (!name || !contribution) return;

  friends.push({
    id: Date.now(),
    name,
    amount: contribution
  });

  saveAll();
  friendForm.reset();
  renderTrip();
  showToast("Friend added", "success");
});

function deleteFriend(id) {
  const friend = friends.find(f => f.id === id);

  if (friend) {
    trash.push({
      type: "friend",
      data: friend,
      deletedAt: new Date().toISOString()
    });
  }

  friends = friends.filter(f => f.id !== id);
  tripExpenses = tripExpenses.filter(t => t.name !== friend.name);

  saveAll();
  saveTrash();
  renderTrip();
  showToast("Friend moved to Trash", "info");
}

function renderFriends() {
  friendList.innerHTML = "";
  spentBy.innerHTML = `<option value="">Select friend</option>`;

  friends.forEach(f => {
    friendList.innerHTML += `
      <tr>
        <td>${f.name}</td>
        <td>${formatCurrency(f.amount)}</td>
        <td><button class="delete-btn" onclick="deleteFriend(${f.id})">Delete</button></td>
      </tr>
    `;

    spentBy.innerHTML += `<option value="${f.name}">${f.name}</option>`;
  });

  if (friends.length === 0) {
    friendList.innerHTML = `<tr><td colspan="3" style="text-align:center; color:var(--muted);">No friends added</td></tr>`;
  }

  const tripFilter = document.getElementById("tripFilterFriend");
  tripFilter.innerHTML = `<option value="all">All Friends</option>`;
  friends.forEach(f => {
    tripFilter.innerHTML += `<option value="${f.name}">${f.name}</option>`;
  });
}

// ================= TRIP EXPENSES =================
tripForm.addEventListener("submit", (e) => {
  e.preventDefault();

  tripExpenses.unshift({
    id: Date.now(),
    name: spentBy.value,
    amount: Number(tripAmount.value),
    place: tripPlace.value.trim(),
    date: tripDate.value,
    desc: tripDesc.value.trim()
  });

  saveAll();
  tripForm.reset();
  tripDate.value = new Date().toISOString().split("T")[0];
  renderTrip();
  showToast("Trip expense added", "success");
});

function deleteTripExpense(id) {
  const item = tripExpenses.find(t => t.id === id);

  if (item) {
    trash.push({
      type: "trip",
      data: item,
      deletedAt: new Date().toISOString()
    });
  }

  tripExpenses = tripExpenses.filter(t => t.id !== id);

  saveAll();
  saveTrash();
  renderTrip();
  showToast("Moved to Trash", "info");
}

function renderTripExpenseTable() {

  const filter = document.getElementById("tripFilterFriend").value;
  const friendTotals = document.getElementById("friendTotals");

  let filteredExpenses = tripExpenses;

  if (filter !== "all") {
    filteredExpenses = tripExpenses.filter(t => t.name === filter);
  }

  // CALCULATE TOTALS
  let totalSpent = filteredExpenses.reduce((sum, t) => sum + t.amount, 0);

  let totalContribution = 0;
  if (filter !== "all") {
    const f = friends.find(fr => fr.name === filter);
    totalContribution = f ? f.amount : 0;
  }

  // SHOW TOTALS
  if (filter !== "all") {
    friendTotals.innerHTML = `
      <strong>${filter} Summary:</strong> 
      Contributed: ${formatCurrency(totalContribution)} | 
      Spent: ${formatCurrency(totalSpent)}
    `;
  } else {
    friendTotals.innerHTML = "";
  }

  // TABLE RENDER
  tripExpenseList.innerHTML = "";

  filteredExpenses.forEach(t => {
    tripExpenseList.innerHTML += `
      <tr>
        <td>${t.name}</td>
        <td>${formatCurrency(t.amount)}</td>
        <td>${t.place}</td>
        <td>${t.date}</td>
        <td>${t.desc || "-"}</td>
        <td>
          <button class="delete-btn" onclick="deleteTripExpense(${t.id})">Delete</button>
        </td>
      </tr>
    `;
  });

  if (filteredExpenses.length === 0) {
    tripExpenseList.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; color:var(--muted);">
          No data found
        </td>
      </tr>
    `;
  }
}

function renderTripStats() {
  const collected = friends.reduce((sum, f) => sum + f.amount, 0);
  const spent = tripExpenses.reduce((sum, t) => sum + t.amount, 0);
  const remain = collected - spent;
  const equal = friends.length ? remain / friends.length : 0;

  tripCollected.textContent = formatCurrency(collected);
  tripSpent.textContent = formatCurrency(spent);
  tripRemaining.textContent = formatCurrency(remain);
  equalRemaining.textContent = formatCurrency(equal);
}

function renderSettlement() {

  friendSummaryCards.innerHTML = "";
  const settlementTable = document.getElementById("settlementTable");
  settlementTable.innerHTML = "";

  if (friends.length === 0) {
    friendSummaryCards.innerHTML = `<div class="analysis-item">Add friends first.</div>`;
    return;
  }

  const totalSpent = tripExpenses.reduce((sum, t) => sum + t.amount, 0);
  const share = totalSpent / friends.length;

  let payers = [];
  let receivers = [];

  friends.forEach(f => {
    const spent = tripExpenses
      .filter(t => t.name === f.name)
      .reduce((sum, t) => sum + t.amount, 0);

    const diff = spent - share;

    if (diff < 0) {
      payers.push({ name: f.name, amount: Math.abs(diff) });
    } else if (diff > 0) {
      receivers.push({ name: f.name, amount: diff });
    }

    // SUMMARY CARDS
    const text =
      diff > 0
        ? `${f.name} should receive ${formatCurrency(diff)}`
        : diff < 0
          ? `${f.name} should pay ${formatCurrency(Math.abs(diff))}`
          : `${f.name} is settled`;

    friendSummaryCards.innerHTML += `
      <div class="friend-box">
        <h4>${f.name}</h4>
        <p>Contributed: ${formatCurrency(f.amount)}</p>
        <p>Spent: ${formatCurrency(spent)}</p>
        <p>Fair Share: ${formatCurrency(share)}</p>
        <p><strong>${text}</strong></p>
      </div>
    `;
  });

  // SETTLEMENT LOGIC (who pays whom)
  let i = 0, j = 0;

  while (i < payers.length && j < receivers.length) {
    let pay = payers[i];
    let rec = receivers[j];

    let amount = Math.min(pay.amount, rec.amount);

    settlementTable.innerHTML += `
      <tr>
        <td>${pay.name}</td>
        <td>${rec.name}</td>
        <td>${formatCurrency(amount)}</td>
      </tr>
    `;

    pay.amount -= amount;
    rec.amount -= amount;

    if (pay.amount === 0) i++;
    if (rec.amount === 0) j++;
  }

  if (settlementTable.innerHTML === "") {
    settlementTable.innerHTML = `
      <tr>
        <td colspan="3" style="text-align:center;">All settled ✅</td>
      </tr>
    `;
  }
}

function renderTrip() {
  renderFriends();
  renderTripExpenseTable();
  renderTripStats();
  renderSettlement();
}

// ================= RESET BALANCE =================

function resetBalance() {
  let newBudget = prompt("Enter new monthly budget:");

  if (newBudget && !isNaN(newBudget)) {
  
    budget = Number(newBudget);
    wallet = budget;

    if (typeof budgetInput !== 'undefined') {
      budgetInput.value = budget;
    }

    saveAll(); 
    renderAll();
    showToast("Budget updated successfully", "success");
  }
}

// ================= EXPORT PDF - ONLY LOGO, TRANSACTIONS & TRIP =================
function exportPDF() {
const logo = "EX";
  
  // 🔥 FIX: Local storage data ki jagah real Auth name use kiya
  const userName = currentUser?.displayName || currentUser?.email.split('@')[0] || "User";
  const today = new Date().toLocaleDateString();

  // Get transaction history
  let transactionHTML = `
    <h2>📊 Transaction History</h2>
    <table>
      <thead>
        <tr>
          <th>Type</th>
          <th>Amount</th>
          <th>Category</th>
          <th>Date</th>
          <th>Note</th>
        </tr>
      </thead>
      <tbody>
  `;

  if (transactions.length > 0) {
    transactions.forEach(t => {
      transactionHTML += `
        <tr>
          <td><strong>${t.type.toUpperCase()}</strong></td>
          <td>${formatCurrency(t.amount)}</td>
          <td>${t.category}</td>
          <td>${t.date}</td>
          <td>${t.note || "-"}</td>
        </tr>
      `;
    });
  } else {
    transactionHTML += `<tr><td colspan="5" style="text-align:center;">No transactions</td></tr>`;
  }

  transactionHTML += `</tbody></table>`;

  // Get trip history
  let tripHTML = `
    <h2 style="margin-top: 30px;">✈️ Trip Expense History</h2>
    <table>
      <thead>
        <tr>
          <th>Friend</th>
          <th>Amount</th>
          <th>Where</th>
          <th>Date</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
  `;

  if (tripExpenses.length > 0) {
    tripExpenses.forEach(t => {
      tripHTML += `
        <tr>
          <td>${t.name}</td>
          <td>${formatCurrency(t.amount)}</td>
          <td>${t.place}</td>
          <td>${t.date}</td>
          <td>${t.desc || "-"}</td>
        </tr>
      `;
    });
  } else {
    tripHTML += `<tr><td colspan="5" style="text-align:center;">No trip expenses</td></tr>`;
  }

  tripHTML += `</tbody></table>`;

  // Create PDF
  const win = window.open("", "", "width=1200,height=800");
  win.document.write(`
    <html>
      <head>
        <title>Expense X Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            background: #f5f5f5;
          }
          .header {
            display: flex;
            align-items: center;
            gap: 20px;
            margin-bottom: 30px;
            border-bottom: 3px solid #ff00ff;
            padding-bottom: 20px;
          }
          .logo {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #ff00ff, #00ffff);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            font-weight: bold;
            color: white;
            box-shadow: 0 10px 30px rgba(255, 0, 255, 0.3);
          }
          .header-info h1 {
            margin: 0;
            color: #333;
            font-size: 32px;
          }
          .header-info p {
            margin: 5px 0;
            color: #666;
            font-size: 14px;
          }
          h2 {
            color: #ff00ff;
            margin-top: 30px;
            margin-bottom: 15px;
            font-size: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            background: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          th {
            background: linear-gradient(135deg, #ff00ff, #00ffff);
            color: white;
            padding: 14px;
            text-align: left;
            font-weight: bold;
            font-size: 14px;
          }
          td {
            border: 1px solid #e0e0e0;
            padding: 12px 14px;
            font-size: 13px;
          }
          tr:nth-child(even) {
            background: #f9f9f9;
          }
          tr:hover {
            background: #f0f0f0;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #999;
            font-size: 12px;
            border-top: 1px solid #e0e0e0;
            padding-top: 20px;
          }
          @media print {
            body {
              background: white;
            }
            .header {
              page-break-after: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">${logo}</div>
          <div class="header-info">
            <h1>Expense X Report</h1>
            <p><strong>User:</strong> ${userName}</p>
            <p><strong>Generated:</strong> ${today}</p>
          </div>
        </div>

        ${transactionHTML}
        ${tripHTML}

        <div class="footer">
          <p>Expense X - Smart Finance Tracker</p>
          <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
      </body>
    </html>
  `);
  win.document.close();
  win.print();
}

// ================= MAIN RENDER =================
function renderAll() {
  renderSummary();
  renderTransactionTable();
  drawChartsAnimated();
  renderTrip();
  renderAIAnalysis();
  renderTrash();
}

// ================= THEME SELECTOR =================
themeSelector.addEventListener("change", () => {
  document.body.className = document.body.className.replace(
    /\b(blue|green|red|purple|orange|pink|yellow|darkblue|teal)\b/g,
    ""
  );

  const theme = themeSelector.value;

  if (theme !== "default") {
    document.body.classList.add(theme);
  }

  localStorage.setItem(COLOR_THEME_KEY, theme);
});

// ================= RESET FUNCTIONS =================
function resetAllTransactions() {
  const now = new Date().toISOString();
  transactions.forEach(t => {
    trash.push({ type: "transaction", data: t, deletedAt: now });
  });
  saveTrash(); // Yeh hamare cloud saveTrash ko trigger karega

  transactions = [];
  budget = 0;
  wallet = 0;
  carryAmount = 0;

  // ❌ SAARI LOCAL STORAGE REMOVE LINES DELETE KAR DI

  saveAll(); // 🔥 Cloud master document ko instantly clean kar dega
  renderAll();
  showToast("✅ All transactions moved to Trash", "info");
}

function resetAllTripData() {
  const now = new Date().toISOString();
  friends.forEach(f => {
    trash.push({ type: "friend", data: f, deletedAt: now });
  });
  tripExpenses.forEach(t => {
    trash.push({ type: "trip", data: t, deletedAt: now });
  });
  saveTrash();

  friends = [];
  tripExpenses = [];

  // ❌ Hata diya: localStorage.removeItem(F_KEY);
  // ❌ Hata diya: localStorage.removeItem(TE_KEY);

  saveAll(); // 🔥 Cloud sync
  renderTrip();
  renderAll();
  showToast("✅ All trip data moved to Trash", "info");
}

// ================= EVENT LISTENERS =================

// ================= ENHANCED RESET WITH MODAL =================
function showResetModal(type) {
  // Create modal backdrop
  const modal = document.createElement("div");
  modal.id = "resetModal";
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    backdrop-filter: blur(8px);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  `;

  const content = document.createElement("div");
  content.style.cssText = `
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 30px;
    max-width: 400px;
    width: 100%;
    text-align: center;
    backdrop-filter: blur(20px);
  `;

  let title, message;
  
  if (type === "transactions") {
    title = "🚮 Reset All Transactions";
    message = `
      <p style="margin-bottom: 15px; color: var(--text);">
        This will <strong>permanently delete</strong> all your transactions, 
        reset budget to ₹0, and clear wallet balance.
      </p>
      <p style="color: var(--danger); font-weight: 600;">
        Are you absolutely sure?
      </p>
    `;
  } else {
    title = "🚮 Reset All Trip Data";
    message = `
      <p style="margin-bottom: 15px; color: var(--text);">
        This will <strong>permanently delete</strong> all friends and trip expenses.
      </p>
      <p style="color: var(--danger); font-weight: 600;">
        Are you absolutely sure?
      </p>
    `;
  }

  content.innerHTML = `
    <h3 style="color: var(--danger); margin-bottom: 15px; font-size: 24px;">${title}</h3>
    ${message}
    <div style="display: flex; gap: 12px; justify-content: center; margin-top: 25px;">
      <button id="confirmReset" class="delete-btn" style="padding: 12px 24px; font-size: 14px;">
        Yes, Reset Everything
      </button>
      <button id="cancelReset" class="secondary-btn" style="padding: 12px 24px; font-size: 14px; background: rgba(255,255,255,0.1);">
        Cancel
      </button>
    </div>
  `;

  modal.appendChild(content);
  document.body.appendChild(modal);

  // Event listeners
  document.getElementById("confirmReset").onclick = () => {
    document.body.removeChild(modal);
    if (type === "transactions") resetAllTransactions();
    else resetAllTripData();
  };

  document.getElementById("cancelReset").onclick = () => {
    document.body.removeChild(modal);
  };

  // Close on backdrop click
  modal.onclick = (e) => {
    if (e.target === modal) document.body.removeChild(modal);
  };
}

// Update event listeners for enhanced modals
document.getElementById("resetTransactionsBtn").addEventListener("click", () => showResetModal("transactions"));
document.getElementById("resetTripDataBtn").addEventListener("click", () => showResetModal("trip"));


// ================= TRASH BIN =================
function saveTrash() {
 saveAll()
}

function cleanOldTrash() {
  const now = new Date();
  trash = trash.filter(item => {
    const deletedDate = new Date(item.deletedAt);
    const diffDays = (now - deletedDate) / (1000 * 60 * 60 * 24);
    return diffDays <= 20;
  });
  saveTrash();
}

function renderTrash() {
  const trashList = document.getElementById("trashList");
  const trashEmpty = document.getElementById("trashEmpty");

  if (!trashList) return;
  trashList.innerHTML = "";

  // Update header count
  const trashHeading = document.querySelector("#trashbin h3");
  if (trashHeading) {
    trashHeading.textContent = trash.length > 0 ? `🗑️ Trash Bin (${trash.length})` : "🗑️ Trash Bin";
  }

  const filterEl = document.getElementById("trashFilter");
  const filter = filterEl ? filterEl.value : "all";
  const filtered = filter === "all" ? trash : trash.filter(item => item.type === filter);

  if (filtered.length === 0) {
    trashEmpty.style.display = "block";
    return;
  } else {
    trashEmpty.style.display = "none";
  }

  filtered.forEach((item) => {
    const index = trash.indexOf(item);
    const label = item.data.note || item.data.name || item.data.place || item.data.desc || "-";
    trashList.innerHTML += `
      <tr>
        <td><span class="type-badge type-${item.type === 'transaction' ? item.data.type : 'expense'}">${item.type}</span></td>
        <td>${label}</td>
        <td>${formatCurrency(item.data.amount || 0)}</td>
        <td>${new Date(item.deletedAt).toLocaleDateString()}</td>
        <td>
          <button onclick="restoreItem(${index})" class="edit-btn">Restore</button>
          <button onclick="deleteForever(${index})" class="delete-btn">Delete</button>
        </td>
      </tr>
    `;
  });
}

function restoreItem(index) {
  const item = trash[index];

  if (item.type === "transaction") {
    transactions.unshift(item.data);
    if (item.data.type === "income") {
      wallet += item.data.amount;
    } else {
      wallet -= item.data.amount;
    }
  } else if (item.type === "friend") {
    friends.push(item.data);
  } else if (item.type === "trip") {
    tripExpenses.unshift(item.data);
  }

  trash.splice(index, 1);

  saveAll();
  saveTrash();
  renderAll();
  showToast("Item restored", "success");
}

function deleteForever(index) {
  trash.splice(index, 1);
  saveTrash();
  renderTrash();
  showToast("Deleted permanently", "error");
}

function emptyTrash() {
  if (!confirm("Delete all trash permanently?")) return;
  trash = [];
  saveTrash();
  renderTrash();
  showToast("Trash cleared", "success");
}

// ================= GLOBAL FUNCTIONS =================
window.editTransaction = editTransaction;
window.deleteTransaction = deleteTransaction;
window.deleteFriend = deleteFriend;
window.deleteTripExpense = deleteTripExpense;
window.exportPDF = exportPDF;
window.resetBalance = resetBalance;
window.resetAllTransactions = resetAllTransactions;
window.resetAllTripData = resetAllTripData;
window.restoreItem = restoreItem;
window.deleteForever = deleteForever;
window.emptyTrash = emptyTrash;