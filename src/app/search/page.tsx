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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, MapPin, Globe, Mail, Phone, ExternalLink, Star, Copy, FileText, Activity, Loader2, MessageCircle, Send } from "lucide-react"
import { Suspense } from "react"
import { generateDummyLeads, type Lead } from "@/lib/dummy-data-generator"

function SearchResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get("q") || "cafes in gurugram"
  const source = searchParams.get("source") || "maps"
  const isInstagram = source === "instagram"
  const [searchInput, setSearchInput] = useState(query)

  const [dummyLeads, setDummyLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const [nameFilter, setNameFilter] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [healthFilter, setHealthFilter] = useState("")
  const [sortBy, setSortBy] = useState("")

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const [draftOpen, setDraftOpen] = useState(false)
  const [draftType, setDraftType] = useState<'whatsapp' | 'email' | 'instagram' | null>(null)
  const [draftLead, setDraftLead] = useState<Lead | null>(null)
  const [draftText, setDraftText] = useState("")

  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<number>>(new Set())
  const [isSendingBulk, setIsSendingBulk] = useState(false)
  const [modalState, setModalState] = useState<{ isOpen: boolean, title: string, message: string, type: 'success' | 'error' | 'info' }>({ isOpen: false, title: '', message: '', type: 'info' })

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [nameFilter, priorityFilter, statusFilter, healthFilter, sortBy])

  useEffect(() => {
    setLoading(true)
    setSearchInput(query)

    fetch('/api/leads?type=all')
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch data")
        return res.json()
      })
      .then(json => {
        if (json.error) throw new Error(json.error)
        const mappedLeads = (json.data || []).map((record: any, idx: number): Lead => ({
          id: idx + 1,
          business: record['Business Name'] || record.Name || '',
          address: record['Address'] || '',
          phone: record['Phone Number'] || record.Phone || '',
          website: record['Website'] || '',
          rating: parseFloat(record['Rating']) || 0,
          reviews: parseInt(record['Reviews'], 10) || 0,
          websiteHealth: record['Website Health'] || 'N/A',
          websiteStatus: record['Website Status'] || 'NO_WEBSITE',
          primaryEmail: record['Primary Email'] || 'N/A',
          allEmails: record['All Emails'] ? String(record['All Emails']).split(',').filter(Boolean) : [],
          leadScore: parseInt(record['Lead Score'], 10) || 0,
          priority: record['Priority'] || 'LOW',
          igUsername: record['Instagram Username'] || ''
        }))
        setDummyLeads(mappedLeads)
      })
      .catch(err => {
        console.error(err)
        setDummyLeads([])
      })
      .finally(() => setLoading(false))
  }, [query])

  const handleRowClick = (lead: Lead) => {
    setSelectedLead(lead)
    setIsSheetOpen(true)
  }

  const handleUpdateSearch = () => {
    router.push(`/searching?q=${encodeURIComponent(searchInput)}&source=${source}`)
  }

  // Derive the Instagram @username from the lead data.
  const getIgUsername = (lead: Lead): string | null => {
    // Primary: use the dedicated igUsername field from CSV (most reliable)
    if (lead.igUsername) {
      const clean = lead.igUsername.replace(/^@/, '')
      if (clean.length > 0) return '@' + clean
    }
    // Fallback: extract from the Website URL (instagram.com/username)
    const fromSite = (lead.website || '').match(/instagram\.com\/([A-Za-z0-9._]+)\/?(?:\?.*)?$/i)
    if (fromSite && !['p', 'reel', 'tv', 'stories', 'explore', 'tags', 'accounts'].includes(fromSite[1].toLowerCase())) {
      return '@' + fromSite[1]
    }
    // Fallback: look for (@username) in business name
    const fromName = (lead.business || '').match(/\(@([A-Za-z0-9._]+)\)/)
    if (fromName) return '@' + fromName[1]
    // Fallback: if business name itself is a bare @username
    const bareHandle = (lead.business || '').match(/^@([A-Za-z0-9._]+)$/)
    if (bareHandle) return '@' + bareHandle[1]
    return null
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH": return "bg-red-500/10 text-red-600 border-red-500/20"
      case "MEDIUM": return "bg-amber-500/10 text-amber-600 border-amber-500/20"
      case "LOW": return "bg-green-500/10 text-green-600 border-green-500/20"
      default: return "bg-gray-500/10 text-gray-600 border-gray-500/20"
    }
  }

  const getMessageText = (lead: Lead) => {
    return `Hi! I recently designed a premium website for one of my clients and thought ${lead.business} would look amazing with a similar online presence.

Demo: https://winknwrap-house.vercel.app/

A dedicated website gives customers a more premium shopping experience than Instagram alone, builds trust, showcases your products beautifully, and makes ordering much easier.

I can create a similar premium website for just ₹1499.

Let me know if you'd like one for your brand. 😊`;
  }

  const handleOpenDraft = (e: React.MouseEvent, lead: Lead, type: 'whatsapp' | 'email' | 'instagram') => {
    e.stopPropagation();
    setDraftLead(lead);
    setDraftType(type);
    setDraftText(getMessageText(lead));
    setDraftOpen(true);
  }

  const sendWhatsApp = () => {
    if (!draftLead) return;
    let phone = draftLead.phone.replace(/[^0-9]/g, '');
    // Format for India by default if it looks like a standard 10 digit or 0-prefixed 11 digit number
    if (phone.length === 11 && phone.startsWith('0')) {
      phone = '91' + phone.substring(1);
    } else if (phone.length === 10) {
      phone = '91' + phone;
    }
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(draftText)}`, '_blank');
    setDraftOpen(false);
  }

  const sendEmail = () => {
    if (!draftLead) return;
    const subject = `A modern website for ${draftLead.business}`;
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(draftLead.primaryEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(draftText)}`;
    window.open(url, '_blank');
    setDraftOpen(false);
  }

  const sendInstagram = () => {
    if (!draftLead) return;
    navigator.clipboard.writeText(draftText).catch(err => console.error("Clipboard copy failed:", err));
    const uname = (getIgUsername(draftLead) || '').replace('@', '');
    window.open(`https://ig.me/m/${uname}`, '_blank');
    setDraftOpen(false);
  }

  const handleBulkEmail = async () => {
    if (selectedLeadIds.size === 0) return;

    setIsSendingBulk(true);
    const leadsToSend = dummyLeads.filter(l => selectedLeadIds.has(l.id));

    try {
      const res = await fetch('/api/bulk-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: leadsToSend })
      });
      const data = await res.json();
      if (res.ok) {
        console.log('Bulk Send Results:', data.results);

        const failed = data.results.filter((r: any) => r.status === 'failed');
        if (failed.length > 0) {
          setModalState({
            isOpen: true,
            title: 'Partial Success',
            message: `Bulk email dispatch completed, but ${failed.length} emails failed to send. Check console for details.`,
            type: 'error'
          });
        } else {
          setModalState({
            isOpen: true,
            title: 'Success!',
            message: 'All emails have been sent successfully!',
            type: 'success'
          });
        }

        setSelectedLeadIds(new Set());
      } else {
        setModalState({
          isOpen: true,
          title: 'Error',
          message: 'Error sending bulk emails: ' + (data.error || 'Unknown error'),
          type: 'error'
        });
      }
    } catch (err) {
      setModalState({
        isOpen: true,
        title: 'Network Error',
        message: 'A network error occurred while sending bulk emails.',
        type: 'error'
      });
      console.error(err);
    } finally {
      setIsSendingBulk(false);
    }
  }

  const toggleSelectAll = (checked: boolean, paginatedIds: number[]) => {
    const newSet = new Set(selectedLeadIds);
    if (checked) {
      paginatedIds.forEach(id => newSet.add(id));
    } else {
      paginatedIds.forEach(id => newSet.delete(id));
    }
    setSelectedLeadIds(newSet);
  }

  const toggleSelect = (checked: boolean, id: number) => {
    const newSet = new Set(selectedLeadIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedLeadIds(newSet);
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
              <Input
                placeholder="Filter by name..."
                className="w-[200px] h-9 bg-background shadow-sm"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
              />
              <Select value={priorityFilter} onValueChange={(val) => setPriorityFilter(val || "")}>
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
              <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "")}>
                <SelectTrigger className="w-[150px] h-9 bg-background shadow-sm">
                  <SelectValue placeholder="Website Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="has_website">Has Website</SelectItem>
                  <SelectItem value="no_website">No Website</SelectItem>
                </SelectContent>
              </Select>
              <Select value={healthFilter} onValueChange={(val) => setHealthFilter(val || "")}>
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
              <Select value={sortBy} onValueChange={(val) => setSortBy(val || "")}>
                <SelectTrigger className="w-[140px] h-9 bg-background shadow-sm">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">Lead Score</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="reviews">Reviews</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleBulkEmail}
                disabled={selectedLeadIds.size === 0 || isSendingBulk}
                className="h-9 gap-2 shadow-sm"
              >
                {isSendingBulk ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                Send Bulk ({selectedLeadIds.size})
              </Button>
            </div>
          </div>

          {(() => {
            const filteredAndSortedLeads = [...dummyLeads]
              .filter(lead => {
                // In Instagram mode, hide leads where we can't extract a username
                if (isInstagram && !getIgUsername(lead)) return false;
                if (nameFilter && !lead.business.toLowerCase().includes(nameFilter.toLowerCase())) return false;
                if (priorityFilter && priorityFilter !== 'all' && lead.priority.toLowerCase() !== priorityFilter) return false;
                if (statusFilter && statusFilter !== 'all' && lead.websiteStatus !== statusFilter.toUpperCase()) return false;
                if (healthFilter && healthFilter !== 'all' && lead.websiteHealth !== healthFilter.toUpperCase()) return false;
                return true;
              })
              .sort((a, b) => {
                if (sortBy === 'score') return b.leadScore - a.leadScore;
                if (sortBy === 'rating') return b.rating - a.rating;
                if (sortBy === 'reviews') return b.reviews - a.reviews;
                return 0;
              });

            const totalPages = Math.ceil(filteredAndSortedLeads.length / itemsPerPage) || 1;
            const paginatedLeads = filteredAndSortedLeads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
            const paginatedIds = paginatedLeads.map(l => l.id);
            const isAllSelected = paginatedIds.length > 0 && paginatedIds.every(id => selectedLeadIds.has(id));

            return (
              <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[50px] text-center">
                          <Checkbox
                            checked={isAllSelected}
                            onCheckedChange={(c) => toggleSelectAll(c as boolean, paginatedIds)}
                            aria-label="Select all"
                          />
                        </TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground w-[250px]">Business</TableHead>

                        <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Phone</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Website Status</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Website Health</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground text-center">Score</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Priority</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground text-right w-[150px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedLeads.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="h-48 text-center">
                            <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                              <Search className="h-8 w-8 mb-2 opacity-50" />
                              <p className="text-lg font-medium">No leads found</p>
                              <p className="text-sm">Try using a different search query or removing filters.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedLeads.map((lead) => (
                          <TableRow
                            key={lead.id}
                            onClick={() => handleRowClick(lead)}
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                          >
                            <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={selectedLeadIds.has(lead.id)}
                                onCheckedChange={(c) => toggleSelect(c as boolean, lead.id)}
                                aria-label="Select row"
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              {isInstagram ? (
                                (() => {
                                  const username = getIgUsername(lead)
                                  return username ? (
                                    <a
                                      href={`https://instagram.com/${username.replace('@', '')}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="truncate max-w-[230px] block hover:underline text-pink-500 dark:text-pink-400 font-semibold"
                                    >
                                      {username}
                                    </a>
                                  ) : (
                                    <span className="truncate max-w-[230px] block text-muted-foreground italic">Unknown</span>
                                  )
                                })()
                              ) : (
                                <div className="flex flex-col">
                                  <span className="truncate max-w-[230px]">{lead.business}</span>
                                  <span className="text-xs text-muted-foreground truncate max-w-[230px]">{lead.address}</span>
                                </div>
                              )}
                            </TableCell>

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
                                <span className={`text-[11px] px-2 py-1 rounded-full font-medium ${lead.websiteHealth === 'LIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
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
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {isInstagram ? (
                                  // Instagram tab: show only the Instagram DM button
                                  getIgUsername(lead) && (
                                    <Button size="icon" variant="outline" className="h-7 w-7 text-pink-600 border-pink-500/20 hover:bg-pink-500/10" onClick={(e) => handleOpenDraft(e, lead, 'instagram')} title="Send Instagram DM">
                                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                                      </svg>
                                    </Button>
                                  )
                                ) : (
                                  // Maps/default tab: show WhatsApp + Email buttons
                                  <>
                                    {lead.phone && lead.phone !== 'N/A' && (
                                      <Button size="icon" variant="outline" className="h-7 w-7 text-green-600 border-green-500/20 hover:bg-green-500/10" onClick={(e) => handleOpenDraft(e, lead, 'whatsapp')} title="Send WhatsApp">
                                        <MessageCircle className="h-3.5 w-3.5" />
                                      </Button>
                                    )}
                                    {lead.primaryEmail && lead.primaryEmail !== 'N/A' && (
                                      <Button size="icon" variant="outline" className="h-7 w-7 text-blue-600 border-blue-500/20 hover:bg-blue-500/10" onClick={(e) => handleOpenDraft(e, lead, 'email')} title="Send Email">
                                        <Mail className="h-3.5 w-3.5" />
                                      </Button>
                                    )}
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="p-4 border-t bg-muted/20 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Showing {filteredAndSortedLeads.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredAndSortedLeads.length)} of {filteredAndSortedLeads.length} total entries
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            );
          })()}
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

      {/* Message Draft Drawer */}
      <Sheet open={draftOpen} onOpenChange={setDraftOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto border-l shadow-2xl p-6 flex flex-col gap-6">
          {draftLead && draftType && (
            <div className="flex flex-col h-full">
              <div>
                <h2 className="text-xl font-bold tracking-tight">
                  Draft {draftType === 'whatsapp' ? 'WhatsApp' : draftType === 'instagram' ? 'Instagram' : 'Email'} Message
                </h2>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  To: {draftLead.business} <br />
                  <span className="font-medium text-foreground">{draftType === 'whatsapp' ? draftLead.phone : draftType === 'instagram' ? getIgUsername(draftLead) : draftLead.primaryEmail}</span>
                </p>
              </div>
              <div className="flex-1 flex flex-col min-h-[400px]">
                <textarea
                  className="w-full h-full p-4 bg-muted/50 border rounded-md focus:ring-1 focus:ring-primary outline-none resize-none text-sm"
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                />
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => setDraftOpen(false)}>Cancel</Button>
                <Button
                  className={`flex-1 gap-2 ${draftType === 'whatsapp' ? 'bg-green-600 hover:bg-green-700 text-white' : draftType === 'instagram' ? 'bg-pink-600 hover:bg-pink-700 text-white' : ''}`}
                  onClick={draftType === 'whatsapp' ? sendWhatsApp : draftType === 'instagram' ? sendInstagram : sendEmail}
                >
                  {draftType === 'whatsapp' ? <MessageCircle className="h-4 w-4" /> : draftType === 'instagram' ? <Send className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                  {draftType === 'instagram' ? 'Copy Text & Open Chat' : 'Send Now'}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Simple Custom Modal */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <h3 className={`text-xl font-bold ${modalState.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
              {modalState.title}
            </h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{modalState.message}</p>
            <div className="flex justify-end pt-4 border-t">
              <Button onClick={() => setModalState({ ...modalState, isOpen: false })}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

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
