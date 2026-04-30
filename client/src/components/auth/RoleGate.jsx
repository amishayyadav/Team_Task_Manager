export default function RoleGate({ role, allow = ["ADMIN"], children, fallback = null }) {
  if (!role) return fallback;
  if (!allow.includes(role)) return fallback;
  return children;
}
