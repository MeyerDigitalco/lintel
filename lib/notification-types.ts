export const NOTIFICATION_TYPES = [
  { type: "fault_reported", label: "New fault reported by a tenant" },
  { type: "maintenance_status", label: "Maintenance status updates" },
  { type: "rent_confirmed", label: "Rent received" },
] as const;
