"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

interface DataTableProps {
  data: any[]
}

export function DataTable({ data }: DataTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No data available.</p>
      </div>
    )
  }

  const columns = Object.keys(data[0]).filter(key => key !== 'Address' && key !== 'Phone'); // filter some out for cleaner display

  return (
    <ScrollArea className="h-full rounded-md border w-full">
      <Table className="w-full relative">
        <TableHeader className="sticky top-0 bg-secondary/80 backdrop-blur-sm z-10">
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column} className="whitespace-nowrap font-semibold">
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => (
            <TableRow key={i}>
              {columns.map((column) => (
                <TableCell key={column} className="whitespace-nowrap max-w-[200px] truncate">
                  {column === 'Priority' ? (
                    <Badge variant={row[column] === 'HIGH' ? 'default' : row[column] === 'MEDIUM' ? 'secondary' : 'outline'}>
                      {row[column]}
                    </Badge>
                  ) : column === 'LeadScore' ? (
                     <Badge variant="outline" className="font-mono">{row[column]}</Badge>
                  ) : (
                    row[column] || '-'
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
