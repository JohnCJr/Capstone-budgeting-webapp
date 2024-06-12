let registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const loginMessageElement = document.getElementById('loginMessage');

    const user = registeredUsers.find(user => user.username === username && user.password === password);

    if (user) {
        loginMessageElement.textContent = 'Login successful!';
        loginMessageElement.style.color = 'green';

        document.getElementById('loginForm').reset();
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('expenseContainer').style.display = 'block';
    } else {
        loginMessageElement.textContent = 'Invalid username or password.';
        loginMessageElement.style.color = 'red';
    }
});

document.getElementById('expenseForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const expenseName = document.getElementById('expenseName').value;
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;

    const expense = {
        id: Date.now(),
        expenseName: expenseName,
        amount: amount,
        category: category
    };

    addExpenseToList(expense);
    document.getElementById('expenseForm').reset();
});

function addExpenseToList(expense) {
    const expenseList = document.getElementById('expenseList');
    const listItem = document.createElement('li');
    listItem.id = expense.id;

    listItem.innerHTML = `
        <span>${expense.expenseName} - $${expense.amount} (${expense.category})</span>
        <div class="expense-actions">
            <button class="edit" onclick="editExpense(${expense.id})">Edit</button>
            <button onclick="deleteExpense(${expense.id})">Delete</button>
        </div>
    `;

    expenseList.appendChild(listItem);
}

function deleteExpense(id) {
    const expenseItem = document.getElementById(id);
    if (expenseItem) {
        expenseItem.remove();
    }
}

function editExpense(id) {
    const expenseItem = document.getElementById(id);
    if (expenseItem) {
        const expenseName = prompt('Edit Expense Name:', expenseItem.querySelector('span').textContent.split(' - ')[0]);
        const amount = prompt('Edit Amount:', expenseItem.querySelector('span').textContent.split(' - $')[1].split(' (')[0]);
        const category = prompt('Edit Category:', expenseItem.querySelector('span').textContent.split('(')[1].split(')')[0]);

        if (expenseName && amount && category) {
            expenseItem.querySelector('span').textContent = `${expenseName} - $${amount} (${category})`;
        }
    }
}
