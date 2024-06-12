document.addEventListener('DOMContentLoaded', function () {
    // Expense Management
    const transactionTableBody = document.getElementById('transactionTableBody');
    const expenseForm = document.getElementById('expenseForm');
    const addExpenseBtn = document.getElementById('addExpenseBtn');
    const editExpenseBtn = document.getElementById('editExpenseBtn');

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

    function addEventListenersToButtons() {
        const editButtons = document.querySelectorAll('.edit-btn');
        const deleteButtons = document.querySelectorAll('.delete-btn');

        editButtons.forEach((btn, index) => {
            btn.addEventListener('click', () => editExpense(index));
        });

        deleteButtons.forEach((btn, index) => {
            btn.addEventListener('click', () => deleteExpense(index));
        });
    }

    addEventListenersToButtons();

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
            mainTitle: "Transactions",
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
            editExpenseBtn: "Edit Expense"
        },
        es: {
            budgetTrackerTitle: "Rastreador de Presupuesto",
            dashboardLink: "Tablero",
            transactionsLink: "Transacciones",
            cardsLink: "Tarjetas",
            bankAccountsLink: "Cuentas Bancarias",
            analyticsLink: "Analíticas",
            settingsLink: "Configuraciones",
            mainTitle: "Transacciones",
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
            editExpenseBtn: "Editar Gasto"
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
