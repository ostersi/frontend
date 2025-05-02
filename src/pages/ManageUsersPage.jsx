import { useEffect, useState } from "react";
import axios from "../api/axios";

function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "USER",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    address: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [oldPassword, setOldPassword] = useState("");
const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/users");
      setUsers(response.data);
    } catch (err) {
      console.error(err);
      setError("Не вдалося завантажити користувачів.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Простий email формат
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
    if (!form.email || !emailRegex.test(form.email)) {
      alert("Введи коректний email.");
      return;
    }
  
    if (!editingId && (!form.password || form.password.length < 6)) {
      alert("Пароль обов'язковий (мінімум 6 символів).");
      return;
    }
  
    if (!form.firstName.trim()) {
      alert("Ім’я обов’язкове.");
      return;
    }
  
    if (!form.lastName.trim()) {
      alert("Прізвище обов’язкове.");
      return;
    }
  
    try {
      if (editingId) {
        await axios.put(`/users/${editingId}`, {
          email: form.email,
          password: form.password || undefined,
          role: form.role,
          firstName: form.firstName,
          lastName: form.lastName,
          phoneNumber: form.phoneNumber,
          address: form.address,
        });
      } else {
        await axios.post("/users", form);
      }
  
      setForm({
        email: "",
        password: "",
        role: "USER",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        address: "",
      });
  
      setEditingId(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
      setError("Помилка збереження користувача.");
    }
  };
  
  

  const handleEdit = (user) => {
    setForm({
      email: user.email,
      password: "",
      role: user.role,
      firstName: user.userInfo?.firstName || "",
      lastName: user.userInfo?.lastName || "",
      phoneNumber: user.userInfo?.phoneNumber || "",
      address: user.userInfo?.address || "",
    });
    setEditingId(user.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Ти впевнений, що хочеш видалити користувача?")) {
      try {
        await axios.delete(`/users/${id}`);
        fetchUsers();
      } catch (err) {
        console.error(err);
        setError("Помилка видалення користувача.");
      }
    }
  };

  if (loading) return <div className="p-4 text-center">Завантаження...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Управління користувачами</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md mb-8 max-w-lg mx-auto"
      >
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? "Редагувати користувача" : "Додати нового користувача"}
        </h2>

        <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {!editingId && (
          <div className="mb-4">
            <input
              type="password"
              placeholder="Пароль"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        )}
        
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
  <input
    type="text"
    placeholder="Прізвище"
    value={form.lastName}
    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
    className="w-full p-2 border border-gray-300 rounded"
    required
  />
  <input
    type="text"
    placeholder="Ім'я"
    value={form.firstName}
    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
    className="w-full p-2 border border-gray-300 rounded"
    required
  />
</div>

<div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
  <input
    type="text"
    placeholder="Номер телефону"
    value={form.phoneNumber}
    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
    className="w-full p-2 border border-gray-300 rounded"
  />
  <input
    type="text"
    placeholder="Адреса"
    value={form.address}
    onChange={(e) => setForm({ ...form, address: e.target.value })}
    className="w-full p-2 border border-gray-300 rounded"
  />
</div>


        <div className="mb-4">
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            required
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="USER">USER</option>
            <option value="PHARMACIST">PHARMACIST</option>
            <option value="DOCTOR">DOCTOR</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>



        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          {editingId ? "Оновити" : "Додати"}
        </button>
      </form>

      {editingId && (
  <form
    onSubmit={async (e) => {
      e.preventDefault();
      try {
        await axios.put(`/users/${editingId}/change-password`, {
          oldPassword,
          newPassword,
        });
        alert("Пароль успішно змінено!");
        setOldPassword("");
        setNewPassword("");
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || "Помилка зміни пароля.");
      }
    }}
    className="bg-white p-6 rounded shadow-md mb-8 max-w-lg mx-auto"
  >
    <h2 className="text-xl font-semibold mb-4">Змінити пароль</h2>

    <div className="mb-4">
      <input
        type="password"
        placeholder="Старий пароль"
        value={oldPassword}
        onChange={(e) => setOldPassword(e.target.value)}
        required
        className="w-full p-2 border border-gray-300 rounded"
      />
    </div>

    <div className="mb-4">
      <input
        type="password"
        placeholder="Новий пароль"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
        className="w-full p-2 border border-gray-300 rounded"
      />
    </div>

    <button
      type="submit"
      className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded"
    >
      Оновити пароль
    </button>
  </form>
)}

      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow-md rounded-lg">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3">Email</th>
              <th className="p-3">Роль</th>
              <th className="p-3">Ім'я та Прізвище</th>
              <th className="p-3">Дії</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b">
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.role}</td>
                <td className="p-3">
                  {user.userInfo ? `${user.userInfo.firstName} ${user.userInfo.lastName}` : "-"}
                </td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white py-1 px-3 rounded"
                  >
                    Редагувати
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
                  >
                    Видалити
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageUsersPage;
