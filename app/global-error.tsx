// app/global-error.tsx
'use client' // Error boundaries must be Client Components

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>A critical system error occurred!</h2>
          <button onClick={() => reset()}>Try again</button>
        </div>
      </body>
    </html>
  )
}
