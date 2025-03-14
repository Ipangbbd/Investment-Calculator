// Global variables
let selectedCurrency = '$';
let contributionType = 'none';
let depositTiming = 'end';
let withdrawalTiming = 'end';
let breakdownType = 'monthly';
let viewType = 'table';

// varbs consts
const currencyBtns = document.querySelectorAll('.currency-btn');
const currencySymbol = document.getElementById('currency-symbol');
const currencySymbolDeposit = document.getElementById('currency-symbol-deposit');
const currencySymbolWithdrawal = document.getElementById('currency-symbol-withdrawal');
const contributionBtns = document.querySelectorAll('.additional-btn');
const depositSection = document.getElementById('deposit-section');
const withdrawalSection = document.getElementById('withdrawal-section');
const depositTimingBtns = document.querySelectorAll('.deposit-timing-btn');
const breakdownToggleBtns = document.querySelectorAll('.breakdown-toggle-btn');
const viewToggleBtns = document.querySelectorAll('.view-toggle-btn');
const calculateBtn = document.getElementById('calculate-btn');

// Initialize event listeners
function initEventListeners() {
    // Currency selection
    currencyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currencyBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedCurrency = btn.dataset.currency;
            currencySymbol.textContent = selectedCurrency;
            currencySymbolDeposit.textContent = selectedCurrency;
            currencySymbolWithdrawal.textContent = selectedCurrency;
        });
    });

    // Contribution type selection
    contributionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            contributionBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            contributionType = btn.dataset.contribution;

            // Show/hide deposit and withdrawal sections
            depositSection.classList.add('hidden');
            withdrawalSection.classList.add('hidden');

            if (contributionType === 'deposits' || contributionType === 'both') {
                depositSection.classList.remove('hidden');
            }

            if (contributionType === 'withdrawals' || contributionType === 'both') {
                withdrawalSection.classList.remove('hidden');
            }
        });
    });

    // Deposit timing selection
    depositTimingBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const timingType = btn.parentElement.classList.contains('deposit-timing') ? 'deposit' : 'withdrawal';
            const timingBtns = document.querySelectorAll(`.${timingType}-timing .deposit-timing-btn`);

            timingBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (timingType === 'deposit') {
                depositTiming = btn.dataset.timing;
            } else {
                withdrawalTiming = btn.dataset.timing;
            }
        });
    });

    // Breakdown toggle
    breakdownToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            breakdownToggleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            breakdownType = btn.dataset.breakdown;
            document.querySelector('h3').textContent =
                breakdownType.charAt(0).toUpperCase() + breakdownType.slice(1) + ' breakdown';
            calculateInvestment();
        });
    });

    // View toggle
    viewToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            viewToggleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            viewType = btn.dataset.view;

            // Show/hide views
            document.getElementById('breakdown-table').classList.add('hidden');
            document.getElementById('breakdown-chart').classList.add('hidden');
            document.getElementById('breakdown-summary').classList.add('hidden');

            document.getElementById(`breakdown-${viewType}`).classList.remove('hidden');
        });
    });

    // Calculate button
    calculateBtn.addEventListener('click', calculateInvestment);

    // Years and months change
    document.getElementById('years').addEventListener('input', updateProjectionYears);
    document.getElementById('months').addEventListener('input', updateProjectionYears);
}

// Update projection years text
function updateProjectionYears() {
    const years = parseInt(document.getElementById('years').value) || 0;
    const months = parseInt(document.getElementById('months').value) || 0;

    let projectionText = '';
    if (years > 0 && months > 0) {
        projectionText = `${years} year${years > 1 ? 's' : ''} and ${months} month${months > 1 ? 's' : ''}`;
    } else if (years > 0) {
        projectionText = `${years} year${years > 1 ? 's' : ''}`;
    } else if (months > 0) {
        projectionText = `${months} month${months > 1 ? 's' : ''}`;
    } else {
        projectionText = '0 months';
    }

    document.getElementById('projection-years').textContent = projectionText;
}

// Calculate investment function
function calculateInvestment() {
    // Get input values
    const initialInvestment = parseFloat(document.getElementById('initial-investment').value) || 0;
    const interestRate = parseFloat(document.getElementById('interest-rate').value) || 0;
    const years = parseInt(document.getElementById('years').value) || 0;
    const months = parseInt(document.getElementById('months').value) || 0;
    const depositAmount = parseFloat(document.getElementById('deposit-amount').value) || 0;
    const depositFrequency = document.getElementById('deposit-frequency').value;
    const depositIncrease = parseFloat(document.getElementById('deposit-increase').value) || 0;
    const withdrawalAmount = parseFloat(document.getElementById('withdrawal-amount').value) || 0;
    const withdrawalFrequency = document.getElementById('withdrawal-frequency').value;
    const withdrawalIncrease = parseFloat(document.getElementById('withdrawal-increase').value) || 0;
    const compoundInterval = document.getElementById('compound-interval').value;

    // Calculate total months
    const totalMonths = years * 12 + months;

    // Determine number of compounds per year
    let compoundsPerYear = 12; // Default monthly
    if (compoundInterval === 'quarterly') compoundsPerYear = 4;
    if (compoundInterval === 'yearly') compoundsPerYear = 1;
    if (compoundInterval === 'daily') compoundsPerYear = 365;

    // Convert annual interest rate to period rate
    const periodRate = interestRate / 100 / compoundsPerYear;

    // Initialize calculation variables
    let balance = initialInvestment;
    let totalInterest = 0;
    let monthlyData = [];

    // Add initial state
    monthlyData.push({
        month: 0,
        interest: 0,
        totalInterest: 0,
        balance: balance
    });

    // Calculate for each month
    for (let month = 1; month <= totalMonths; month++) {
        // Calculate deposit for this month
        let deposit = 0;
        if ((contributionType === 'deposits' || contributionType === 'both') &&
            (depositFrequency === 'monthly' ||
                (depositFrequency === 'quarterly' && month % 3 === 0) ||
                (depositFrequency === 'yearly' && month % 12 === 0))) {

            // Apply annual increase if applicable
            const yearsPassed = Math.floor((month - 1) / 12);
            deposit = depositAmount * Math.pow(1 + depositIncrease / 100, yearsPassed);

            // Add deposit at beginning if selected
            if (depositTiming === 'beginning') {
                balance += deposit;
            }
        }

        // Calculate withdrawal for this month
        let withdrawal = 0;
        if ((contributionType === 'withdrawals' || contributionType === 'both') &&
            (withdrawalFrequency === 'monthly' ||
                (withdrawalFrequency === 'quarterly' && month % 3 === 0) ||
                (withdrawalFrequency === 'yearly' && month % 12 === 0))) {

            // Apply annual increase if applicable
            const yearsPassed = Math.floor((month - 1) / 12);
            withdrawal = withdrawalAmount * Math.pow(1 + withdrawalIncrease / 100, yearsPassed);

            // Process withdrawal at beginning if selected
            if (withdrawalTiming === 'beginning') {
                balance = Math.max(0, balance - withdrawal);
            }
        }

        // Calculate interest for this period (only if we're at a compound interval)
        let monthlyInterest = 0;
        if ((compoundInterval === 'monthly') ||
            (compoundInterval === 'quarterly' && month % 3 === 0) ||
            (compoundInterval === 'yearly' && month % 12 === 0) ||
            (compoundInterval === 'daily')) {

            // For daily compounding, we need to calculate for each day in the month
            if (compoundInterval === 'daily') {
                const daysInMonth = 30; // Approximation
                for (let day = 0; day < daysInMonth; day++) {
                    monthlyInterest += balance * (interestRate / 100 / 365);
                    balance += balance * (interestRate / 100 / 365);
                }
            } else {
                monthlyInterest = balance * periodRate;
                balance += monthlyInterest;
            }

            totalInterest += monthlyInterest;
        }

        // Add deposit/withdrawal at end if selected
        if (depositTiming === 'end' && deposit > 0) {
            balance += deposit;
        }

        if (withdrawalTiming === 'end' && withdrawal > 0) {
            balance = Math.max(0, balance - withdrawal);
        }

        // Store data for this month
        monthlyData.push({
            month: month,
            interest: monthlyInterest,
            totalInterest: totalInterest,
            balance: balance
        });
    }

    // Update UI with results
    updateResults(initialInvestment, totalInterest, balance, monthlyData);
}

// Update results in UI
function updateResults(initialInvestment, totalInterest, finalBalance, monthlyData) {
    // Format currency
    const formatCurrency = (value) => {
        return selectedCurrency + value.toFixed(2);
    };

    // Update summary values
    document.getElementById('future-value').textContent = formatCurrency(finalBalance);
    document.getElementById('interest-earned').textContent = formatCurrency(totalInterest);
    document.getElementById('initial-balance').textContent = formatCurrency(initialInvestment);

    // Update breakdown table
    const tbody = document.getElementById('breakdown-tbody');
    tbody.innerHTML = '';

    // Filter data based on breakdown type
    let filteredData = monthlyData;
    if (breakdownType === 'yearly') {
        filteredData = monthlyData.filter(item => item.month % 12 === 0);
        // Add final month if not included
        if (monthlyData.length > 0 && monthlyData[monthlyData.length - 1].month % 12 !== 0) {
            filteredData.push(monthlyData[monthlyData.length - 1]);
        }
    }

    // Populate table
    filteredData.forEach(item => {
        const row = document.createElement('tr');

        const periodCell = document.createElement('td');
        periodCell.textContent = item.month;
        row.appendChild(periodCell);

        const interestCell = document.createElement('td');
        if (item.month === 0) {
            interestCell.textContent = '-';
        } else {
            interestCell.textContent = formatCurrency(item.interest);
        }
        row.appendChild(interestCell);

        const totalInterestCell = document.createElement('td');
        if (item.month === 0) {
            totalInterestCell.textContent = '-';
        } else {
            totalInterestCell.textContent = formatCurrency(item.totalInterest);
        }
        row.appendChild(totalInterestCell);

        const balanceCell = document.createElement('td');
        balanceCell.textContent = formatCurrency(item.balance);
        row.appendChild(balanceCell);

        tbody.appendChild(row);
    });
}

// Initialize the calculator
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    updateProjectionYears();
});