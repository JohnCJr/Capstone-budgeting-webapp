from flask import Flask, render_template, jsonify
import plotly.graph_objs as go

app = Flask(__name__)

def compound_interest(principal, interest_rate, years):
    # Convert interest_rate from percentage to decimal
    interest_rate_decimal = interest_rate / 100.0
    
    # Initialize lists to store years and corresponding amounts
    years_list = list(range(years + 1))
    amount_list = [principal * (1 + interest_rate_decimal) ** year for year in years_list]
    
    # Calculate interest earned
    interest_earned = [amount - principal for amount in amount_list]
    
    return years_list, amount_list, interest_earned

@app.route('/')
def index():
    # Request user inputs
    principal = 1000  # Initial principal amount
    interest_rate = 10  # Annual interest rate (in percentage)
    years = 10  # Number of years

    # Calculate compound interest
    years_list, amount_list, interest_earned = compound_interest(principal, interest_rate, years)

    # Create Plotly figure
    fig = go.Figure()
    fig.add_trace(go.Scatter(x=years_list, y=amount_list, mode='lines+markers', name='Total Amount'))
    fig.add_trace(go.Scatter(x=years_list, y=interest_earned, mode='lines+markers', name='Interest Earned'))
    fig.update_layout(title='Compound Interest Growth Over Time', xaxis_title='Years', yaxis_title='Amount')

    # Convert Plotly figure to JSON
    graph_json = fig.to_json()

    print("JSON data:", graph_json)  # Debug print

    return render_template('index.html', graph_json=graph_json)

if __name__ == '__main__':
    app.run(debug=True)
