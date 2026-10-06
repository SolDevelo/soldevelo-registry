import type { KitProduct } from "./kit-products-dialog/kit-products-dialog"
import type { Approval } from "./product-approval-dialog/approval-form"
import type { Product } from "./product-general-form/product-form"
import type { KitChild } from "./product-kit-unpack-list/kit-form"
import type {
  NamedOption,
  ProgramLink,
} from "./product-program-link-dialog/program-link-form"

export const MOCK_PRODUCT: Product = {
  id: "kit-delivery",
  productCode: "K100",
  fullProductName: "Clean Delivery Kit",
  description: "Everything a birth attendant needs for one clean delivery.",
  dispensingUnit: "kit",
  netContent: 1,
  packRoundingThreshold: 0,
  roundToZero: false,
}

const ASPIRIN: KitProduct = {
  id: "p-aspirin",
  productCode: "C100",
  fullProductName: "Acetylsalicylic Acid",
  dispensingUnit: "10 tab strip",
}
const GAUZE: KitProduct = {
  id: "p-gauze",
  productCode: "C101",
  fullProductName: "Gauze Bandage",
  dispensingUnit: "each",
}
const GLOVES: KitProduct = {
  id: "p-gloves",
  productCode: "C102",
  fullProductName: "Surgical Gloves",
  dispensingUnit: "pair",
}
const CORD_CLAMP: KitProduct = {
  id: "p-clamp",
  productCode: "C105",
  fullProductName: null,
}

/** Every product, for Add Products and to refuse a code another product has. */
export const MOCK_PRODUCTS: KitProduct[] = [
  {
    id: MOCK_PRODUCT.id,
    productCode: MOCK_PRODUCT.productCode,
    fullProductName: MOCK_PRODUCT.fullProductName,
  },
  ASPIRIN,
  GAUZE,
  GLOVES,
  {
    id: "p-oxytocin",
    productCode: "C103",
    fullProductName: "Oxytocin",
    dispensingUnit: "ampoule",
  },
  {
    id: "p-condom",
    productCode: "C104",
    fullProductName: "Male Condom",
    dispensingUnit: "each",
  },
  CORD_CLAMP,
]

export const MOCK_KIT_CHILDREN: KitChild[] = [
  { product: GLOVES, quantity: 2 },
  { product: GAUZE, quantity: 10 },
  { product: CORD_CLAMP, quantity: 1 },
]

export const MOCK_PROGRAMS: NamedOption[] = [
  { id: "family-planning", name: "Family Planning" },
  { id: "essential-meds", name: "Essential Meds" },
  { id: "maternal-health", name: "Maternal Health" },
  { id: "epi", name: "EPI" },
]

export const MOCK_CATEGORIES: NamedOption[] = [
  { id: "kits", name: "Kits" },
  { id: "surgical", name: "Surgical Supplies" },
  { id: "medicines", name: "Medicines" },
]

export const MOCK_FACILITY_TYPES: NamedOption[] = [
  { id: "health-center", name: "Health Center" },
  { id: "district-hospital", name: "District Hospital" },
  { id: "warehouse", name: "Warehouse" },
]

export const MOCK_LINKS: ProgramLink[] = [
  {
    programId: "maternal-health",
    categoryId: "kits",
    fullSupply: true,
    dosesPerPatient: 1,
    displayOrder: 1,
    pricePerPack: 12.5,
  },
  {
    programId: "essential-meds",
    categoryId: "surgical",
    active: false,
    fullSupply: false,
    dosesPerPatient: null,
    displayOrder: 4,
    pricePerPack: null,
  },
]

export const MOCK_APPROVALS: Approval[] = [
  {
    id: "health-center-maternal-health",
    facilityType: { id: "health-center", name: "Health Center" },
    program: { id: "maternal-health", name: "Maternal Health" },
    maxPeriodsOfStock: 3,
    emergencyOrderPoint: 0.5,
    minPeriodsOfStock: 1,
  },
  {
    id: "district-hospital-maternal-health",
    facilityType: { id: "district-hospital", name: "District Hospital" },
    program: { id: "maternal-health", name: "Maternal Health" },
    maxPeriodsOfStock: 4,
    emergencyOrderPoint: null,
    minPeriodsOfStock: 2,
  },
  {
    id: "district-hospital-essential-meds",
    facilityType: { id: "district-hospital", name: "District Hospital" },
    program: { id: "essential-meds", name: "Essential Meds" },
    maxPeriodsOfStock: 2.5,
    emergencyOrderPoint: 1,
    minPeriodsOfStock: null,
  },
]
