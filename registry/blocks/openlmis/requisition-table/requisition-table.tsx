import { CheckIcon, XIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type LineItem = {
  code: string
  product: string
  beginningBalance: number
  received: number
  consumed: number
  requested: number
}

const LINE_ITEMS: LineItem[] = [
  {
    code: "C100",
    product: "Amoxicillin 250mg dispersible tablet",
    beginningBalance: 1240,
    received: 600,
    consumed: 980,
    requested: 1200,
  },
  {
    code: "C200",
    product: "Oral Rehydration Salts sachet",
    beginningBalance: 860,
    received: 400,
    consumed: 710,
    requested: 900,
  },
  {
    code: "C300",
    product: "Zinc sulfate 20mg tablet",
    beginningBalance: 2100,
    received: 0,
    consumed: 1340,
    requested: 1500,
  },
  {
    code: "C400",
    product: "Artemether/Lumefantrine 20/120mg",
    beginningBalance: 540,
    received: 1200,
    consumed: 1310,
    requested: 1800,
  },
  {
    code: "C500",
    product: "Paracetamol 500mg tablet",
    beginningBalance: 3200,
    received: 0,
    consumed: 2450,
    requested: 2600,
  },
]

const NUMBER_FORMAT = new Intl.NumberFormat("en")

function stockOnHand(item: LineItem): number {
  return item.beginningBalance + item.received - item.consumed
}

function sum(pick: (item: LineItem) => number): number {
  return LINE_ITEMS.reduce((total, item) => total + pick(item), 0)
}

export default function RequisitionTable() {
  return (
    <section className="flex w-full justify-center px-4 py-8">
      <Card className="w-full max-w-5xl">
        <CardHeader>
          <CardTitle>Essential Medicines, March 2026</CardTitle>
          <CardDescription>
            Kankao Health Facility · Monthly reporting period · Submitted 4 Mar
            2026
          </CardDescription>
          <CardAction>
            <Badge variant="secondary">In approval</Badge>
          </CardAction>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Beginning</TableHead>
                  <TableHead className="text-right">Received</TableHead>
                  <TableHead className="text-right">Consumed</TableHead>
                  <TableHead className="text-right">Stock on hand</TableHead>
                  <TableHead className="text-right">Requested</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {LINE_ITEMS.map((item) => {
                  const soh = stockOnHand(item)

                  return (
                    <TableRow key={item.code}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{item.product}</span>
                          <span className="font-mono text-xs text-muted-foreground">
                            {item.code}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {NUMBER_FORMAT.format(item.beginningBalance)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {NUMBER_FORMAT.format(item.received)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {NUMBER_FORMAT.format(item.consumed)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        <span className="inline-flex items-center gap-2">
                          {soh <= 0 && (
                            <Badge variant="destructive">Stockout</Badge>
                          )}
                          {NUMBER_FORMAT.format(soh)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {NUMBER_FORMAT.format(item.requested)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>

              <TableFooter>
                <TableRow>
                  <TableHead>Total</TableHead>
                  <TableCell className="text-right tabular-nums">
                    {NUMBER_FORMAT.format(sum((item) => item.beginningBalance))}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {NUMBER_FORMAT.format(sum((item) => item.received))}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {NUMBER_FORMAT.format(sum((item) => item.consumed))}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {NUMBER_FORMAT.format(sum(stockOnHand))}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {NUMBER_FORMAT.format(sum((item) => item.requested))}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>

        <Separator />

        <CardFooter className="justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {LINE_ITEMS.length} full-supply products · Reviewed by A. Banda
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <XIcon data-icon="inline-start" aria-hidden="true" />
              Reject
            </Button>
            <Button>
              <CheckIcon data-icon="inline-start" aria-hidden="true" />
              Approve
            </Button>
          </div>
        </CardFooter>
      </Card>
    </section>
  )
}
