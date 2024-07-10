document.addEventListener('DOMContentLoaded', function () {
    const budgetForm = document.getElementById('budgetForm');
    const budgetResult = document.getElementById('budgetResult');
  
    budgetForm.addEventListener('submit', function (event) {
      event.preventDefault();
  
      const income = parseFloat(document.getElementById('income').value);
      const expenses = parseFloat(document.getElementById('expenses').value);
  
      // Validate inputs
      if (isNaN(income) || isNaN(expenses) || income < 0 || expenses < 0) {
        budgetResult.textContent = 'Please enter valid, non-negative numbers for income and expenses.';
        return;
      }
  
      // Calculate balance
      const balance = income - expenses;
  
      // Detailed budget breakdown
      const needsPercentage = 0.50;
      const wantsPercentage = 0.30;
      const savingsPercentage = 0.20;
      const needs = income * needsPercentage;
      const wants = income * wantsPercentage;
      const savings = income * savingsPercentage;
  
      // Format number to currency
      function formatCurrency(amount) {
        return amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
      }
  
      // Determine suggestion based on balance
      let suggestion = '';
      if (balance > 0) {
        suggestion = 'Great job! You have a surplus in your budget.';
      } else if (balance < 0) {
        suggestion = 'You have a deficit in your budget. Consider reducing your expenses or increasing your income.';
      } else {
        suggestion = 'Your budget is balanced. Keep up the good work!';
      }
  
      // Display results
      budgetResult.innerHTML = `
        <p>Your budget balance is: $${formatCurrency(balance)}</p>
        <p>Suggested Budget Breakdown:</p>
        <ul>
          <li>Needs (50%): $${formatCurrency(needs)}</li>
          <li>Wants (30%): $${formatCurrency(wants)}</li>
          <li>Savings (20%): $${formatCurrency(savings)}</li>
        </ul>
        <p>${suggestion}</p>
      `;
    });
  });
  