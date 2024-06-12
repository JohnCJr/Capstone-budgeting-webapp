document.addEventListener('DOMContentLoaded', function () {
    const ctx = document.getElementById('transactionChart').getContext('2d');
    let transactionData = [1200, 1900, 3000, 500, 2000, 3000];
    const transactionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['January', 'February', 'March', 'April', 'May', 'June'],
            datasets: [{
                label: 'Transactions',
                data: transactionData,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    const pieChart1Ctx = document.getElementById('pieChart1').getContext('2d');
    let pieChart1Data = [5200, 3000];
    const pieChart1 = new Chart(pieChart1Ctx, {
        type: 'pie',
        data: {
            labels: ['Spent', 'Remaining'],
            datasets: [{
                data: pieChart1Data,
                backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)'],
                borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true
        }
    });

    const pieChart2Ctx = document.getElementById('pieChart2').getContext('2d');
    let pieChart2Data = [4500, 3700];
    const pieChart2 = new Chart(pieChart2Ctx, {
        type: 'pie',
        data: {
            labels: ['Spent', 'Remaining'],
            datasets: [{
                data: pieChart2Data,
                backgroundColor: ['rgba(255, 206, 86, 0.2)', 'rgba(75, 192, 192, 0.2)'],
                borderColor: ['rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true
        }
    });

    const pieChart3Ctx = document.getElementById('pieChart3').getContext('2d');
    let pieChart3Data = [3200, 5000];
    const pieChart3 = new Chart(pieChart3Ctx, {
        type: 'pie',
        data: {
            labels: ['Spent', 'Remaining'],
            datasets: [{
                data: pieChart3Data,
                backgroundColor: ['rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)'],
                borderColor: ['rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true
        }
    });

    const pieChart4Ctx = document.getElementById('pieChart4').getContext('2d');
    let pieChart4Data = [2100, 6100];
    const pieChart4 = new Chart(pieChart4Ctx, {
        type: 'pie',
        data: {
            labels: ['Spent', 'Remaining'],
            datasets: [{
                data: pieChart4Data,
                backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(255, 99, 132, 0.2)'],
                borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true
        }
    });

    // Expense Management
    const transactionTableBody = document.getElementById('transactionTableBody');
    const expenseForm = document.getElementById('expenseForm');
    const addExpenseBtn = document.getElementById('addExpenseBtn');
    const editExpenseBtn = document.getElementById('editExpenseBtn');
    const totalBudgetElem = document.getElementById('totalBudget');
    const totalIncomeElem = document.getElementById('totalIncome');
    const totalSpentElem = document.getElementById('totalSpent');
    const totalSavedElem = document.getElementById('totalSaved');

    let totalBudget = 8200;
    let editIndex = null;

    expenseForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const date = document.getElementById('date').value;
        const description = document.getElementById('description').value;
        const amount = parseFloat(document.getElementById('amount').value).toFixed(2);
        const category = document.getElementById('category').value;

        const expense = {
            date,
            description,
            amount,
            category
        };

        if (editIndex === null) {
            addExpense(expense);
        } else {
            updateExpense(editIndex, expense);
        }

        updateChartsAndTotals();
        expenseForm.reset();
        addExpenseBtn.style.display = 'block';
        editExpenseBtn.style.display = 'none';
        editIndex = null;
    });

    function addExpense(expense) {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${expense.date}</td>
            <td>${expense.description}</td>
            <td>$${expense.amount}</td>
            <td>${expense.category}</td>
            <td>
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </td>
        `;

        transactionTableBody.appendChild(row);
        addEventListenersToButtons();
    }

    function updateExpense(index, expense) {
        const row = transactionTableBody.children[index];

        row.children[0].textContent = expense.date;
        row.children[1].textContent = expense.description;
        row.children[2].textContent = `$${expense.amount}`;
        row.children[3].textContent = expense.category;
    }

    function deleteExpense(index) {
        transactionTableBody.children[index].remove();
        updateChartsAndTotals();
    }

    function editExpense(index) {
        const row = transactionTableBody.children[index];

        document.getElementById('date').value = row.children[0].textContent;
        document.getElementById('description').value = row.children[1].textContent;
        document.getElementById('amount').value = parseFloat(row.children[2].textContent.replace('$', ''));
        document.getElementById('category').value = row.children[3].textContent;

        addExpenseBtn.style.display = 'none';
        editExpenseBtn.style.display = 'block';

        editIndex = index;
    }

    function updateChartsAndTotals() {
        const expenseRows = transactionTableBody.getElementsByTagName('tr');
        let totalSpent = 0;

        for (let row of expenseRows) {
            totalSpent += parseFloat(row.children[2].textContent.replace('$', ''));
        }

        const incomeRows = incomeTableBody.getElementsByTagName('tr');
        let totalIncome = 0;

        for (let row of incomeRows) {
            totalIncome += parseFloat(row.children[2].textContent.replace('$', ''));
        }

        const totalSaved = totalIncome - totalSpent;

        pieChart1Data[0] = totalSpent;
        pieChart1Data[1] = totalIncome - totalSpent;

        pieChart1.update();
        // Repeat for other charts and update accordingly

        // Update DOM elements for Total Spent, Total Saved, and Total Income
        totalSpentElem.textContent = `$${totalSpent.toFixed(2)}`;
        totalSavedElem.textContent = `$${totalSaved.toFixed(2)}`;
        totalIncomeElem.textContent = `$${totalIncome.toFixed(2)}`;
    }

    function addEventListenersToButtons() {
        const editButtons = document.querySelectorAll('.edit-btn');
        const deleteButtons = document.querySelectorAll('.delete-btn');

        editButtons.forEach((btn, index) => {
            btn.removeEventListener('click', () => editExpense(index));
            btn.addEventListener('click', () => editExpense(index));
        });

        deleteButtons.forEach((btn, index) => {
            btn.removeEventListener('click', () => deleteExpense(index));
            btn.addEventListener('click', () => deleteExpense(index));
        });
    }

    addEventListenersToButtons();

    // Income Management
    const incomeTableBody = document.getElementById('incomeTableBody');
    const incomeForm = document.getElementById('incomeForm');
    const addIncomeBtn = document.getElementById('addIncomeBtn');
    const editIncomeBtn = document.getElementById('editIncomeBtn');
    let editIncomeIndex = null;

    incomeForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const date = document.getElementById('incomeDate').value;
        const description = document.getElementById('incomeDescription').value;
        const amount = parseFloat(document.getElementById('incomeAmount').value).toFixed(2);
        const category = document.getElementById('incomeCategory').value;

        const income = {
            date,
            description,
            amount,
            category
        };

        if (editIncomeIndex === null) {
            addIncome(income);
        } else {
            updateIncome(editIncomeIndex, income);
        }

        updateChartsAndTotals();
        incomeForm.reset();
        addIncomeBtn.style.display = 'block';
        editIncomeBtn.style.display = 'none';
        editIncomeIndex = null;
    });

    function addIncome(income) {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${income.date}</td>
            <td>${income.description}</td>
            <td>$${income.amount}</td>
            <td>${income.category}</td>
            <td>
                <button class="edit-income-btn">Edit</button>
                <button class="delete-income-btn">Delete</button>
            </td>
        `;

        incomeTableBody.appendChild(row);
        addEventListenersToIncomeButtons();
    }

    function updateIncome(index, income) {
        const row = incomeTableBody.children[index];

        row.children[0].textContent = income.date;
        row.children[1].textContent = income.description;
        row.children[2].textContent = `$${income.amount}`;
        row.children[3].textContent = income.category;
    }

    function deleteIncome(index) {
        incomeTableBody.children[index].remove();
        updateChartsAndTotals();
    }

    function editIncome(index) {
        const row = incomeTableBody.children[index];

        document.getElementById('incomeDate').value = row.children[0].textContent;
        document.getElementById('incomeDescription').value = row.children[1].textContent;
        document.getElementById('incomeAmount').value = parseFloat(row.children[2].textContent.replace('$', ''));
        document.getElementById('incomeCategory').value = row.children[3].textContent;

        addIncomeBtn.style.display = 'none';
        editIncomeBtn.style.display = 'block';

        editIncomeIndex = index;
    }

    function addEventListenersToIncomeButtons() {
        const editIncomeButtons = document.querySelectorAll('.edit-income-btn');
        const deleteIncomeButtons = document.querySelectorAll('.delete-income-btn');

        editIncomeButtons.forEach((btn, index) => {
            btn.removeEventListener('click', () => editIncome(index));
            btn.addEventListener('click', () => editIncome(index));
        });

        deleteIncomeButtons.forEach((btn, index) => {
            btn.removeEventListener('click', () => deleteIncome(index));
            btn.addEventListener('click', () => deleteIncome(index));
        });
    }

    addEventListenersToIncomeButtons();

    // Language Switching
    const languageSelect = document.getElementById('languageSelect');

    const translations = {
        en: {
            budgetTrackerTitle: "Budget Tracker",
            dashboardLink: "Dashboard",
            transactionsLink: "Transactions",
            cardsLink: "Cards",
            bankAccountsLink: "Bank Accounts",
            analyticsLink: "Analytics",
            settingsLink: "Settings",
            mainTitle: "Project Expense Tracking Software",
            totalBudgetTitle: "Total Budget",
            totalIncomeTitle: "Total Income",
            totalSpentTitle: "Total Spent",
            totalSavedTitle: "Total Saved",
            latestTransactionsTitle: "Latest Transactions",
            dateHeader: "Date",
            descriptionHeader: "Description",
            amountHeader: "Amount",
            categoryHeader: "Category",
            actionsHeader: "Actions",
            addEditExpenseTitle: "Add/Edit Expense",
            dateLabel: "Date:",
            descriptionLabel: "Description:",
            amountLabel: "Amount:",
            categoryLabel: "Category:",
            addExpenseBtn: "Add Expense",
            editExpenseBtn: "Edit Expense",
            addEditIncomeTitle: "Add/Edit Income",
            incomeDateLabel: "Date:",
            incomeDescriptionLabel: "Description:",
            incomeAmountLabel: "Amount:",
            incomeCategoryLabel: "Category:",
            addIncomeBtn: "Add Income",
            editIncomeBtn: "Edit Income",
            latestIncomesTitle: "Latest Incomes",
            incomeDateHeader: "Date",
            incomeDescriptionHeader: "Description",
            incomeAmountHeader: "Amount",
            incomeCategoryHeader: "Category",
            incomeActionsHeader: "Actions"
        },
        es: {
            budgetTrackerTitle: "Rastreador de Presupuesto",
            dashboardLink: "Tablero",
            transactionsLink: "Transacciones",
            cardsLink: "Tarjetas",
            bankAccountsLink: "Cuentas Bancarias",
            analyticsLink: "Analíticas",
            settingsLink: "Configuraciones",
            mainTitle: "Software de Seguimiento de Gastos del Proyecto",
            totalBudgetTitle: "Presupuesto Total",
            totalIncomeTitle: "Ingresos Totales",
            totalSpentTitle: "Total Gastado",
            totalSavedTitle: "Total Ahorrado",
            latestTransactionsTitle: "Últimas Transacciones",
            dateHeader: "Fecha",
            descriptionHeader: "Descripción",
            amountHeader: "Monto",
            categoryHeader: "Categoría",
            actionsHeader: "Acciones",
            addEditExpenseTitle: "Agregar/Editar Gasto",
            dateLabel: "Fecha:",
            descriptionLabel: "Descripción:",
            amountLabel: "Monto:",
            categoryLabel: "Categoría:",
            addExpenseBtn: "Agregar Gasto",
            editExpenseBtn: "Editar Gasto",
            addEditIncomeTitle: "Agregar/Editar Ingreso",
            incomeDateLabel: "Fecha:",
            incomeDescriptionLabel: "Descripción:",
            incomeAmountLabel: "Monto:",
            incomeCategoryLabel: "Categoría:",
            addIncomeBtn: "Agregar Ingreso",
            editIncomeBtn: "Editar Ingreso",
            latestIncomesTitle: "Últimos Ingresos",
            incomeDateHeader: "Fecha",
            incomeDescriptionHeader: "Descripción",
            incomeAmountHeader: "Monto",
            incomeCategoryHeader: "Categoría",
            incomeActionsHeader: "Acciones"
        }
    };

    languageSelect.addEventListener('change', function() {
        const selectedLanguage = languageSelect.value;
        const elementsToTranslate = document.querySelectorAll("[id]");

        elementsToTranslate.forEach(element => {
            const translationKey = element.id;
            if (translations[selectedLanguage][translationKey]) {
                element.textContent = translations[selectedLanguage][translationKey];
            }
        });
    });
});
