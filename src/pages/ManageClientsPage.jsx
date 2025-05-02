import { useEffect, useState } from "react";
import axios from "../api/axios";

function ManageClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    contactInfo: "",
  });
  const [editingId, setEditingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState("fullName");
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get("/clients");
      setClients(response.data);
    } catch (err) {
      console.error(err);
      setError("Не вдалося завантажити клієнтів.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/clients/${editingId}`, form);
      } else {
        await axios.post("/clients", form);
      }
      setForm({ fullName: "", contactInfo: "" });
      setEditingId(null);
      fetchClients();
    } catch (err) {
      console.error(err);
      setError("Помилка збереження клієнта.");
    }
  };

  const handleEdit = (client) => {
    setForm({
      fullName: client.fullName,
      contactInfo: client.contactInfo,
    });
    setEditingId(client.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Ти впевнений, що хочеш видалити клієнта?")) {
      try {
        await axios.delete(`/clients/${id}`); // Або soft delete: axios.put(`/clients/${id}/delete`)
        fetchClients();
      } catch (err) {
        console.error(err);
        setError("Помилка видалення клієнта.");
      }
    }
  };

  const toggleSort = (key) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const filtered = clients
    .filter((c) => c.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      return sortAsc
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });

  if (loading) return <div className="p-4 text-center">Завантаження...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Управління клієнтами</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md mb-8 max-w-lg mx-auto"
      >
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? "Редагувати клієнта" : "Додати нового клієнта"}
        </h2>

        <div className="mb-4">
          <input
            type="text"
            placeholder="ПІБ клієнта"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Контактна інформація"
            value={form.contactInfo}
            onChange={(e) =>
              setForm({ ...form, contactInfo: e.target.value })
            }
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          {editingId ? "Оновити" : "Додати"}
        </button>
      </form>

      {/* 🔎 Пошук */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Пошук за ПІБ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border border-gray-300 rounded w-full max-w-md"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow-md rounded-lg">
          <thead className="bg-gray-200">
            <tr>
              <th
                className="p-3 cursor-pointer hover:underline"
                onClick={() => toggleSort("fullName")}
              >
                ПІБ {sortKey === "fullName" ? (sortAsc ? "▲" : "▼") : ""}
              </th>
              <th
                className="p-3 cursor-pointer hover:underline"
                onClick={() => toggleSort("contactInfo")}
              >
                Контакт {sortKey === "contactInfo" ? (sortAsc ? "▲" : "▼") : ""}
              </th>
              <th className="p-3">Дії</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((client) => (
              <tr key={client.id} className="border-b">
                <td className="p-3">{client.fullName}</td>
                <td className="p-3">{client.contactInfo}</td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => handleEdit(client)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white py-1 px-3 rounded"
                  >
                    Редагувати
                  </button>
                  <button
                    onClick={() => handleDelete(client.id)}
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

export default ManageClientsPage;
