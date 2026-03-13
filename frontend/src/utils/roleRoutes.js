export function normalizeRole(role) {
  return String(role || "").trim().toLowerCase();
}

export function getDashboardPathByRole(role) {
  const normalized = normalizeRole(role);
  if (normalized === "admin") return "/dashboard/admin";
  if (normalized === "auditor") return "/dashboard/auditor";
  return "/dashboard";
}
