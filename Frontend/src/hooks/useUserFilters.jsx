import { useState, useMemo } from "react";

const PAGE_SIZE = 6;

export default function useUserFilters(users) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  function updateFilter(setter, value) {
    setter(value);
    setPage(1);
  }

  function resetFilters() {
    setSearch("");
    setRoleFilter("ALL");
    setStatusFilter("ALL");
    setPage(1);
  }

  function handleSort(column) {
    if (sortBy === column) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortDir("asc");
    }
  }

  const filteredUsers = useMemo(() => {
    let result = users.filter((u) => {
      const matchesSearch =
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && u.isActive) ||
        (statusFilter === "INACTIVE" && !u.isActive);
      return matchesSearch && matchesRole && matchesStatus;
    });

    result = [...result].sort((a, b) => {
      let valA = a[sortBy] ?? "";
      let valB = b[sortBy] ?? "";
      if (sortBy === "createdAt") {
        valA = new Date(valA).getTime() || 0;
        valB = new Date(valB).getTime() || 0;
      } else {
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
      }
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [users, search, roleFilter, statusFilter, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const paginatedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return {
    search, setSearch: (v) => updateFilter(setSearch, v),
    roleFilter, setRoleFilter: (v) => updateFilter(setRoleFilter, v),
    statusFilter, setStatusFilter: (v) => updateFilter(setStatusFilter, v),
    sortBy, sortDir, handleSort,
    page, setPage, totalPages,
    filteredUsers, paginatedUsers,
    resetFilters,
  };
}