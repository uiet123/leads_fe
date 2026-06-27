"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, Search, Loader2 } from "lucide-react"

const steps = [
  "Connecting to Google Maps API...",
  "Searching businesses...",
  "Extracting business details...",
  "Checking websites...",
  "Validating website health...",
  "Prioritizing leads...",
  "Preparing results..."
]

function SearchingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || "cafes in gurugram"
  
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Total duration ~ 6 seconds
    const totalDuration = 6000
    const stepDuration = totalDuration / steps.length
    const updateInterval = 100 // update progress every 100ms
    
    let timeElapsed = 0

    const timer = setInterval(() => {
      timeElapsed += updateInterval
      const p = Math.min((timeElapsed / totalDuration) * 100, 100)
      setProgress(p)
      
      const stepIndex = Math.min(Math.floor(timeElapsed / stepDuration), steps.length - 1)
      setCurrentStep(stepIndex)

      if (timeElapsed >= totalDuration) {
        clearInterval(timer)
        // Complete, navigate to results
        setTimeout(() => {
          router.push(`/search?q=${encodeURIComponent(query)}`)
        }, 300)
      }
    }, updateInterval)

    return () => clearInterval(timer)
  }, [query, router])

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center">
      <div className="w-full max-w-md p-6 space-y-8">
        
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Extracting Leads</h1>
          <p className="text-muted-foreground">
            Searching for: <span className="font-medium text-foreground">"{query}"</span>
          </p>
        </div>

        <div className="space-y-6 bg-muted/30 p-6 rounded-2xl border">
          <Progress value={progress} className="h-2 w-full" />
          
          <div className="space-y-3">
            {steps.map((step, index) => {
              const isCompleted = index < currentStep
              const isCurrent = index === currentStep
              
              return (
                <div key={index} className={`flex items-center gap-3 text-sm transition-all duration-300 ${isCompleted ? 'text-muted-foreground' : isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground/40'}`}>
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0" />
                  )}
                  <span>{step}</span>
                </div>
              )
            })}
          </div>
        </div>
        
      </div>
    </div>
  )
}

export default function SearchingPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-background z-50 flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}>
      <SearchingContent />
    </Suspense>
  )
}
