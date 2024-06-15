// Will populate the tables based on firbase data, must test first, 
// commented out portion in the dashboard.html for now


  // Function to update the budgets table may chnage since the form lets you 
  // update a budget or create a a new one if it doesn;t exist 
 
  document.addEventListener('DOMContentLoaded', function() {
    // Reference our firebase database
    let database = firebase.database();

    // Function to set date range for date input fields
    function setDateRange() {
        const dateBoxes = document.querySelectorAll(".date-field");
        const todayDate = new Date().toISOString().split("T")[0]; // formats to date yy-mm-dd and removes everything else
        const lastYear = new Date();
        lastYear.setFullYear(lastYear.getFullYear() - 1);
        const previousYear = lastYear.toISOString().split('T')[0];  // formats a date one year from the current date
    
        // sets limit to any fields using a date
        dateBoxes.forEach(field => {
            field.setAttribute('max', todayDate);
            field.setAttribute('min', previousYear);
            field.value = todayDate; // Set the default date to today
        });
    }

    // Function to update the budgets table, no buttons added on purpose so no key needed 
    function updateBudgetsTable(snapshot) {
        let budgetsTableBody = document.getElementById('budgetsTableBody');
        budgetsTableBody.innerHTML = ''; // Clear previous data

        snapshot.forEach(function(childSnapshot) {
            let data = childSnapshot.val();

            let row = document.createElement('tr');
            row.innerHTML = `
                <th scope="row">${data.category}</th>
                <td>${data.limit}</td>
                <td>${data.spent}</td>
                <td>${data.limit - data.spent}</td>`;
            budgetsTableBody.appendChild(row);
        });
    }

    // Function to update the expenses table
    function updateExpensesTable(snapshot) {
        let expensesTableBody = document.getElementById('expensesTableBody');
        expensesTableBody.innerHTML = ''; // Clear previous data

        snapshot.forEach(function(childSnapshot) {
            let key = childSnapshot.key; // Get the unique key for each row
            let data = childSnapshot.val();

            let row = document.createElement('tr');
            row.innerHTML = `
                <th scope="row">${data.date}</th>
                <td>${data.description}</td>
                <td>${data.amount}</td>
                <td>${data.category}</td>
                <td class="table-btns col-1">
                    <div class="btn-group" role="group">
                        <button class="btn btn-secondary expense-edit-btn" onclick="showEditRow('expense', '${key}', '${data.date}', '${data.description}', '${data.amount}', '${data.category}')">Edit</button>
                        <button class="btn btn-danger expense-delete-btn" onclick="confirmDelete('expense', '${key}')">Delete</button>
                    </div>
                </td>`;
            expensesTableBody.appendChild(row);

            let editRow = document.createElement('tr');
            editRow.classList.add('edit-row', 'd-none');
            editRow.id = `edit-row-${key}`;
            editRow.innerHTML = `
                <td>
                    <input type="date" class="date-field form-control" id="edit-date-${key}" value="${data.date}">
                </td>
                <td>
                    <input type="text" class="form-control" id="edit-description-${key}" value="${data.description}">
                </td>
                <td>
                    <input type="text" class="money-field form-control" id="edit-amount-${key}" value="${data.amount}">
                </td>
                <td>
                    <input type="text" class="form-control" id="edit-category-${key}" value="${data.category}">
                </td>
                <td class="table-btns col-1">
                    <div class="btn-group" role="group">
                        <button class="btn btn-success" onclick="confirmEditExpense('${key}')">Confirm</button>
                        <button class="btn btn-secondary" onclick="cancelEdit('${key}', 'expense')">Cancel</button>
                    </div>
                </td>`;
            expensesTableBody.appendChild(editRow);
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
                <td class="table-btns col-1">
                    <div class="btn-group" role="group">
                        <button class="btn btn-secondary income-edit-btn" onclick="showEditRow('income', '${key}', '${data.description}', '${data.interval}', '${data.amount}')">Edit</button>
                        <button class="btn btn-danger income-delete-btn" onclick="confirmDelete('income', '${key}')">Delete</button>
                    </div>
                </td>`;
            incomeTableBody.appendChild(row);

            let editRow = document.createElement('tr');
            editRow.classList.add('edit-row', 'd-none');
            editRow.id = `edit-row-${key}`;
            editRow.innerHTML = `
                <td>
                    <input type="text" class="form-control" id="edit-description-${key}" value="${data.description}">
                </td>
                <td>
                    <input type="text" class="form-control" id="edit-interval-${key}" value="${data.interval}">
                </td>
                <td>
                    <input type="text" class="money-field form-control" id="edit-amount-${key}" value="${data.amount}">
                </td>
                <td class="table-btns col-1">
                    <div class="btn-group" role="group">
                        <button class="btn btn-success" onclick="confirmEditIncome('${key}')">Confirm</button>
                        <button class="btn btn-secondary" onclick="cancelEdit('${key}', 'income')">Cancel</button>
                    </div>
                </td>`;
            incomeTableBody.appendChild(editRow);
        });
    }

    // Function to show the edit row based on the key associated with it
    function showEditRow(type, key, ...data) {
        const editRow = document.getElementById(`edit-row-${key}`);
        editRow.classList.remove('d-none');
        const buttons = document.querySelectorAll(`.${type}-edit-btn, .${type}-delete-btn`);
        buttons.forEach(button => {
            button.disabled = true;
        });
        // Only enable the confirm and cancel buttons in the edit row
        editRow.querySelectorAll('button').forEach(button => {
            button.disabled = false;
        });
    }

    // Function to cancel the edit
    function cancelEdit(key, type) {
        const editRow = document.getElementById(`edit-row-${key}`);
        editRow.classList.add('d-none');
        // Clear the inputs in the edit row
        editRow.querySelectorAll('input').forEach(input => {
            input.value = '';
        });
        // Re-enable the edit and delete buttons in the same table
        const buttons = document.querySelectorAll(`.${type}-edit-btn, .${type}-delete-btn`);
        buttons.forEach(button => {
            button.disabled = false;
        });
    }

    // Function to confirm the edit for expense
    function confirmEditExpense(key) {
        let userId = localStorage.getItem('userId');
        if (userId && userId !== '0') {
            let updatedData = {
                date: document.getElementById(`edit-date-${key}`).value,
                description: document.getElementById(`edit-description-${key}`).value,
                amount: document.getElementById(`edit-amount-${key}`).value,
                category: document.getElementById(`edit-category-${key}`).value
            };
            database.ref('expenses/' + userId + '/' + key).update(updatedData);
            cancelEdit(key, 'expense'); // Hide the edit row and enable buttons
        } else {
            console.log('Cannot edit expense: invalid userId');
        }
    }

    // Function to confirm the edit for income
    function confirmEditIncome(key) {
        let userId = localStorage.getItem('userId');
        if (userId && userId !== '0') {
            let updatedData = {
                description: document.getElementById(`edit-description-${key}`).value,
                interval: document.getElementById(`edit-interval-${key}`).value,
                amount: document.getElementById(`edit-amount-${key}`).value
            };
            database.ref('income/' + userId + '/' + key).update(updatedData);
            cancelEdit(key, 'income'); // Hide the edit row and enable buttons
        } else {
            console.log('Cannot edit income: invalid userId');
        }
    }

    // Function to confirm delete action
    function confirmDelete(type, key) {
        if (confirm("Are you sure you want to delete this item?")) {
            if (type === 'expense') {
                deleteExpense(key);
            } else if (type === 'income') {
                deleteIncome(key);
            }
        }
    }

    // Function to delete an expense entry
    function deleteExpense(key) {
        let userId = localStorage.getItem('userId');
        if (userId && userId !== '0') {
            database.ref('expenses/' + userId + '/' + key).remove();
        } else {
            console.log('Cannot delete expense: invalid userId');
        }
    }

    // Function to delete an income entry
    function deleteIncome(key) {
        let userId = localStorage.getItem('userId');
        if (userId && userId !== '0') {
            database.ref('income/' + userId + '/' + key).remove();
        } else {
            console.log('Cannot delete income: invalid userId');
        }
    }

    // Get the user ID from localStorage
    let userId = localStorage.getItem('userId');
    
    // the initial tables are populated once, then on is used to listen for any changes made to tables
    // containing user data.
    if (userId && userId !== '0') {
        // Listener for Budgets table change
        database.ref('budgets/' + userId).on('value', function(snapshot) {
            updateBudgetsTable(snapshot);
        });

        // Listener for Expenses table change
        database.ref('expenses/' + userId).on('value', function(snapshot) {
            updateExpensesTable(snapshot);
        });

        // Listener for Income table change
        database.ref('income/' + userId).on('value', function(snapshot) {
            updateIncomeTable(snapshot);
        });

        // Explicitly call functions to populate tables on initial load
        database.ref('budgets/' + userId).once('value', function(snapshot) {
            updateBudgetsTable(snapshot);
        });

        database.ref('expenses/' + userId).once('value', function(snapshot) {
            updateExpensesTable(snapshot);
            setDateRange(); // Apply date constraints once after the initial load
            getFormValidation(); // Apply money field validation once after the initial load
        });

        database.ref('income/' + userId).once('value', function(snapshot) {
            updateIncomeTable(snapshot);
            setDateRange(); // Apply date constraints once after the initial load
            getFormValidation(); // Apply money field validation once after the initial load
        });

    } else {
        console.log('User ID not found or invalid in localStorage');
    }
});