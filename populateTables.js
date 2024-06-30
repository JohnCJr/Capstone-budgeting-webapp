// Will populate the tables based on firebase data, must test first, 
// commented out portion in the dashboard.html for now

import { database, ref, update, remove, onValue, get } from "./initialize-firebase.js"; // Adjust the path if necessary
import { sanitize } from './sanitizeStrings.js'; // Import the sanitize function

document.addEventListener('DOMContentLoaded', function() {
    let expensesData = [];

    // Function to set date range for date input fields
    function formatDateToYYYYMMDD(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    function setDateRange() {
        const dateBoxes = document.querySelectorAll(".date-field");
    
        const today = new Date();
    
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfMonthFormatted = formatDateToYYYYMMDD(startOfMonth);
    
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const endOfMonthFormatted = formatDateToYYYYMMDD(endOfMonth);
    
        const todayFormatted = formatDateToYYYYMMDD(today);
    
        dateBoxes.forEach(field => {
            field.setAttribute('max', endOfMonthFormatted);
            field.setAttribute('min', startOfMonthFormatted);
            field.value = todayFormatted;
        });
    }

    function getFormattedDate(date) {
        const [year, month, day] = date.split('-');
        const d = new Date(year, month - 1, day);
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const yyyy = d.getFullYear();
        return mm + '/' + dd + '/' + yyyy;
    }

    function getStartAndEndOfWeek(date) {
        const dayOfWeek = date.getDay();
        const startOfWeek = new Date(date);
    
        // Adjust to the nearest Monday
        startOfWeek.setDate(date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
        startOfWeek.setHours(0, 0, 0, 0); // Ensure time is set to the beginning of the day
    
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999); // Ensure time is set to the end of the day
    
        return [startOfWeek, endOfWeek];
    }

    function getStartAndEndOfMonth(date) {
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        return [startOfMonth, endOfMonth];
    }

    function getStartAndEndOfYear(date) {
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const endOfYear = new Date(date.getFullYear(), 11, 31);
        return [startOfYear, endOfYear];
    }

    function parseDate(dateStr) {
        if (!dateStr) {
            console.error('Date string is undefined or null');
            return null;
        }
        const [month, day, year] = dateStr.split('/');
        if (!month || !day || !year) {
            console.error('Date string is invalid:', dateStr);
            return null;
        }
        return new Date(year, month - 1, day);
    }
    
    function isWithinDateRange(date, startDate, endDate) {
        const d = new Date(date);
        return d >= startDate && d <= endDate;
    }

    function updateBudgetsTable(budgetsSnapshot, expensesSnapshot) {
        let budgetsTableBody = document.getElementById('budgetsTableBody');
        let budgetsTableFoot = document.getElementById('budgetsTableFoot');
        budgetsTableFoot.innerHTML = ''; 
        budgetsTableBody.innerHTML = ''; // Clear previous data
    
        const categories = ['entertainment', 'food', 'utility', 'other'];
    
        let budgetData = budgetsSnapshot.val() || {};
        let expenseData = expensesSnapshot.val() || {};
        let totalSpent = 0;
        let statusColor = 'black';
    
        const selectedValue = budgetData.budgetType || "weekly"; // Get the budget type from the snapshot
        const today = new Date();
        let startDate, endDate;
    
        console.log("selected value: " + selectedValue);
    
        if (selectedValue === "weekly") {
            [startDate, endDate] = getStartAndEndOfWeek(today);
        } else if (selectedValue === "monthly") {
            [startDate, endDate] = getStartAndEndOfMonth(today);
        } else if (selectedValue === "yearly") {
            [startDate, endDate] = getStartAndEndOfYear(today);
        }
    
        categories.forEach(category => {
            let budgetAmount = parseFloat(budgetData[category]) || 0;
            let spentAmount = 0;

            if (expenseData) {
                Object.values(expenseData).forEach(expense => {
                    const expenseDate = parseDate(expense.date);
                    console.log("expense: " + (expense.description) + " date: " + (expenseDate));
                    if (!expenseDate) {
                        console.error('Skipping invalid date for expense:', expense);
                        return;
                    }
                    if (expense.category.toLowerCase() === category && isWithinDateRange(expenseDate, startDate, endDate)) {
                        spentAmount += parseFloat(expense.amount);
                    }
                });
            }
    
            if (spentAmount > budgetAmount) {
                statusColor = `style="color:red;"`;
            } else if (spentAmount === budgetAmount) {
                statusColor = `style="color:black;"`;
            } else {
                statusColor = `style="color:green;"`;
            }
    
            let remainingAmount = budgetAmount - spentAmount;
            totalSpent += spentAmount;
    
            let row = document.createElement('tr');
            row.innerHTML = `
                 <td data-label="Category">${capitalize(category)}</td>
                <td data-label="Limit">$${budgetAmount.toFixed(2)}</td>
                <td data-label="Spent">$${spentAmount.toFixed(2)}</td>
                <td data-label="Remaining" ${statusColor}>$${remainingAmount.toFixed(2)}</td>`;
            budgetsTableBody.appendChild(row);
        });
    
        totalSpent = parseFloat(totalSpent.toFixed(2)); // Round totalSpent to 2 decimal places
    
        let totalBudget = parseFloat(budgetData.total) || 0;
        if (totalBudget > totalSpent) {
            statusColor = `style="color:green;"`;
        } else if (totalBudget === totalSpent){
            statusColor = `style="color:black;"`;
        } else {
            statusColor = `style="color:red;"`;
        }
    
        let footRow = document.createElement('tr');
        footRow.classList.add("table-primary");
        footRow.innerHTML = ` <th>Total:</th>
                              <td data-label="Budget">$${totalBudget.toFixed(2)}</td>
                              <td data-label="Spent">$${totalSpent.toFixed(2)}</td>
                              <td data-label="Remaining" ${statusColor}>$${(totalBudget - totalSpent).toFixed(2)}</td>`;
        budgetsTableFoot.appendChild(footRow);
    }

    function updateExpensesTable(snapshot) {
        expensesData = [];
        snapshot.forEach(function(childSnapshot) {
            let data = childSnapshot.val();
            data.key = childSnapshot.key;
            expensesData.push(data);
        });
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

        let filteredData = expensesData.filter(expense => filterField === 'none' || expense.category.toLowerCase() === filterField);

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
            <td data-label="Date">${sanitizedDate}</td>
            <td data-label="Description">${decodeHTMLEntities(sanitizedDescription)}</td>
            <td data-label="Amount">$${parseFloat(sanitizedAmount).toFixed(2)}</td>
            <td data-label="Category">${sanitizedCategory}</td>
            <td class="table-btns col-md-1 col-sm-8 mx-sm-auto mx-0 col-12">
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
                <td class="table-btns col-md-1 col-sm-8 mx-sm-auto mx-0 col-12">
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
                                 <td class='empty-td'></td>
                                 <td data-label="Expenses:">$${currentTotalExpense.toFixed(2)}</td>
                                 <td class='empty-td'></td>`;
        expensesTableFoot.appendChild(editRowFoot);
    }

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
            let sanitizedAmount = parseFloat(sanitize(data.amount || 'undefined')).toFixed(2);
            currentTotalIncome += parseFloat(sanitizedAmount);

            if (sanitizedType === "Biweekly") {sanitizedType = "Bi-weekly";}
            if (sanitizedType === "Once") {sanitizedType = "One-time";}

            let row = document.createElement('tr');
            row.innerHTML = `
                <td data-label="Date">${sanitizedDate}</td>
                <td data-label="Description">${sanitizedDescription}</td>
                <td data-label="Type">${sanitizedType}</td>
                <td data-label="Amount">$${sanitizedAmount}</td>
                <td class="table-btns col-md-1 col-sm-8 mx-sm-auto mx-0 col-12">
                    <div class="btn-group" role="group">
                        <button class="btn btn-secondary income-edit-btn" onclick='showEditRow("income", "${key}", ${JSON.stringify(sanitizedDate)}, ${JSON.stringify(decodeHTMLEntities(sanitizedDescription))}, ${JSON.stringify(sanitizedType)}, ${JSON.stringify(sanitizedAmount)})'>Edit</button>
                        <button class="btn btn-danger income-delete-btn" onclick="confirmDelete('income', '${key}')">Delete</button>
                    </div>
                </td>`;
            incomeTableBody.appendChild(row);

            let editRow = document.createElement('tr');
            editRow.classList.add('edit-row', 'd-none');
            editRow.id = `edit-row-${key}`;
            editRow.innerHTML = `
                <td>
                    <input type="date" class="date-field form-control" id="edit-date-${key}" value="${sanitizedDate}" required>
                </td>
                <td>
                    <input type="text" class="form-control" id="edit-description-${key}" value="${decodeHTMLEntities(sanitizedDescription)}" required>
                </td>
                <td>
                    <select class="form-select form-select-md" id="edit-type-${key}" aria-label="Small type select" required>
                        <option value="weekly" ${sanitizedType.toLowerCase() === 'weekly' ? 'selected' : ''}>Weekly</option>
                        <option value="bi-weekly" ${sanitizedType.toLowerCase() === 'bi-weekly' ? 'selected' : ''}>Bi-weekly</option>
                        <option value="monthly" ${sanitizedType.toLowerCase() === 'monthly' ? 'selected' : ''}>Monthly</option>
                        <option value="one-time" ${sanitizedType.toLowerCase() === 'one-time' ? 'selected' : ''}>One-time</option>
                    </select>
                </td>
                <td>
                    <input type="text" class="money-field form-control" id="edit-amount-${key}" value="${sanitizedAmount}" required>
                </td>
                <td class="table-btns col-md-1 col-sm-8 mx-sm-auto mx-0 col-12">
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
                                 <td class='empty-td'></td>
                                 <td class='empty-td'></td>
                                 <td data-label='Income:'>$${currentTotalIncome.toFixed(2)}</td>`;
        incomeTableFoot.appendChild(editRowFoot);

        // Apply date range to all date fields
        setDateRange();
    }

    function decodeHTMLEntities(text) {
        const textArea = document.createElement('textarea');
        textArea.innerHTML = text;
        return textArea.value;
    }

    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    window.showEditRow = function(type, key, ...data) {
        const editRow = document.getElementById(`edit-row-${key}`);
        editRow.classList.remove('d-none');
        const buttons = document.querySelectorAll(`.${type}-edit-btn, .${type}-delete-btn`);
        buttons.forEach(button => {
            button.disabled = true;
        });
        editRow.querySelectorAll('button').forEach(button => {
            button.disabled = false;
        });
        if (type === 'expense') {
            const dateValue = new Date(data[0]);
            const offset = dateValue.getTimezoneOffset();
            dateValue.setMinutes(dateValue.getMinutes() - offset);
            document.getElementById(`edit-date-${key}`).value = dateValue.toISOString().split("T")[0] || new Date().toISOString().split("T")[0];
            document.getElementById(`edit-description-${key}`).value = decodeHTMLEntities(data[1]);
            document.getElementById(`edit-amount-${key}`).value = data[2];
            document.getElementById(`edit-category-${key}`).value = data[3].toLowerCase();
        } else if (type === 'income') {
            const dateValue = new Date(data[0]);
            const offset = dateValue.getTimezoneOffset();
            dateValue.setMinutes(dateValue.getMinutes() - offset);
            document.getElementById(`edit-date-${key}`).value = dateValue.toISOString().split("T")[0] || new Date().toISOString().split("T")[0];
            document.getElementById(`edit-description-${key}`).value = decodeHTMLEntities(data[1]);
            document.getElementById(`edit-type-${key}`).value = data[2].toLowerCase();
            document.getElementById(`edit-amount-${key}`).value = data[3];
        }
        if (window.getFormValidationShared) {
            window.getFormValidationShared();
        }
        setDateRange();
    };

    window.cancelEdit = function(key, type) {
        const editRow = document.getElementById(`edit-row-${key}`);
        editRow.classList.add('d-none');
        editRow.querySelectorAll('input').forEach(input => {
            input.value = '';
        });
        const buttons = document.querySelectorAll(`.${type}-edit-btn, .${type}-delete-btn`);
        buttons.forEach(button => {
            button.disabled = false;
        });
    };

    window.confirmEditExpense = function(key) {
        let userId = localStorage.getItem('userId');
        if (userId !== '0') {
            let updatedData = {
                date: getFormattedDate(document.getElementById(`edit-date-${key}`).value),
                description: sanitize(document.getElementById(`edit-description-${key}`).value),
                amount: sanitize(document.getElementById(`edit-amount-${key}`).value),
                category: sanitize(document.getElementById(`edit-category-${key}`).value)
            };
            update(ref(database, 'expenses/' + userId + '/' + key), updatedData)
                .then(() => {
                    console.log('Expense updated successfully');
                    get(ref(database, 'budgets/' + userId)).then(function(budgetsSnapshot) {
                        get(ref(database, 'expenses/' + userId)).then(function(expensesSnapshot) {
                            updateBudgetsTable(budgetsSnapshot, expensesSnapshot);
                        });
                    });
                })
                .catch((error) => {
                    console.error('Error updating expense:', error);
                });
            cancelEdit(key, 'expense');
        } else {
            console.log('Cannot edit expense: invalid userId');
        }
    };

    window.confirmEditIncome = function(key) {
        let userId = localStorage.getItem('userId');
        if (userId !== '0') {
            let updatedData = {
                date: getFormattedDate(document.getElementById(`edit-date-${key}`).value),
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
            cancelEdit(key, 'income');
        } else {
            console.log('Cannot edit income: invalid userId');
        }
    };

    window.confirmDelete = function(type, key) {
        if (confirm("Are you sure you want to delete this item?")) {
            if (type === 'expense') {
                deleteExpense(key);
            } else if (type === 'income') {
                deleteIncome(key);
            }
        }
    };

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

    let userId = localStorage.getItem('userId');

    if (userId !== '0') {
        onValue(ref(database, 'budgets/' + userId), function(budgetsSnapshot) {
            get(ref(database, 'expenses/' + userId)).then(function(expensesSnapshot) {
                updateBudgetsTable(budgetsSnapshot, expensesSnapshot);
            });
        });

        onValue(ref(database, 'expenses/' + userId), function(snapshot) {
            updateExpensesTable(snapshot);
        });

        onValue(ref(database, 'income/' + userId), function(snapshot) {
            updateIncomeTable(snapshot);
        });

        get(ref(database, 'budgets/' + userId)).then(function(budgetsSnapshot) {
            get(ref(database, 'expenses/' + userId)).then(function(expensesSnapshot) {
                updateBudgetsTable(budgetsSnapshot, expensesSnapshot);
            });
        });

        get(ref(database, 'expenses/' + userId)).then(function(snapshot) {
            updateExpensesTable(snapshot);
            setDateRange();
        });

        get(ref(database, 'income/' + userId)).then(function(snapshot) {
            updateIncomeTable(snapshot);
            setDateRange();
        });

    } else {
        console.log('User ID not found or invalid in localStorage');
    }

    document.getElementById('sortField').addEventListener('change', renderExpensesTable);
    document.getElementById('sortOrder').addEventListener('change', renderExpensesTable);
    document.getElementById('filterField').addEventListener('change', renderExpensesTable);

});