type PaymentSummaryItem = {
  label: string
  value: string | number
}

type PaymentSummaryProps = {
  items: PaymentSummaryItem[]
}

export function PaymentSummary({ items }: PaymentSummaryProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm"
        >
          <p className="text-xs font-semibold uppercase text-neutral-500">
            {item.label}
          </p>
          <p className="mt-2 text-xl font-semibold text-neutral-950">
            {item.value}
          </p>
        </div>
      ))}
    </section>
  )
}
