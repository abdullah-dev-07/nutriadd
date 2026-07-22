const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

export function formatDate(isoDate: string) {
  return dateFormatter.format(new Date(isoDate))
}

const currencyFormatters: Record<string, Intl.NumberFormat> = {}

export function formatCurrency(amount: number, currency = 'PKR') {
  let formatter = currencyFormatters[currency]
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    })
    currencyFormatters[currency] = formatter
  }
  return formatter.format(amount)
}
