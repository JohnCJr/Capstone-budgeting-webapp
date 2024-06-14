// Will populate the tables based on firbase data, must test first, 
// commented out portion in the dashboard.html for now

let firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  };
  
  // Initialize Firebase config
  firebase.initializeApp(firebaseConfig);
  
  // Reference our firebase database
  let database = firebase.database();
  
  // Function to update the budgets table may chnage since the form lets you 
  // update a budget or create a a new one if it doesn;t exist 
  function updateBudgetsTable(snapshot) {
    let budgetsTableBody = document.getElementById('budgetsTableBody');
    budgetsTableBody.innerHTML = ''; // Clear previous data
  
    snapshot.forEach(function(childSnapshot) {
      let key = childSnapshot.key; // Get the unique key for the row
      let data = childSnapshot.val();
  
      let row = document.createElement('tr');
      row.innerHTML = `
        <th scope="row">${data.category}</th>
        <td>${data.limit}</td>
        <td>${data.spent}</td>
        <td>${data.limit - data.spent}</td>
        <td>
          <button class="btn btn-primary" onclick="editBudget('${key}')">Edit</button>
          <button class="btn btn-danger" onclick="deleteBudget('${key}')">Delete</button>
        </td>`;
      budgetsTableBody.appendChild(row);
    });
  }
  
  // Function to update the expenses table
  function updateExpensesTable(snapshot) {
    let expensesTableBody = document.getElementById('expensesTableBody');
    expensesTableBody.innerHTML = ''; // Clear previous data
  
    snapshot.forEach(function(childSnapshot) {
      let key = childSnapshot.key; // Get the unique key for the row
      let data = childSnapshot.val();
  
      let row = document.createElement('tr');
      row.innerHTML = `
        <th scope="row">${data.date}</th>
        <td>${data.description}</td>
        <td>${data.amount}</td>
        <td>${data.category}</td>
        <td>
          <button class="btn btn-primary" onclick="editExpense('${key}')">Edit</button>
          <button class="btn btn-danger" onclick="deleteExpense('${key}')">Delete</button>
        </td>`;
      expensesTableBody.appendChild(row);
    });
  }
  
  // Function to update the income table
  function updateIncomeTable(snapshot) {
    let incomeTableBody = document.getElementById('incomeTableBody');
    incomeTableBody.innerHTML = ''; // Clear previous data
  
    snapshot.forEach(function(childSnapshot) {
      let key = childSnapshot.key; // Get the unique key for the row
      let data = childSnapshot.val();
  
      let row = document.createElement('tr');
      row.innerHTML = `
        <th scope="row">${data.description}</th>
        <td>${data.interval}</td>
        <td>${data.amount}</td>
        <td>
          <button class="btn btn-primary" onclick="editIncome('${key}')">Edit</button>
          <button class="btn btn-danger" onclick="deleteIncome('${key}')">Delete</button>
        </td>`;
      incomeTableBody.appendChild(row);
    });
  }
  
  // Function to delete a budget entry
  function deleteBudget(key) {
    let userId = firebase.auth().currentUser.uid;
    database.ref('budgets/' + userId + '/' + key).remove();
  }
  
  // Function to delete an expense entry
  function deleteExpense(key) {
    let userId = firebase.auth().currentUser.uid;
    database.ref('expenses/' + userId + '/' + key).remove();
  }
  
  // Function to delete an income entry
  function deleteIncome(key) {
    let userId = firebase.auth().currentUser.uid;
    database.ref('income/' + userId + '/' + key).remove();
  }
  
  // for testing purposes, will add code after confirming that it works
  function editBudget(key) {
    console.log('Editing budget: ' + key);
  }
  
  // for testing purposes, will add code after confirming that it works
  function editExpense(key) {
    console.log('Editing expense: ' + key);
  }
  
  function editIncome(key) {
    console.log('Editing income: ' + key);
  }
  
  // listener for Budgets that will update table when it notices a change in database
  database.ref('budgets').on('value', function(snapshot) {
    updateBudgetsTable(snapshot);
  });
  
  // listener for Expensesthat will update table when it notices a change in database
  database.ref('expenses').on('value', function(snapshot) {
    updateExpensesTable(snapshot);
  });
  
  // listener for Income that will update table when it notices a change in database
  database.ref('income').on('value', function(snapshot) {
    updateIncomeTable(snapshot);
  });