"use client"

import { useEffect } from "react"

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("[Global Error]", error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ 
        backgroundColor: "#000", 
        color: "#fff", 
        fontFamily: "system-ui, sans-serif",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem"
      }}>
        <div style={{ textAlign: "center", maxWidth: "400px" }}>
          <div style={{ 
            fontSize: "4rem", 
            marginBottom: "1rem" 
          }}>
            ⚠️
          </div>
          
          <h1 style={{ 
            fontSize: "1.5rem", 
            fontWeight: "bold", 
            marginBottom: "0.5rem" 
          }}>
            Critical Error
          </h1>
          
          <p style={{ 
            color: "rgba(255,255,255,0.7)", 
            marginBottom: "1.5rem" 
          }}>
            Something went seriously wrong. Please try refreshing the page.
          </p>

          {error.digest && (
            <p style={{ 
              fontSize: "0.75rem", 
              color: "rgba(255,255,255,0.4)", 
              marginBottom: "1rem",
              fontFamily: "monospace"
            }}>
              Error ID: {error.digest}
            </p>
          )}

          <button
            onClick={reset}
            style={{
              backgroundColor: "#FFD700",
              color: "#000",
              border: "none",
              padding: "0.75rem 1.5rem",
              borderRadius: "0.5rem",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "1rem"
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  )
}

