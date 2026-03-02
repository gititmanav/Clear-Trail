import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Button from "@atoms/Button";
import Badge from "@atoms/Badge";
import Avatar from "@atoms/Avatar";
import IconButton from "@atoms/IconButton";
import Spinner from "@atoms/Spinner";
import SearchBar from "@molecules/SearchBar/SearchBar";
import EmptyState from "@molecules/EmptyState/EmptyState";
import ConfirmDialog from "@molecules/ConfirmDialog/ConfirmDialog";
import { userApi, type UserProfile } from "@api/userApi";
import { useAuth } from "@hooks/useAuth";
import { useDebounce } from "@hooks/useDebounce";
import { formatDate } from "@utils/formatDate";

/* ── Types ── */

interface UserListProps {
  onAdd: () => void;
  onEdit: (user: UserProfile) => void;
  refreshKey?: number;
}

const roleBadgeVariant: Record<string, "brand" | "success" | "default"> = {
  owner: "brand",
  admin: "success",
  member: "default",
};

/* ── Component ── */

export default function UserList({ onAdd, onEdit, refreshKey = 0 }: UserListProps) {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // Delete
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userApi.getAll();
      setUsers(data.users || data);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  }, [refreshKey]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Client-side search filter
  const filtered = debouncedSearch
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          u.email.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : users;

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await userApi.delete(deleteId);
      setDeleteId(null);
      fetchUsers();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-card">
      {/* Toolbar */}
      <div className="px-5 py-4 border-b border-surface-100">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by name or email..."
            className="flex-1 max-w-xs"
          />
          <div className="sm:ml-auto">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={16} />}
              onClick={onAdd}
            >
              Add User
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Spinner centered />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No users found"
          description={
            search
              ? "Try adjusting your search"
              : "Start by adding team members"
          }
          actionLabel={!search ? "Add User" : undefined}
          onAction={!search ? onAdd : undefined}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 bg-surface-50">
                <th className="cell-padding text-label text-left">User</th>
                <th className="cell-padding text-label text-left">Email</th>
                <th className="cell-padding text-label text-left">Role</th>
                <th className="cell-padding text-label text-left">Joined</th>
                <th className="cell-padding text-label text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u._id}
                  className="border-b border-surface-100 hover:bg-surface-50 transition-colors"
                >
                  {/* Name + Avatar */}
                  <td className="cell-padding">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} size="sm" />
                      <span className="text-sm font-medium text-surface-900">
                        {u.name}
                        {u._id === currentUser?._id && (
                          <span className="text-xs text-surface-400 ml-1.5">(you)</span>
                        )}
                      </span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="cell-padding text-sm text-surface-600">{u.email}</td>

                  {/* Role */}
                  <td className="cell-padding">
                    <Badge
                      variant={roleBadgeVariant[u.role] || "default"}
                      size="sm"
                    >
                      {u.role}
                    </Badge>
                  </td>

                  {/* Joined */}
                  <td className="cell-padding text-sm text-surface-500">
                    {formatDate(u.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="cell-padding">
                    <div className="flex-row-gap justify-end" style={{ gap: "0.25rem" }}>
                      <IconButton
                        icon={<Pencil size={15} />}
                        variant="brand"
                        size="sm"
                        aria-label={`Edit ${u.name}`}
                        onClick={() => onEdit(u)}
                      />
                      {/* Owners can't be deleted, and you can't delete yourself */}
                      {u.role !== "owner" && u._id !== currentUser?._id && (
                        <IconButton
                          icon={<Trash2 size={15} />}
                          variant="danger"
                          size="sm"
                          aria-label={`Delete ${u.name}`}
                          onClick={() => setDeleteId(u._id)}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      {!loading && filtered.length > 0 && (
        <div className="px-5 py-3 border-t border-surface-100">
          <span className="text-xs text-surface-500">
            {filtered.length} user{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteId}
        title="Remove User"
        message="This will permanently remove this user and cannot be undone."
        confirmLabel="Remove"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
