// populates the tables based on firebase data. updates firebase database based on user input. 

import { database, ref, update, remove, onValue, get } from "./initialize-firebase.js"; // Adjust the path if necessary
import { sanitize } from './sanitizeStrings.js'; // Import the sanitize function

document.addEventListener('DOMContentLoaded', function() {
    let expensesData = []; // will store expense data keys

    // formats the date to YYYY-MM-DD to be used to set date range
    function formatDateToYYYYMMDD(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Set range for users to select a date in a one month range
    function setDateRange() {
        const dateBoxes = document.querySelectorAll(".date-field");
    
        const today = new Date();
        const todayFormatted = formatDateToYYYYMMDD(today);
    
        dateBoxes.forEach(field => {
            let dateValue = new Date(field.value);  // creates new date out of the value in the input field

            // if the field value is not a valid date it defaults to today's date
            if (isNaN(dateValue.getTime())) {
                dateValue = today;
            }
    
            const startOfMonth = new Date(dateValue.getFullYear(), dateValue.getMonth(), 1);
            const endOfMonth = new Date(dateValue.getFullYear(), dateValue.getMonth() + 1, 0);
    
            const startOfMonthFormatted = formatDateToYYYYMMDD(startOfMonth);
            const endOfMonthFormatted = formatDateToYYYYMMDD(endOfMonth);

            // checks if the date value fot eh input field is with the current month of the current year,
            // if so then the max range is set to the current date so the user can select past the current date.
            // Otherwise the range is within the month that the income/expnese was created
            if (dateValue.getFullYear() === today.getFullYear() && dateValue.getMonth() === today.getMonth()) {
                // If the date is in the current month, set the max to today's date
                field.setAttribute('max', todayFormatted);
                field.setAttribute('min', startOfMonthFormatted);
            } else {
                // Otherwise, set the range within the month of the date
                field.setAttribute('max', endOfMonthFormatted);
                field.setAttribute('min', startOfMonthFormatted);
            }
        });
    }

    // formats date to MM/DD/YYYY to be displayed to the user and sent to Firebase
    function getFormattedDate(date) {
        const [year, month, day] = date.split('-');
        const d = new Date(year, month - 1, day);
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const yyyy = d.getFullYear();
        return mm + '/' + dd + '/' + yyyy;
    }

    // gets the start and end dates, start day is considered a Monday and end day is Sunday
    function getStartAndEndOfWeek(date) {
        const dayOfWeek = date.getDay();
        const startOfWeek = new Date(date);

        // adjusts start of the week to the nearest Monday
        startOfWeek.setDate(date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));   // accounts for the current day being a sunday, makes sure that the correct Monday is assigned, from six days ago
        startOfWeek.setHours(0, 0, 0, 0); // ensures the time is set to the beginning of the day at the very first second

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);   // sets to Sudnat
        endOfWeek.setHours(23, 59, 59, 999); // ensures the time is set to the end of the day up to the last second

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

    // Reformats date to a JS Date variable and checks if it contains a month, day, and year
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

    // Checks if a date falls within a range
    function isWithinDateRange(date, startDate, endDate) {
        const d = new Date(date);
        return d >= startDate && d <= endDate;
    }

    // Updates budget table, needs expense table to calculate if under or over budget for each category and total
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

        const selectedValue = budgetData.budgetType || "weekly"; // Get the budget type from the snapshot, defaults to weekly
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

        totalSpent = parseFloat(totalSpent.toFixed(2)); // sets totalSpent to 2 decimal places to avoid trailing floating point numbers

        // adds color style based on whether user is over or under budget 
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

    // 
    function updateExpensesTable(snapshot) {
        expensesData = []; // clears expense data keys
        snapshot.forEach(function(childSnapshot) {
            let data = childSnapshot.val();
            data.key = childSnapshot.key;   // adds key variable and value to data object
            expensesData.push(data);    // adds the data object with the key variable to the expensesData array
        });
        renderExpensesTable();
        setDateRange(); // adds listener to date fields once the table is rendered
    }

    // renders table based on filter, sort, and oder selection made by user  
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

        // so long as the sort by selection isn't all, the table will toggle between ascedning and descending order based on user selection
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

            currentTotalExpense += parseFloat(data.amount); // calculates total amount spent for all data currently displayed

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

        currentTotalExpense = parseFloat(currentTotalExpense.toFixed(2)); // Rounds total expense to 2 decimal places

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
        incomeTableBody.innerHTML = ''; // clear previous table body data
        let incomeTableFoot = document.getElementById('incomeTableFoot');
        incomeTableFoot.innerHTML = ''; // clears previous table foot data
        let currentTotalIncome = 0;

        snapshot.forEach(function(childSnapshot) {
            let key = childSnapshot.key; // Get the unique key for the row
            let data = childSnapshot.val();
            let sanitizedDate = sanitize(data.date || new Date().toISOString().split("T")[0]);
            let sanitizedDescription = sanitize(data.description || 'undefined');
            let sanitizedType = capitalize(sanitize(data.type || 'undefined').toLowerCase());
            let sanitizedAmount = parseFloat(sanitize(data.amount || 'undefined')).toFixed(2);
            currentTotalIncome += parseFloat(sanitizedAmount);

            // adjusts value to dipslay to the user 
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

        currentTotalIncome = parseFloat(currentTotalIncome.toFixed(2)); // rounds total income to 2 decimal places

        let editRowFoot = document.createElement('tr');
        editRowFoot.classList.add("table-primary");
        editRowFoot.innerHTML = `<th>Total:</th>
                                 <td class='empty-td'></td>
                                 <td class='empty-td'></td>
                                 <td data-label='Income:'>$${currentTotalIncome.toFixed(2)}</td>`;
        incomeTableFoot.appendChild(editRowFoot);

        // applies date range to all date fields
        setDateRange();
    }

    // used to prevent issue with characters like ' being taken as direct HTML code and interfering 
    // with the edit buttons in the expense and income tables when the description contains these characters
    function decodeHTMLEntities(text) {
        const textArea = document.createElement('textarea');
        textArea.innerHTML = text;
        return textArea.value;
    }

    // capitalizes words
    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // used to populate input fields when edit button is clicked for expense and income table,
    // disables other buttons in that table until change confirmed or cancelled
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
            const dateValue = new Date(data[0]);    // local timezone Date
            const offset = dateValue.getTimezoneOffset();  
            dateValue.setMinutes(dateValue.getMinutes() - offset);  // subtracts offset to give UTC time
            // converts Date to string 
            console.log('date of: ' + dateValue.toISOString().split("T")[0]);
            document.getElementById(`edit-date-${key}`).value = dateValue.toISOString().split("T")[0] || new Date().toISOString().split("T")[0];
            document.getElementById(`edit-description-${key}`).value = decodeHTMLEntities(data[1]); // prevent issues with cetain characters being read as HTML code
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

    // hides edit fields and enables the other edit buttons in the table
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

    // sends expense changes to Firebase
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
                })
                .catch((error) => {
                    console.error('Error updating expense:', error);
                });
            cancelEdit(key, 'expense');
        } else {
            console.log('Cannot edit expense: invalid userId');
        }
    };

    // sends income changes to Firebase
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

    // popup appears asking to confirm deletion for income or expense
    window.confirmDelete = function(type, key) {
        if (confirm("Are you sure you want to delete this item?")) {
            if (type === 'expense') {
                deleteExpense(key);
            } else if (type === 'income') {
                deleteIncome(key);
            }
        }
    };

    // deletes the expense data from Firebase
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

    // deletes the income data from Firebase
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

    let userId = localStorage.getItem('userId');    // Verifies that user is logged in before populating tables with data

    if (userId !== '0') {
        // shows spinners initially while budgte table data is being gathered
        document.getElementById('budgetsTableBody').innerHTML = `<tr><td colspan="4" class="text-center"><div class="spinner-border text-success" role="status"></div></td></tr>`;
        
        
        // listeners upon change to Firebase to update tables
        onValue(ref(database, 'budgets/' + userId), function(budgetsSnapshot) {
            get(ref(database, 'expenses/' + userId)).then(function(expensesSnapshot) {
                updateBudgetsTable(budgetsSnapshot, expensesSnapshot);
            });
        });

        onValue(ref(database, 'expenses/' + userId), function(snapshot) {
            updateExpensesTable(snapshot);
            get(ref(database, 'budgets/' + userId)).then(function(budgetsSnapshot) {
                updateBudgetsTable(budgetsSnapshot, snapshot); // Update budgets table as well whenever expenses change
            });
        });

        onValue(ref(database, 'income/' + userId), function(snapshot) {
            updateIncomeTable(snapshot);
        });

        // initial calls to populate tables
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

    // listeners for filter, order, and sort buttons in expense table
    document.getElementById('sortField').addEventListener('change', renderExpensesTable);
    document.getElementById('sortOrder').addEventListener('change', renderExpensesTable);
    document.getElementById('filterField').addEventListener('change', renderExpensesTable);

});