const DAY_MS = 24 * 60 * 60 * 1000;
const NATIONAL_HOLIDAYS = new Set(['01/01', '21/04', '01/05', '07/09', '12/10', '02/11', '15/11', '25/12']);

function asDate(value) {
    if (!value) return null;
    if (typeof value.toDate === 'function') return value.toDate();
    if (Number.isFinite(value.seconds)) return new Date(value.seconds * 1000);
    const parsed = value instanceof Date ? new Date(value) : new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function startOfLogicalDay(value = new Date()) {
    const date = new Date(value);
    if (date.getHours() < 5) date.setDate(date.getDate() - 1);
    date.setHours(0, 0, 0, 0);
    return date;
}

function dayNumber(date) {
    return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS);
}

function isScheduledPaymentDay(date, loan, startDate) {
    const frequency = loan.paymentFrequency || 'daily';
    const paymentDays = Array.isArray(loan.paymentDays) && loan.paymentDays.length
        ? loan.paymentDays.map(String)
        : ['1', '2', '3', '4', '5', '6'];
    const dayOfWeek = String(date.getDay());
    const dayOfMonth = String(date.getDate());

    if (frequency === 'daily') return paymentDays.includes(dayOfWeek);
    if (frequency === 'weekly') return paymentDays[0] === dayOfWeek;
    if (frequency === 'monthly') return paymentDays[0] === dayOfMonth;
    if (frequency === 'biweekly' && paymentDays[0] === dayOfWeek) {
        const elapsedDays = dayNumber(date) - dayNumber(startDate);
        return Math.floor(elapsedDays / 7) % 2 === 0;
    }
    return false;
}

function validPayments(loan) {
    return (loan.history || []).filter(payment =>
        payment.status !== 'pending_verification' &&
        payment.status !== 'rejected' &&
        payment.status !== 'postponed' &&
        payment.status !== 'skipped'
    );
}

export function calculateLoanDetails(loan, now = new Date()) {
    const details = {
        lateDays: 0,
        overdueInstallments: 0,
        lateFeesAccumulated: 0,
        fixedFineApplied: 0,
        hasFixedFine: false,
        status: 'pending',
        nextDueDate: null,
        amountDueToday: 0
    };

    if (!loan) return details;

    const totalDebt = Number(loan.totalLoan) || 0;
    const installmentAmount = Number(loan.originalInstallmentAmount || loan.amount) || 0;
    if (loan.status === 'finished' || totalDebt <= 0 || installmentAmount <= 0) {
        details.status = 'finished';
        return details;
    }

    const payments = validPayments(loan);
    const regularPayments = payments.filter(payment => payment.method !== 'migration');
    const migrationHistoryTotal = payments
        .filter(payment => payment.method === 'migration')
        .reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
    const migratedAmount = Math.max(Number(loan.initialMigratedAmount) || 0, migrationHistoryTotal);
    const historyTotal = regularPayments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
    const currentTotalPaid = Math.max(Number(loan.paid) || 0, migratedAmount + historyTotal);

    if (currentTotalPaid >= totalDebt - 0.1) {
        details.status = 'finished';
        return details;
    }

    const startDate = asDate(loan.startDate);
    if (!startDate) return details;
    startDate.setHours(0, 0, 0, 0);
    const today = startOfLogicalDay(now);

    const installmentParts = String(loan.installments || '').split('/');
    const configuredInstallments = Number.parseInt(installmentParts[1], 10);
    const totalInstallments = Number.isFinite(configuredInstallments) && configuredInstallments > 0
        ? configuredInstallments
        : Math.ceil(totalDebt / installmentAmount);

    const dueDates = [];
    const cursor = new Date(startDate);
    cursor.setDate(cursor.getDate() + 1);
    const searchLimit = new Date(today);
    searchLimit.setFullYear(searchLimit.getFullYear() + 2);

    for (let guard = 0; guard < 5000 && cursor <= searchLimit && dueDates.length < totalInstallments; guard++) {
        const holidayKey = `${String(cursor.getDate()).padStart(2, '0')}/${String(cursor.getMonth() + 1).padStart(2, '0')}`;
        if (!NATIONAL_HOLIDAYS.has(holidayKey) && isScheduledPaymentDay(cursor, loan, startDate)) {
            dueDates.push(new Date(cursor));
        }
        cursor.setDate(cursor.getDate() + 1);
    }

    const overdueDueDates = dueDates.filter(date => date < today);
    const dueToday = dueDates.some(date => date.getTime() === today.getTime());
    details.nextDueDate = dueDates.find(date => date >= today) || null;

    const expectedThroughYesterday = Math.min(totalDebt, overdueDueDates.length * installmentAmount);
    const overdueGap = Math.max(0, expectedThroughYesterday - currentTotalPaid);
    if (overdueGap > 0.1 && overdueDueDates.length) {
        details.overdueInstallments = Math.min(overdueDueDates.length, Math.ceil(overdueGap / installmentAmount));
        const fullyCoveredInstallments = Math.floor((currentTotalPaid + 0.1) / installmentAmount);
        const oldestUnpaidIndex = Math.min(fullyCoveredInstallments, overdueDueDates.length - 1);
        details.lateDays = Math.max(1, dayNumber(today) - dayNumber(overdueDueDates[oldestUnpaidIndex]));
    }

    if (dueToday) {
        const installmentsDueIncludingToday = overdueDueDates.length + 1;
        const expectedIncludingToday = Math.min(totalDebt, installmentsDueIncludingToday * installmentAmount);
        const dueAmount = Math.max(0, expectedIncludingToday - currentTotalPaid);
        details.amountDueToday = Math.min(installmentAmount, dueAmount);
    }

    const fixedFineAmount = Number(loan.lateFeeAmount) || 0;
    const configuredFineDelay = Number.parseInt(loan.lateFeeDelay, 10);
    const fixedFineDelay = Number.isInteger(configuredFineDelay) && configuredFineDelay >= 1 && configuredFineDelay <= 5
        ? configuredFineDelay
        : 5;
    if (details.lateDays >= fixedFineDelay && fixedFineAmount > 0) {
        details.fixedFineApplied = fixedFineAmount;
        details.hasFixedFine = true;
        details.lateFeesAccumulated += fixedFineAmount;
    }

    details.status = details.lateDays > 0 ? 'late' : 'pending';
    return details;
}
