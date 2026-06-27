"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from "next/link"
import { useState } from "react"
import { Search, SlidersHorizontal, Clock, Building2, Utensils, Scissors, Dumbbell, Stethoscope, Briefcase, Activity, Globe, MonitorOff, Star, ArrowRight } from "lucide-react"

export default function DashboardPage() {
  const [query, setQuery] = useState("")

  const quickCategories = [
    { icon: Utensils, label: "Cafes" },
    { icon: Building2, label: "Restaurants" },
    { icon: Scissors, label: "Salons" },
    { icon: Dumbbell, label: "Gyms" },
    { icon: Stethoscope, label: "Dentists" },
    { icon: Briefcase, label: "Real Estate" },
    { icon: Activity, label: "Clinics" },
  ]

  const recentSearches = [
    "Plumbers in New York",
    "Accountants in London",
    "Digital Marketing Agencies in Austin",
  ]

  return (
    <div className="flex flex-col gap-12 max-w-5xl mx-auto py-8">
      
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center space-y-6 mt-8">
        <Badge variant="secondary" className="px-3 py-1 rounded-full bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer">
          <span className="font-medium">New V2.0 Engine Live</span>
          <ArrowRight className="ml-2 h-3 w-3" />
        </Badge>
        
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
          Find your next customer.
        </h1>
        
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Extract high-quality leads, verify contact details, and analyze website health instantly using our intelligent data engine.
        </p>

        {/* Search Card */}
        <Card className="w-full max-w-3xl mt-6 border-muted bg-background/50 backdrop-blur shadow-sm">
          <CardContent className="p-2">
            <div className="flex flex-col sm:flex-row gap-2 relative">
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="e.g. 'cafes in gurugram'" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-12 h-14 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg shadow-none bg-transparent"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="h-14 w-14 shrink-0 rounded-xl border-muted/50 hover:bg-muted">
                  <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
                </Button>
                <Link href={`/searching?q=${encodeURIComponent(query || 'cafes in gurugram')}`} passHref>
                  <Button className="h-14 px-8 text-base font-semibold rounded-xl shadow-md">
                    Search Leads
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links & History */}
      <div className="flex flex-col md:flex-row gap-8 justify-between mt-4">
        <div className="flex-1 space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" /> Recent Searches
          </h3>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search, i) => (
              <Link key={i} href={`/searching?q=${encodeURIComponent(search)}`} passHref>
                <Badge variant="outline" className="px-3 py-1.5 font-normal text-muted-foreground hover:text-foreground cursor-pointer transition-colors bg-background">
                  {search}
                </Badge>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex-[2] space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Quick Categories
          </h3>
          <div className="flex flex-wrap gap-2">
            {quickCategories.map((cat, i) => (
              <Badge key={i} variant="secondary" className="px-4 py-2 font-medium bg-muted/50 hover:bg-muted cursor-pointer transition-all flex items-center gap-2 rounded-lg">
                <cat.icon className="h-4 w-4 text-muted-foreground" />
                {cat.label}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="h-px bg-border/50 my-4" />

      {/* Stats Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold tracking-tight">Overview</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Total Leads", value: "24,892", icon: Activity, desc: "+2,100 this week" },
            { title: "No Website", value: "8,431", icon: Globe, desc: "High potential for web agencies" },
            { title: "Dead Websites", value: "1,204", icon: MonitorOff, desc: "Needs immediate fixing" },
            { title: "High Priority", value: "4,112", icon: Star, desc: "Qualified and verified" },
          ].map((stat, i) => (
            <Card key={i} className="border-muted bg-background/50 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <stat.icon className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
    </div>
  );
}

