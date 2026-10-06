import type { LotProduct } from "./lot-form-dialog/lot-form"
import type { LotRow } from "./lots-table/lots"

export const MOCK_PRODUCTS: LotProduct[] = [
  { id: "p-bcg", productCode: "C100", fullProductName: "BCG Vaccine" },
  {
    id: "p-mr",
    productCode: "C101",
    fullProductName: "Measles Rubella Vaccine, 10 dose vial",
  },
  { id: "p-pcv", productCode: "C102", fullProductName: "PCV-13" },
  { id: "p-opv", productCode: "C103", fullProductName: "Oral Polio Vaccine" },
  {
    id: "p-penta",
    productCode: "C104",
    fullProductName: "Pentavalent Vaccine",
  },
  { id: "p-rota", productCode: "C105", fullProductName: "Rotavirus Vaccine" },
  { id: "p-tt", productCode: "C106", fullProductName: "Tetanus Toxoid" },
  {
    id: "p-syringe",
    productCode: "S200",
    fullProductName: "AD Syringe 0.5 ml",
  },
]

const product = (id: string) =>
  MOCK_PRODUCTS.find((item) => item.id === id) ?? null

const LOT_SEEDS: [string, string, string | null, string | null][] = [
  ["p-bcg", "BCG-2026-A1", "2027-03-31", "2025-09-15"],
  ["p-bcg", "BCG-2026-A2", "2027-06-30", "2025-12-01"],
  ["p-mr", "MR-0425", "2026-12-01", null],
  ["p-mr", "MR-0612", "2027-08-20", "2026-02-10"],
  ["p-pcv", "PCV13-7781", "2028-01-15", "2025-11-02"],
  ["p-pcv", "PCV13-7802", "2028-04-01", "2026-01-20"],
  ["p-opv", "OPV-B33", "2026-11-15", "2025-05-05"],
  ["p-penta", "PENTA-2291", "2027-02-28", "2025-08-12"],
  ["p-penta", "PENTA-2310", "2027-10-31", null],
  ["p-rota", "ROTA-118", "2027-05-31", "2025-10-01"],
  ["p-tt", "TT-55A", "2029-01-01", "2026-03-15"],
  ["p-syringe", "ADS-9001", null, "2026-04-01"],
]

export const MOCK_LOTS: LotRow[] = [
  ...LOT_SEEDS.map(
    ([productId, lotCode, expirationDate, manufactureDate], index) => ({
      id: `lot-${index + 1}`,
      lotCode,
      active: true,
      tradeItemId: `trade-${productId}`,
      expirationDate,
      manufactureDate,
      product: product(productId),
    })
  ),
  // No product has this trade item, so the table says so.
  {
    id: "lot-orphan",
    lotCode: "LEGACY-0001",
    active: true,
    tradeItemId: "trade-retired",
    expirationDate: "2026-12-31",
    manufactureDate: null,
    product: null,
  },
]
