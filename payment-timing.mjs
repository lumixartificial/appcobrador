export function createPaymentTimingSnapshot(details = {}) {
    const rawDays = Number(details.lateDays);
    const paymentDelayDays = Number.isFinite(rawDays) && rawDays > 0
        ? Math.floor(rawDays)
        : 0;

    return {
        paymentTimingStatus: paymentDelayDays > 0 ? 'late' : 'on_time',
        paymentDelayDays,
    };
}

export function readPaymentTiming(payment = {}, snapshot = {}) {
    const status = payment.paymentTimingStatus || snapshot.paymentTimingStatus || null;
    const rawDays = payment.paymentDelayDays ?? snapshot.paymentDelayDays;
    const paymentDelayDays = Number.isFinite(Number(rawDays)) && Number(rawDays) > 0
        ? Math.floor(Number(rawDays))
        : 0;

    if (status === 'late') return { status, paymentDelayDays: Math.max(1, paymentDelayDays) };
    if (status === 'on_time') return { status, paymentDelayDays: 0 };
    return { status: null, paymentDelayDays: 0 };
}
