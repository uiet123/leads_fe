"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, Search, Loader2 } from "lucide-react"

const mapsSteps = [
  "Connecting to Google Maps API...",
  "Searching businesses...",
  "Extracting business details...",
  "Checking websites...",
  "Validating website health...",
  "Prioritizing leads...",
  "Preparing results..."
]

const instagramSteps = [
  "Connecting to Google Search...",
  "Running Instagram dork query...",
  "Extracting leads from results...",
  "Parsing profiles & emails...",
  "Validating website health...",
  "Prioritizing leads...",
  "Preparing results..."
]

function SearchingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || "cafes in gurugram"
  const source = searchParams.get("source") || "maps"
  const steps = source === 'instagram' ? instagramSteps : mapsSteps
  
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState<string[]>([])
  const [eta, setEta] = useState("Calculating...")
  const [isDone, setIsDone] = useState(false)
  const [scrapeWarning, setScrapeWarning] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    
    // Connect to the Server-Sent Events stream
    const eventSource = new EventSource(`/api/scrape?query=${encodeURIComponent(query)}&source=${source}&limitNeighborhoods=true`)
    
    eventSource.onmessage = (event) => {
      if (!isMounted) return
      try {
        const data = JSON.parse(event.data)
        
        if (data.type === 'log' || data.type === 'error') {
          const msg = data.message.trim()
          if (!msg) return
          
          setLogs(prev => {
            const newLogs = [...prev, msg].slice(-10) // keep last 10 lines
            return newLogs
          })

          // Progress heuristics based on scraper log messages
          if (source === 'instagram') {
            // Instagram heuristics (works for both the Serper API and the browser-scraper paths)
            if (msg.includes('Searching Google for Instagram leads') || msg.includes('Using Serper.dev')) {
              setProgress(10)
              setCurrentStep(1)
              setEta("~60 seconds")
            } else if (msg.includes('Extracting leads from page')) {
              setProgress(prev => Math.min(prev + 8, 55))
              setCurrentStep(2)
              setEta("~45 seconds")
            } else if (msg.includes('Navigating to next page')) {
              setProgress(prev => Math.min(prev + 8, 60))
              setCurrentStep(2)
              setEta("~45 seconds")
            } else if (msg.includes('Total Instagram leads')) {
              // Matches "Total Instagram leads via Serper" and "...extracted"
              setProgress(65)
              setCurrentStep(3)
              setEta("~30 seconds")
            } else if (msg.includes('Enriching leads') || msg.includes('unique profiles to visit')) {
              setProgress(prev => Math.max(prev, 68))
              setCurrentStep(3)
              setEta("~30 seconds")
            } else if (msg.includes('Visiting @')) {
              // One log line per profile bio visit — creep the bar up
              setProgress(prev => Math.min(prev + 1, 85))
              setCurrentStep(4)
              setEta("~20 seconds")
            } else if (msg.includes('Processing') || msg.includes('Checking') || msg.includes('Validating') || msg.includes('Enriched')) {
              setProgress(prev => Math.min(prev + 2, 88))
              setCurrentStep(4)
              setEta("~15 seconds")
            } else if (msg.includes('Extraction Summary') || msg.includes('Priority Breakdown')) {
              setProgress(90)
              setCurrentStep(5)
              setEta("Finishing up...")
            } else if (msg.includes('CAPTCHA detected') || msg.includes('No Instagram leads were found') || msg.includes('No search results found') || msg.includes('Serper request failed')) {
              setScrapeWarning(msg)
            }
          } else {
            // Google Maps scraper heuristics
            if (msg.includes('Found')) {
              setProgress(10)
              setCurrentStep(1)
              setEta("~2 minutes")
            } else if (msg.includes('Scraping Chunk:')) {
              setProgress(prev => Math.min(prev + 10, 50))
              setCurrentStep(2)
              setEta("~90 seconds")
            } else if (msg.includes('Collected')) {
              setProgress(prev => Math.min(prev + 2, 70))
              setCurrentStep(3)
              setEta("~60 seconds")
            } else if (msg.includes('Processing')) {
              setProgress(prev => Math.min(prev + 1, 85))
              setCurrentStep(4)
              setEta("~30 seconds")
            } else if (msg.includes('Total businesses extracted')) {
              setProgress(90)
              setCurrentStep(5)
              setEta("Finishing up...")
            }
          }
        }
        
        if (data.type === 'done') {
          setIsDone(true)
          setProgress(100)
          setCurrentStep(steps.length - 1)
          setEta("Done!")
          eventSource.close()
          
          setTimeout(() => {
            router.push(`/search?q=${encodeURIComponent(query)}&source=${source}`)
          }, 1000)
        }
      } catch (err) {
        console.error("Error parsing SSE data", err)
      }
    }

    eventSource.onerror = (err) => {
      console.error('SSE connection error:', err)
      eventSource.close()
      if (isMounted && !isDone) {
        // Fallback navigate
        router.push(`/search?q=${encodeURIComponent(query)}&source=${source}`)
      }
    }

    return () => {
      isMounted = false
      eventSource.close()
    }
  }, [query, source, router, isDone])

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center">
      <div className="w-full max-w-lg p-6 space-y-8">
        
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Extracting Live Leads</h1>
          <p className="text-muted-foreground">
            Searching {source === 'instagram' ? 'Instagram (via Google)' : 'Google Maps'} for: <span className="font-medium text-foreground">"{query}"</span>
          </p>
          {scrapeWarning && (
            <div className="mt-3 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-600 text-sm font-medium">
              ⚠️ {scrapeWarning}
            </div>
          )}
        </div>

        <div className="space-y-6 bg-muted/30 p-6 rounded-2xl border">
          <div className="flex justify-between text-xs font-medium text-muted-foreground mb-2">
            <span>Progress: {Math.round(progress)}%</span>
            <span>ETA: {eta}</span>
          </div>
          <Progress value={progress} className="h-2 w-full" />
          
          <div className="space-y-3 hidden sm:block">
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

          {/* Live Terminal Output */}
          <div className="mt-4 p-3 bg-black/90 text-green-400 font-mono text-[10px] sm:text-xs rounded-lg overflow-hidden h-32 flex flex-col justify-end">
            {logs.map((log, i) => (
              <div key={i} className="truncate opacity-80">{log}</div>
            ))}
            {!isDone && (
              <div className="flex items-center mt-1 text-green-500 opacity-100">
                <span className="mr-2">&gt;</span>
                <span className="animate-pulse">_</span>
              </div>
            )}
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
