/**
 * Format an amount into a localized currency string.
 * @param {number} amount - The numeric amount to format
 * @param {string} currencyCode - The ISO 4217 currency code (e.g. 'EUR', 'USD', 'GBP')
 * @returns {string} - The formatted string (e.g. €5.00, $5.00)
 */
export function formatCurrency(amount, currencyCode = 'EUR') {
    if (isNaN(amount) || amount === null) amount = 0;
    try {
        return new Intl.NumberFormat(navigator.language || 'en-US', {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    } catch (e) {
        // Fallback if currency code is invalid or missing
        return `${currencyCode} ${Number(amount).toFixed(2)}`;
    }
}
