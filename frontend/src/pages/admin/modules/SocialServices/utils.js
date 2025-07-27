// Date formatting helper
export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString();
}

// Currency formatting helper
export function formatCurrency(amount) {
  if (amount == null) return '-';
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'PHP' });
} 