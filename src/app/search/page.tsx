"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, MapPin, Globe, Mail, Phone, ExternalLink, Star, Copy, FileText, Activity, Loader2 } from "lucide-react"
import { Suspense } from "react"
import { generateDummyLeads, type Lead } from "@/lib/dummy-data-generator"

function SearchResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get("q") || "cafes in gurugram"
  const [searchInput, setSearchInput] = useState(query)
  
  const [dummyLeads, setDummyLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  useEffect(() => {
    // Simulate slight delay for processing
    setLoading(true)
    setSearchInput(query)
    const timeout = setTimeout(() => {
      setDummyLeads(generateDummyLeads(query))
      setLoading(false)
    }, 500)
    return () => clearTimeout(timeout)
  }, [query])

  const handleRowClick = (lead: Lead) => {
    setSelectedLead(lead)
    setIsSheetOpen(true)
  }

  const handleUpdateSearch = () => {
    router.push(`/searching?q=${encodeURIComponent(searchInput)}`)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH": return "bg-red-500/10 text-red-600 border-red-500/20"
      case "MEDIUM": return "bg-amber-500/10 text-amber-600 border-amber-500/20"
      case "LOW": return "bg-green-500/10 text-green-600 border-green-500/20"
      default: return "bg-gray-500/10 text-gray-600 border-gray-500/20"
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      
      {/* Sticky Top Search Bar */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b p-4 sm:p-6 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUpdateSearch()}
              className="pl-9 h-11 bg-muted/50 border-muted focus-visible:ring-1 focus-visible:ring-primary shadow-sm w-full"
            />
          </div>
          <Button onClick={handleUpdateSearch} className="h-11 px-6 shadow-sm whitespace-nowrap w-full sm:w-auto">Update Search</Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Statistics Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Total Leads", value: loading ? "..." : dummyLeads.length },
              { label: "Website Found", value: loading ? "..." : dummyLeads.filter(l => l.websiteStatus === 'HAS_WEBSITE').length },
              { label: "No Website", value: loading ? "..." : dummyLeads.filter(l => l.websiteStatus === 'NO_WEBSITE').length },
              { label: "Dead Websites", value: loading ? "..." : dummyLeads.filter(l => l.websiteHealth === 'DEAD').length },
              { label: "High Priority", value: loading ? "..." : dummyLeads.filter(l => l.priority === 'HIGH').length },
            ].map((stat, i) => (
              <Card key={i} className="border-muted bg-card shadow-sm rounded-xl">
                <CardContent className="p-4 flex flex-col justify-center">
                  <span className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">{stat.label}</span>
                  <span className="text-2xl font-bold tracking-tight">{stat.value}</span>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filter Toolbar */}
          <div className="flex flex-col md:flex-row flex-wrap gap-3 items-center justify-between bg-muted/30 p-2 rounded-lg border">
            <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
              <Input placeholder="Filter by name..." className="w-[200px] h-9 bg-background shadow-sm" />
              <Select>
                <SelectTrigger className="w-[140px] h-9 bg-background shadow-sm">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[150px] h-9 bg-background shadow-sm">
                  <SelectValue placeholder="Website Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="has_website">Has Website</SelectItem>
                  <SelectItem value="no_website">No Website</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[150px] h-9 bg-background shadow-sm">
                  <SelectValue placeholder="Website Health" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Health</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="dead">Dead</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 w-full md:w-auto justify-end mt-2 md:mt-0">
               <Select>
                <SelectTrigger className="w-[140px] h-9 bg-background shadow-sm">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">Lead Score</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="reviews">Reviews</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Data Table */}
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground w-[250px]">Business</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Rating</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Reviews</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Phone</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Website Status</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Website Health</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground text-center">Score</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Priority</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dummyLeads.map((lead) => (
                    <TableRow 
                      key={lead.id} 
                      onClick={() => handleRowClick(lead)}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="truncate max-w-[230px]">{lead.business}</span>
                          <span className="text-xs text-muted-foreground truncate max-w-[230px]">{lead.address}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                          <span>{lead.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{lead.reviews}</TableCell>
                      <TableCell className="text-muted-foreground text-sm truncate max-w-[120px]">{lead.phone}</TableCell>
                      <TableCell>
                        {lead.websiteStatus === 'HAS_WEBSITE' ? (
                          <Badge variant="outline" className="text-[10px] font-medium border-blue-500/30 bg-blue-500/10 text-blue-600">YES</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] font-medium border-gray-500/30 bg-gray-500/10 text-gray-600">NO</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {lead.websiteHealth !== 'N/A' && (
                          <span className={`text-[11px] px-2 py-1 rounded-full font-medium ${
                            lead.websiteHealth === 'LIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            lead.websiteHealth === 'DEAD' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}>
                            {lead.websiteHealth}
                          </span>
                        )}
                        {lead.websiteHealth === 'N/A' && <span className="text-muted-foreground text-xs">-</span>}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="font-mono">{lead.leadScore}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] border ${getPriorityColor(lead.priority)}`} variant="outline">
                          {lead.priority}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="p-4 border-t bg-muted/20 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Showing {dummyLeads.length > 0 ? 1 : 0} to {dummyLeads.length} of {dummyLeads.length} entries</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm" disabled>Next</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Drawer (Sheet) */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto border-l shadow-2xl p-0">
          {selectedLead && (
            <div className="flex flex-col h-full">
              <div className="p-6 bg-muted/30 border-b">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h2 className="text-xl font-bold tracking-tight">{selectedLead.business}</h2>
                  <Badge className={`mt-1 shrink-0 ${getPriorityColor(selectedLead.priority)}`} variant="outline">
                    {selectedLead.priority} PRIORITY
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 font-medium">
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                    {selectedLead.rating}
                  </div>
                  <span className="text-muted-foreground">{selectedLead.reviews} Google Reviews</span>
                  <Badge variant="secondary" className="font-mono ml-auto">Score: {selectedLead.leadScore}</Badge>
                </div>
              </div>

              <div className="p-6 space-y-8 flex-1">
                
                {/* Contact Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Contact Information
                  </h3>
                  <div className="grid gap-3 text-sm">
                    <div className="flex gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <span>{selectedLead.address}</span>
                    </div>
                    <div className="flex gap-3 items-center">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>{selectedLead.phone}</span>
                    </div>
                    <div className="flex gap-3 items-center">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>{selectedLead.primaryEmail}</span>
                    </div>
                    <div className="flex gap-3 items-center">
                      <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate">{selectedLead.website}</span>
                    </div>
                  </div>
                </div>

                {/* Status Flags */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Activity className="h-4 w-4" /> Technical Status
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex flex-col gap-1 border rounded-lg p-3 bg-muted/20">
                      <span className="text-muted-foreground text-xs">Website Present</span>
                      <span className="font-medium">{selectedLead.websiteStatus === 'HAS_WEBSITE' ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex flex-col gap-1 border rounded-lg p-3 bg-muted/20">
                      <span className="text-muted-foreground text-xs">Website Health</span>
                      <span className="font-medium">{selectedLead.websiteHealth}</span>
                    </div>
                    <div className="flex flex-col gap-1 border rounded-lg p-3 bg-muted/20">
                      <span className="text-muted-foreground text-xs">Emails Found</span>
                      <span className="font-medium">{selectedLead.allEmails.length} Total</span>
                    </div>
                  </div>
                </div>

              </div>

              <div className="p-6 border-t bg-muted/10 grid grid-cols-2 gap-3 shrink-0">
                <Button className="w-full gap-2 shadow-sm" variant="default">
                  <ExternalLink className="h-4 w-4" /> Open Website
                </Button>
                <Button className="w-full gap-2 shadow-sm" variant="outline">
                  <MapPin className="h-4 w-4" /> Google Maps
                </Button>
                <Button className="w-full gap-2 shadow-sm" variant="outline">
                  <Copy className="h-4 w-4" /> Copy Phone
                </Button>
                <Button className="w-full gap-2 shadow-sm" variant="outline">
                  <Copy className="h-4 w-4" /> Copy Email
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
      
    </div>
  )
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center h-full flex flex-col items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-muted-foreground" /></div>}>
      <SearchResultsContent />
    </Suspense>
  )
}
