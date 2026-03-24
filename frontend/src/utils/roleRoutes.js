export function normalizeRole(role) {
  return String(role || "").trim().toLowerCase();
}

export function getDashboardPathByRole(role) {
  const normalized = normalizeRole(role);
  if (normalized === "admin") return "/dashboard/admin";
  if (normalized === "auditor") return "/dashboard/auditor";
  if (["is division", "is_division", "is-division", "isdivision"].includes(normalized)) return "/dashboard/is-division";
  if (["tech centre", "tech_centre", "tech-centre", "techcentre"].includes(normalized)) return "/dashboard/tech-centre";
  return "/dashboard";
}
