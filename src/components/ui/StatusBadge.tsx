const styles: Record<string, string> = {
  Received: 'bg-blue-50 text-blue-700',
  'Being Handled': 'bg-amber-50 text-amber-700',
  Completed: 'bg-green-50 text-green-700',
  attending: 'bg-green-50 text-green-700',
  declined: 'bg-red-50 text-red-700',
  maybe: 'bg-amber-50 text-amber-700',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge ${styles[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}
