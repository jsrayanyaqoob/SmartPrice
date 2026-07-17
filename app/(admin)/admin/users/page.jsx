"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const searchTimeoutRef = useRef(null);

  const fetchUsers = useCallback(async (q = "") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
        setTotal(data.total || 0);
        if (data.users?.length > 0 && !selectedUser) {
          setSelectedUser(data.users[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => fetchUsers(val), 300);
  };

  const handleUpdateRole = async (userId, newRole) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: "Role updated successfully", type: "success" });
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        if (selectedUser?.id === userId) {
          setSelectedUser((prev) => ({ ...prev, role: newRole }));
        }
      } else {
        setMessage({ text: data.error || "Failed to update role", type: "error" });
      }
    } catch {
      setMessage({ text: "Network error", type: "error" });
    } finally {
      setActionLoading(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        setMessage({ text: "User deleted", type: "success" });
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        setSelectedUser(null);
      }
    } catch {
      setMessage({ text: "Network error", type: "error" });
    } finally {
      setActionLoading(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
      {/* Users List Table */}
      <div className="card admin-fade-in" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Users</h3>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
              Showing {users.length} of {total} users
            </span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              placeholder="Search name, email..."
              className="input"
              style={{ width: 220, height: 32, fontSize: 12 }}
              value={search}
              onChange={handleSearch}
            />
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                const esc = (s) => String(s || "").replace(/"/g, '""');
                const csv = ["Name,Email,Role,Plan,Joined\n"].concat(
                  users.map(u => `"${esc(u.name)}","${esc(u.email)}",${u.role},${u.plan},"${new Date(u.createdAt).toLocaleDateString()}"`)
                ).join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url; a.download = "smartprice-users.csv"; a.click();
                URL.revokeObjectURL(url);
              }}
              disabled={users.length === 0}
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Toast Message */}
        {message.text && (
          <div
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              marginBottom: 14,
              fontSize: 12,
              fontWeight: 600,
              background:
                message.type === "success"
                  ? "rgba(34, 197, 94, 0.1)"
                  : "rgba(239, 68, 68, 0.1)",
              color:
                message.type === "success" ? "var(--success)" : "var(--danger)",
              border: `1px solid ${message.type === "success" ? "var(--success)" : "var(--danger)"}`,
            }}
          >
            {message.text}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 40 }}>
            Loading users...
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", fontSize: 11, color: "var(--text-muted)" }}>
                <th style={{ paddingBottom: 10, fontWeight: 600 }}>USER</th>                  <th className="user-table-col-role" style={{ paddingBottom: 10, fontWeight: 600 }}>ROLE</th>
                <th style={{ paddingBottom: 10, fontWeight: 600 }}>PLAN</th>
                <th className="user-table-col-joined" style={{ paddingBottom: 10, fontWeight: 600 }}>JOINED</th>
                <th className="user-table-col-alerts" style={{ paddingBottom: 10, fontWeight: 600, textAlign: "right" }}>ALERTS</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "20px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                    No users found. Register some accounts first.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    onClick={() => setSelectedUser(u)}
                    style={{
                      borderBottom: "1px solid var(--border)",
                      fontSize: 13,
                      cursor: "pointer",
                      background: selectedUser?.id === u.id ? "var(--bg-surface-2)" : "transparent",
                    }}
                  >
                    <td style={{ padding: "12px 0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: u.role === "Admin" ? "var(--primary)" : "var(--primary-light)",
                            color: u.role === "Admin" ? "white" : "var(--primary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: 12,
                          }}
                        >
                          {(u.name || u.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{u.name || "Anonymous"}</div>
                          <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{u.email}</div>
                        </div>
                      </div>
                    </td>                      <td className="user-table-col-role" style={{ padding: "12px 0" }}>
                        <span
                          className={u.role === "Admin" ? "badge badge-danger" : "badge badge-primary"}
                          style={{ fontSize: 8 }}
                        >
                          {u.role}
                        </span>
                      </td>
                    <td style={{ padding: "12px 0" }}>
                      <span
                        className={u.plan === "PRO" ? "badge badge-pro" : "badge"}
                        style={{ fontSize: 8 }}
                      >
                        {u.plan}
                      </span>
                    </td>
                    <td className="user-table-col-joined" style={{ padding: "12px 0", color: "var(--text-secondary)" }}>
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="user-table-col-alerts" style={{ padding: "12px 0", textAlign: "right", color: "var(--text-muted)" }}>
                      🔔 {u._count?.priceAlerts || 0}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* User Detail Side Panel */}
      <div className="card admin-fade-in-delay-1" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 20 }}>
        {selectedUser ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: selectedUser.role === "Admin" ? "var(--primary)" : "var(--brand-gradient)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 18,
                }}
              >
                {(selectedUser.name || selectedUser.email)[0].toUpperCase()}
              </div>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
                  {selectedUser.name || "No name set"}
                </h4>
                <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
                  {selectedUser.email}
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                  <span
                    className={selectedUser.role === "Admin" ? "badge badge-danger" : "badge badge-primary"}
                    style={{ fontSize: 7 }}
                  >
                    {selectedUser.role}
                  </span>
                  <span className="badge badge-success" style={{ fontSize: 7 }}>
                    {selectedUser.plan}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.04em" }}>
                ACCOUNT INFORMATION
              </span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 10, fontSize: 11 }}>
                <div>
                  <div style={{ color: "var(--text-muted)" }}>Registration Date</div>
                  <div style={{ fontWeight: 600, marginTop: 2 }}>
                    {formatDate(selectedUser.createdAt)}
                  </div>
                </div>
                <div>
                  <div style={{ color: "var(--text-muted)" }}>Last Login</div>
                  <div style={{ fontWeight: 600, marginTop: 2 }}>
                    {formatDate(selectedUser.lastLogin) || "Never"}
                  </div>
                </div>
                <div>
                  <div style={{ color: "var(--text-muted)" }}>Price Alerts</div>
                  <div style={{ fontWeight: 600, marginTop: 2 }}>
                    {selectedUser._count?.priceAlerts || 0}
                  </div>
                </div>
                <div>
                  <div style={{ color: "var(--text-muted)" }}>Wishlist Items</div>
                  <div style={{ fontWeight: 600, marginTop: 2 }}>
                    {selectedUser._count?.wishlist || 0}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.04em" }}>
                CHANGE ROLE
              </span>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button
                  onClick={() => handleUpdateRole(selectedUser.id, "Admin")}
                  disabled={actionLoading || selectedUser.role === "Admin"}
                  className="btn btn-sm"
                  style={{
                    flex: 1,
                    fontSize: 11,
                    background: selectedUser.role === "Admin" ? "var(--primary)" : "transparent",
                    color: selectedUser.role === "Admin" ? "white" : "var(--primary)",
                    border: "1px solid var(--primary)",
                    opacity: actionLoading ? 0.6 : 1,
                  }}
                >
                  Admin
                </button>
                <button
                  onClick={() => handleUpdateRole(selectedUser.id, "Customer")}
                  disabled={actionLoading || selectedUser.role === "Customer"}
                  className="btn btn-sm"
                  style={{
                    flex: 1,
                    fontSize: 11,
                    background: selectedUser.role === "Customer" ? "var(--text-secondary)" : "transparent",
                    color: selectedUser.role === "Customer" ? "white" : "var(--text-secondary)",
                    border: "1px solid var(--border)",
                    opacity: actionLoading ? 0.6 : 1,
                  }}
                >
                  Customer
                </button>
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, display: "grid", gridTemplateColumns: "1fr", gap: 8, marginTop: "auto" }}>
              <button
                onClick={() => handleDeleteUser(selectedUser.id)}
                disabled={actionLoading || selectedUser.email === "rayanyaqoob83@gmail.com"}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: 11, color: "var(--danger)", borderColor: "rgba(239, 68, 68, 0.2)", opacity: actionLoading ? 0.6 : 1 }}
              >
                {actionLoading ? "Processing..." : "Delete User"}
              </button>
              {selectedUser.email === "rayanyaqoob83@gmail.com" && (
                <div style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center" }}>
                  Cannot delete the primary admin account.
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>👤</div>
            <div style={{ fontSize: 13 }}>Select a user to view details</div>
          </div>
        )}
      </div>
    </div>
  );
}
