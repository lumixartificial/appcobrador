// Regras de exibição apenas; não modifica saldos nem aprovação de pagamentos.
export function operationalDayKey(value = new Date()) {
    let date;
    if (value && typeof value.toDate === 'function') date = value.toDate();
    else if (value && Number.isFinite(value.seconds)) date = new Date(value.seconds * 1000);
    else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    else if (value != null) date = new Date(value);
    if (!date || !Number.isFinite(date.getTime())) return null;
    date = new Date(date);
    if (date.getHours() < 5) date.setDate(date.getDate() - 1);
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

export function paymentDaySummary(loan, now = new Date()) {
    const today = operationalDayKey(now);
    const payments = (loan?.history || []).filter(payment =>
        Number(payment.amount) > 0 &&
        payment.method !== 'migration' &&
        (!payment.status || payment.status === 'approved' || payment.status === 'pending_verification') &&
        today !== null && operationalDayKey(payment.date) === today
    );
    return {
        registered: payments.length > 0,
        approved: payments.some(payment => payment.status !== 'pending_verification'),
        pending: payments.some(payment => payment.status === 'pending_verification')
    };
}

export function shouldCollectToday(loan, details, now = new Date()) {
    return details.status !== 'finished' &&
        (details.amountDueToday > 0 || details.overdueInstallments > 0 || details.lateDays > 0) &&
        !paymentDaySummary(loan, now).registered;
}

export function dailyAdminEntries(clients, now = new Date()) {
    return clients.flatMap(client => (client.loans || []).flatMap((loan, loanIndex) => {
        const summary = paymentDaySummary(loan, now);
        return summary.registered ? [{ client, loan, loanIndex, pendingPayment: summary.pending }] : [];
    }));
}
