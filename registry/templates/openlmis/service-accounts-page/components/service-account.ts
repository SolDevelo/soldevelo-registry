/** An API key; `token` is the key an integration sends, and it never expires. */
export type ServiceAccount = {
  token: string
  /** When it was added, as an ISO date and time. */
  createdDate: string
}
