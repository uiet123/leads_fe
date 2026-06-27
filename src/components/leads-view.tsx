"use client"

import { useState, useEffect } from "react"
import { DataTable } from "./data-table"

export function LeadsView({ type }: { type: string }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch(`/api/leads?type=${type}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch data")
        return res.json()
      })
      .then(data => {
        if (data.error) throw new Error(data.error)
        setData(data.data || [])
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [type])

  if (loading) return <div className="h-[400px] flex items-center justify-center border rounded-xl animate-pulse bg-muted/20">Loading data...</div>
  if (error) return <div className="h-[400px] flex items-center justify-center border rounded-xl text-destructive">{error}</div>

  return (
    <div className="h-[600px]">
      <DataTable data={data} />
    </div>
  )
}
