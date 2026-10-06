import type { ServiceAccount } from "./service-account"

export const MOCK_SERVICE_ACCOUNTS: ServiceAccount[] = [
  {
    token: "6f1c8e2a-41b7-4f3d-9a0e-5c2d7b8e4f19",
    createdDate: "2026-09-28T14:05:00Z",
  },
  {
    token: "b2d94a17-0c6e-4e8b-a3f5-91d7c2e6a0b4",
    createdDate: "2026-07-11T08:42:00Z",
  },
  {
    token: "1e7a3c90-58f2-4b1d-8c64-2a9f0e3d7b51",
    createdDate: "2025-12-02T16:20:00Z",
  },
  {
    token: "9c4f2b68-d3a1-47e0-b5c9-6e8a1f2d3c70",
    createdDate: "2025-03-19T10:11:00Z",
  },
]

// Stand-ins for the keys the server would create, used in turn.
export const MOCK_NEW_TOKENS = [
  "4a8e1d27-6b3f-4c90-8e15-7d2b9f0a6c38",
  "e07b5c19-2d84-4f6a-a1c3-58e9d0b7f264",
  "73d2f0a8-9e41-4b5c-86d7-1f3a2c9e0b85",
]
