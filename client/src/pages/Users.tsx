import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import Modal from "@organisms/Modal/Modal";
import UserList from "@organisms/UserList/UserList";
import Button from "@atoms/Button";
import Select from "@atoms/Select";
import FormField from "@molecules/FormField/FormField";
import { userApi, type UserProfile } from "@api/userApi";
import { ROLES } from "@utils/constants";

/* ── User Form Modal ── */

interface UserFormState {
  name: string;
  email: string;
  password: string;
  role: string;
}

const EMPTY_FORM: UserFormState = {
  name: "",
  email: "",
  password: "",
  role: "member",
};

export default function Users() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<UserFormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  function handleAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  }

  function handleEdit(user: UserProfile) {
    setEditing(user);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setFormOpen(true);
  }

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (editing) {
        const payload: Record<string, string> = {
          name: form.name,
          email: form.email,
          role: form.role,
        };
        await userApi.update(editing._id, payload);
        toast.success("User updated");
      } else {
        await userApi.create({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        });
        toast.success("User created");
      }

      setFormOpen(false);
      setRefreshKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
  }

  const roleOptions = ROLES.map((r) => ({ value: r, label: r.charAt(0).toUpperCase() + r.slice(1) }));

  return (
    <div>
      <div className="page-header">
        <h1 className="text-page-title">Users</h1>
        <p className="text-page-subtitle">Manage team members</p>
      </div>

      <UserList
        onAdd={handleAdd}
        onEdit={handleEdit}
        refreshKey={refreshKey}
      />

      {/* Create / Edit Modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit User" : "Add User"}
        subtitle={editing ? "Update user details" : "Invite a new team member"}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setFormOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" loading={loading} onClick={handleSubmit}>
              {editing ? "Update" : "Create"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField
            label="Full Name"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Jane Doe"
            required
          />

          <FormField
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="jane@company.com"
            required
          />

          {!editing && (
            <FormField
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              placeholder="Min 8 characters"
              minLength={8}
              required
            />
          )}

          <FormField label="Role" required>
            <Select
              value={form.role}
              onChange={(e) => updateField("role", e.target.value)}
              options={roleOptions}
              placeholder=""
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
}
