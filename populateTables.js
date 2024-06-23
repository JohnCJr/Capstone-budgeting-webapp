// Will populate the tables based on firebase data, must test first, 
// commented out portion in the dashboard.html for now

import { database, ref, update, remove, onValue, get } from "./initialize-firebase.js"; // Adjust the path if necessary
import { sanitize } from './sanitizeStrings.js'; // Import the sanitize function


document.addEventListener('DOMContentLoaded', function() {
    let expensesData = [];

    // Function to set date range for date input fields
    function setDateRange() {
        const dateBoxes = document.querySelectorAll(".date-field");
        const todayDate = new Date().toISOString().split("T")[0];
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const pastDate = sevenDaysAgo.toISOString().split('T')[0];

        dateBoxes.forEach(field => {
            field.setAttribute('max', todayDate);
            field.setAttribute('min', pastDate);
            field.value = todayDate; // Set the default date to today
        });
    }

    // Function to update the budgets table
    function updateBudgetsTable(budgetsSnapshot, expensesSnapshot) {
        let budgetsTableBody = document.getElementById('budgetsTableBody');
        let budgetsTableFoot = document.getElementById('budgetsTableFoot');
        budgetsTableFoot.innerHTML = ''; 
        budgetsTableBody.innerHTML = ''; // Clear previous data
    
        const categories = ['entertainment', 'food', 'utility', 'other'];
    
        let budgetData = budgetsSnapshot.val();
        let expenseData = expensesSnapshot.val();
        let totalSpent = 0;
        let statusColor = 'black';
    
        categories.forEach(category => {
            let budgetAmount = parseFloat(budgetData[category]) || 0;
            let spentAmount = 0;
    
            if (expenseData) {
                Object.values(expenseData).forEach(expense => {
                    if (expense.category.toLowerCase() === category) {
                        spentAmount += parseFloat(expense.amount);
                    }
                });
            }
    
            if (spentAmount > budgetAmount) {
                statusColor = `style="color:red;"`;
            } else if (spentAmount === budgetAmount) {
                statusColor = `style="color:black;"`;
            } 
            else {
                statusColor = `style="color:green;"`;
            }
    
            let remainingAmount = budgetAmount - spentAmount;
            totalSpent += spentAmount;
    
            let row = document.createElement('tr');
            row.innerHTML = `
                <td>${capitalize(category)}</td>
                <td>$${budgetAmount.toFixed(2)}</td>
                <td>$${spentAmount.toFixed(2)}</td>
                <td ${statusColor}>$${remainingAmount.toFixed(2)}</td>`;
            budgetsTableBody.appendChild(row);
        });
    
        totalSpent = parseFloat(totalSpent.toFixed(2)); // Round totalSpent to 2 decimal places
    
        if (budgetData.total > totalSpent) {
            statusColor = `style="color:green;"`;
        } else if (budgetData.total === totalSpent){
            statusColor = `style="color:black;"`;
        } 
        else {
            statusColor = `style="color:red;"`;
        }
    
        let footRow = document.createElement('tr');
        footRow.classList.add("table-primary");
        footRow.innerHTML = ` <th>Total:</th>
                              <td>$${budgetData.total}</td>
                              <td>$${totalSpent}</td>
                              <td ${statusColor}>$${(budgetData.total - totalSpent).toFixed(2)}</td>`;
        budgetsTableFoot.appendChild(footRow);
    }

    // Function to update the expenses table
    function updateExpensesTable(snapshot) {
        expensesData = [];
        snapshot.forEach(function(childSnapshot) {
            let data = childSnapshot.val();
            data.key = childSnapshot.key;
            expensesData.push(data);
        });
        console.log('Expenses data:', expensesData); // Debugging log
        renderExpensesTable();
        setDateRange();
    }
    
    function renderExpensesTable() {
        let expensesTableBody = document.getElementById('expensesTableBody');
        expensesTableBody.innerHTML = '';
        let expensesTableFoot = document.getElementById('expensesTableFoot');
        expensesTableFoot.innerHTML = '';
        let currentTotalExpense = 0;
    
        const sortField = document.getElementById('sortField').value;
        const sortOrder = document.getElementById('sortOrder').value;
        const filterField = document.getElementById('filterField').value;
    
        console.log('Sort Field:', sortField, 'Sort Order:', sortOrder, 'Filter Field:', filterField);
    
        let filteredData = expensesData.filter(expense => filterField === 'none' || expense.category.toLowerCase() === filterField);
        console.log('Filtered data:', filteredData); // Debugging log
    
        if (sortField !== 'all') {
            filteredData.sort((a, b) => {
                if (sortOrder === 'asc') {
                    return a[sortField] > b[sortField] ? 1 : -1;
                } else {
                    return a[sortField] < b[sortField] ? 1 : -1;
                }
            });
        }
    
        filteredData.forEach(data => {
            let sanitizedDate = sanitize(data.date || new Date().toISOString().split("T")[0]);
            let sanitizedDescription = sanitize(data.description || 'undefined');
            let sanitizedAmount = sanitize(data.amount || 'undefined');
            let sanitizedCategory = capitalize(sanitize(data.category || 'undefined'));
    
            currentTotalExpense += parseFloat(data.amount);
    
            let row = document.createElement('tr');
            row.innerHTML = `
                <td>${sanitizedDate}</td>
                <td>${decodeHTMLEntities(sanitizedDescription)}</td>
                <td>$${parseFloat(sanitizedAmount).toFixed(2)}</td>
                <td>${sanitizedCategory}</td>
                <td class="table-btns col-1">
                    <div class="btn-group" role="group">
                        <button class="btn btn-secondary expense-edit-btn" onclick='showEditRow("expense", "${data.key}", ${JSON.stringify(sanitizedDate)}, ${JSON.stringify(decodeHTMLEntities(sanitizedDescription))}, ${JSON.stringify(parseFloat(sanitizedAmount).toFixed(2))}, ${JSON.stringify(sanitizedCategory)})'>Edit</button>
                        <button class="btn btn-danger expense-delete-btn" onclick="confirmDelete('expense', '${data.key}')">Delete</button>
                    </div>
                </td>`;
            expensesTableBody.appendChild(row);
    
            let editRow = document.createElement('tr');
            editRow.classList.add('edit-row', 'd-none');
            editRow.id = `edit-row-${data.key}`;
            editRow.innerHTML = `
                <td>
                    <input type="date" class="date-field form-control" id="edit-date-${data.key}" value="${sanitizedDate}" required>
                </td>
                <td>
                    <input type="text" class="form-control" id="edit-description-${data.key}" value="${decodeHTMLEntities(sanitizedDescription)}">
                </td>
                <td>
                    <input type="text" class="money-field form-control" id="edit-amount-${data.key}" value="${parseFloat(sanitizedAmount).toFixed(2)}" required>
                </td>
                <td>
                    <select class="form-select form-select-md" id="edit-category-${data.key}" aria-label="Small type select" required>
                        <option value="food" ${sanitizedCategory === 'Food' ? 'selected' : ''}>Food</option>
                        <option value="utility" ${sanitizedCategory === 'Utility' ? 'selected' : ''}>Utility</option>
                        <option value="entertainment" ${sanitizedCategory === 'Entertainment' ? 'selected' : ''}>Entertainment</option>
                        <option value="other" ${sanitizedCategory === 'Other' ? 'selected' : ''}>Other</option>
                    </select>
                </td>
                <td class="table-btns col-1">
                    <div class="btn-group" role="group">
                        <button class="btn btn-success" onclick="confirmEditExpense('${data.key}')">Confirm</button>
                        <button class="btn btn-secondary" onclick="cancelEdit('${data.key}', 'expense')">Cancel</button>
                    </div>
                </td>`;
            expensesTableBody.appendChild(editRow);
        });
    
        currentTotalExpense = parseFloat(currentTotalExpense.toFixed(2)); // Round total expense to 2 decimal places
    
        let editRowFoot = document.createElement('tr');
        editRowFoot.classList.add("table-primary");
        editRowFoot.innerHTML = `<th>Total:</th>
                                 <td></td>
                                 <td>$${currentTotalExpense.toFixed(2)}</td>
                                 <td></td>`;
        expensesTableFoot.appendChild(editRowFoot);
    }

    // Function to update the income table
    function updateIncomeTable(snapshot) {
        let incomeTableBody = document.getElementById('incomeTableBody');
        incomeTableBody.innerHTML = ''; // Clear previous data
        let incomeTableFoot = document.getElementById('incomeTableFoot');
        incomeTableFoot.innerHTML = ''; // Clear previous data
        let currentTotalIncome = 0;
    
        snapshot.forEach(function(childSnapshot) {
            let key = childSnapshot.key; // Get the unique key for the row
            let data = childSnapshot.val();
            let sanitizedDate = sanitize(data.date || new Date().toISOString().split("T")[0]);
            let sanitizedDescription = sanitize(data.description || 'undefined');
            let sanitizedType = capitalize(sanitize(data.type || 'undefined').toLowerCase());
            sanitizedType = "Biweekly" ? "Bi-weekly" : sanitizedType;
            let sanitizedAmount = parseFloat(sanitize(data.amount || 'undefined')).toFixed(2);
            currentTotalIncome += parseFloat(sanitizedAmount);
    
            let row = document.createElement('tr');
            row.innerHTML = `
                <td>${sanitizedDate}</td>
                <td>${sanitizedDescription}</td>
                <td>${sanitizedType}</td>
                <td>$${sanitizedAmount}</td>
                <td class="table-btns col-1">
                    <div class="btn-group" role="group">
                        <button class="btn btn-secondary income-edit-btn" onclick='showEditRow("income", "${key}", ${JSON.stringify(decodeHTMLEntities(sanitizedDescription))}, ${JSON.stringify(data.type)}, ${JSON.stringify(sanitizedAmount)})'>Edit</button>
                        <button class="btn btn-danger income-delete-btn" onclick="confirmDelete('income', '${key}')">Delete</button>
                    </div>
                </td>`;
            incomeTableBody.appendChild(row);
    
            let editRow = document.createElement('tr');
            editRow.classList.add('edit-row', 'd-none');
            editRow.id = `edit-row-${key}`;
            editRow.innerHTML = `
                <td>
                    <input type="date" class="date-field form-control" id="edit-date-${data.key}" value="${sanitizedDate}" required>
                </td>
                <td>
                    <input type="text" class="form-control" id="edit-description-${key}" value="${decodeHTMLEntities(sanitizedDescription)}" required>
                </td>
                <td>
                    <select class="form-select form-select-md" id="edit-type-${key}" aria-label="Small type select" required>
                        <option value="weekly" ${data.type.toLowerCase() === 'weekly' ? 'selected' : ''}>Weekly</option>
                        <option value="biweekly" ${data.type.toLowerCase() === 'biweekly' ? 'selected' : ''}>Bi-weekly</option>
                        <option value="monthly" ${data.type.toLowerCase() === 'monthly' ? 'selected' : ''}>Monthly</option>
                        <option value="once" ${data.type.toLowerCase() === 'once' ? 'selected' : ''}>One-time</option>
                    </select>
                </td>
                <td>
                    <input type="text" class="money-field form-control" id="edit-amount-${key}" value="${sanitizedAmount}" required>
                </td>
                <td class="table-btns col-1">
                    <div class="btn-group" role="group">
                        <button class="btn btn-success" onclick="confirmEditIncome('${key}')">Confirm</button>
                        <button class="btn btn-secondary" onclick="cancelEdit('${key}', 'income')">Cancel</button>
                    </div>
                </td>`;
            incomeTableBody.appendChild(editRow);
        });
    
        currentTotalIncome = parseFloat(currentTotalIncome.toFixed(2)); // Round total income to 2 decimal places
    
        let editRowFoot = document.createElement('tr');
        editRowFoot.classList.add("table-primary");
        editRowFoot.innerHTML = `<th>Total:</th>
                                 <td></td>
                                 <td></td>
                                 <td>$${currentTotalIncome.toFixed(2)}</td>`;
        incomeTableFoot.appendChild(editRowFoot);
    
        // Apply date range to all date fields
        setDateRange();
    }

    // Function to decode HTML entities
    function decodeHTMLEntities(text) {
        const textArea = document.createElement('textarea');
        textArea.innerHTML = text;
        return textArea.value;
    }

    // Function to capitalize the first letter of a string
    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Function to show the edit row based on the key associated with it
    window.showEditRow = function(type, key, ...data) {
        console.log(`showEditRow called with type: ${type}, key: ${key}, data: ${data}`);
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
        // Populate the form fields with the current data
        if (type === 'expense') {
            document.getElementById(`edit-date-${key}`).value = data[0] || new Date().toISOString().split("T")[0];
            document.getElementById(`edit-description-${key}`).value = decodeHTMLEntities(data[1]);
            document.getElementById(`edit-amount-${key}`).value = data[2];
            document.getElementById(`edit-category-${key}`).value = data[3].toLowerCase();
        } else if (type === 'income') {
            document.getElementById(`edit-description-${key}`).value = decodeHTMLEntities(data[0]);
            document.getElementById(`edit-type-${key}`).value = data[1].toLowerCase();
            document.getElementById(`edit-amount-${key}`).value = data[2];
        }
        // Call the script to format monetary fields
        if (window.getFormValidationShared) {
            window.getFormValidationShared();
        }
        // Apply date range to new date fields
        setDateRange();
    };

    // Function to cancel the edit
    window.cancelEdit = function(key, type) {
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
    };

    // Function to confirm the edit for expense
    window.confirmEditExpense = function(key) {
        let userId = localStorage.getItem('userId');
        if (userId !== '0') {
            let updatedData = {
                date: sanitize(document.getElementById(`edit-date-${key}`).value),
                description: sanitize(document.getElementById(`edit-description-${key}`).value),
                amount: sanitize(document.getElementById(`edit-amount-${key}`).value),
                category: sanitize(document.getElementById(`edit-category-${key}`).value)
            };
            update(ref(database, 'expenses/' + userId + '/' + key), updatedData)
                .then(() => {
                    console.log('Expense updated successfully');
                    // Call updateBudgetsTable here to refresh the budgets table
                    get(ref(database, 'budgets/' + userId)).then(function(budgetsSnapshot) {
                        get(ref(database, 'expenses/' + userId)).then(function(expensesSnapshot) {
                            updateBudgetsTable(budgetsSnapshot, expensesSnapshot);
                        });
                    });
                })
                .catch((error) => {
                    console.error('Error updating expense:', error);
                });
            cancelEdit(key, 'expense'); // Hide the edit row and enable buttons
        } else {
            console.log('Cannot edit expense: invalid userId');
        }
    };

    // Function to confirm the edit for income
    window.confirmEditIncome = function(key) {
        let userId = localStorage.getItem('userId');
        if (userId !== '0') {
            let updatedData = {
                description: sanitize(document.getElementById(`edit-description-${key}`).value),
                type: sanitize(document.getElementById(`edit-type-${key}`).value),
                amount: sanitize(document.getElementById(`edit-amount-${key}`).value)
            };
            update(ref(database, 'income/' + userId + '/' + key), updatedData)
                .then(() => {
                    console.log('Income updated successfully');
                })
                .catch((error) => {
                    console.error('Error updating income:', error);
                });
            cancelEdit(key, 'income'); // Hide the edit row and enable buttons
        } else {
            console.log('Cannot edit income: invalid userId');
        }
    };

    // Function to confirm delete action
    window.confirmDelete = function(type, key) {
        if (confirm("Are you sure you want to delete this item?")) {
            if (type === 'expense') {
                deleteExpense(key);
            } else if (type === 'income') {
                deleteIncome(key);
            }
        }
    };

    // Function to delete an expense entry
    function deleteExpense(key) {
        let userId = localStorage.getItem('userId');
        if (userId !== '0') {
            remove(ref(database, 'expenses/' + userId + '/' + key))
                .then(() => {
                    console.log('Expense deleted successfully');
                })
                .catch((error) => {
                    console.error('Error deleting expense:', error);
                });
        } else {
            console.log('Cannot delete expense: invalid userId');
        }
    }

    // Function to delete an income entry
    function deleteIncome(key) {
        let userId = localStorage.getItem('userId');
        if (userId !== '0') {
            remove(ref(database, 'income/' + userId + '/' + key))
                .then(() => {
                    console.log('Income deleted successfully');
                })
                .catch((error) => {
                    console.error('Error deleting income:', error);
                });
        } else {
            console.log('Cannot delete income: invalid userId');
        }
    }

    // Get the user ID from localStorage
    let userId = localStorage.getItem('userId');

    // the initial tables are populated once, then on is used to listen for any changes made to tables
    // containing user data.
    if (userId !== '0') {
        // Listener for Budgets table change
        onValue(ref(database, 'budgets/' + userId), function(budgetsSnapshot) {
            get(ref(database, 'expenses/' + userId)).then(function(expensesSnapshot) {
                updateBudgetsTable(budgetsSnapshot, expensesSnapshot);
            });
        });

        // Listener for Expenses table change
        onValue(ref(database, 'expenses/' + userId), function(snapshot) {
            console.log('Expenses snapshot:', snapshot.val()); // Debugging log
            updateExpensesTable(snapshot);
        });

        // Listener for Income table change
        onValue(ref(database, 'income/' + userId), function(snapshot) {
            updateIncomeTable(snapshot);
        });

        // Explicitly call functions to populate tables on initial load
        get(ref(database, 'budgets/' + userId)).then(function(budgetsSnapshot) {
            get(ref(database, 'expenses/' + userId)).then(function(expensesSnapshot) {
                updateBudgetsTable(budgetsSnapshot, expensesSnapshot);
            });
        });

        get(ref(database, 'expenses/' + userId)).then(function(snapshot) {
            console.log('Initial expenses snapshot:', snapshot.val()); // Debugging log
            updateExpensesTable(snapshot);
            setDateRange(); // Apply date constraints once after the initial load
        });

        get(ref(database, 'income/' + userId)).then(function(snapshot) {
            updateIncomeTable(snapshot);
            setDateRange(); // Apply date constraints once after the initial load
        });

    } else {
        console.log('User ID not found or invalid in localStorage');
    }

    document.getElementById('sortField').addEventListener('change', renderExpensesTable);
    document.getElementById('sortOrder').addEventListener('change', renderExpensesTable);
    document.getElementById('filterField').addEventListener('change', renderExpensesTable);

});