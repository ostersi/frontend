import { useEffect, useState } from "react";
import axios from "../api/axios";

function ManageMedicationsPage() {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    stock: "",
    price: "",
    requiresPrescription: false,
  });
  const [editingId, setEditingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      const response = await axios.get("/medications");
      setMedications(response.data);
    } catch (err) {
      console.error(err);
      setError("Не вдалося завантажити медикаменти.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        stock: parseInt(form.stock),
        price: parseFloat(form.price),
        expirationDate: form.expirationDate
    ? new Date(form.expirationDate)
    : null,
      };

      if (editingId) {
        await axios.put(`/medications/${editingId}`, payload);
      } else {
        await axios.post("/medications", payload);
      }

      setForm({
        name: "",
        description: "",
        stock: "",
        price: "",
        requiresPrescription: false,
        expirationDate: "",
      });
      setEditingId(null);
      fetchMedications();
    } catch (err) {
      console.error(err);
      setError("Помилка збереження медикаменту.");
    }
  };

  const handleEdit = (med) => {
    setForm({
      name: med.name,
      description: med.description,
      stock: med.stock,
      price: med.price,
      requiresPrescription: med.requiresPrescription,
      expirationDate: med.expirationDate
      ? new Date(med.expirationDate).toISOString().split("T")[0] // 🧠 ISO to YYYY-MM-DD
      : "",
    });
    setEditingId(med.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Ти впевнений, що хочеш видалити медикамент?")) {
      try {
        await axios.put(`/medications/${id}/delete`);
        fetchMedications();
      } catch (err) {
        console.error(err);
        setError("Помилка видалення медикаменту.");
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
  const getExpirationStatus = (expirationDate) => {
    if (!expirationDate) return null;
  
    const today = new Date();
    const expDate = new Date(expirationDate);
    const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
  
    if (diffDays <= 0) return "expired"; // прострочено
    if (diffDays <= 30) return "warning"; // < 30 днів
    return "ok";
  };
    
  const filtered = medications
    .filter((m) => m.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (typeof valA === "string") {
        return sortAsc
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      return sortAsc ? valA - valB : valB - valA;
    });

  if (loading) return <div className="p-4 text-center">Завантаження...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Управління медикаментами</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md mb-8 max-w-lg mx-auto"
      >
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? "Редагувати медикамент" : "Додати новий медикамент"}
        </h2>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Назва"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Опис"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="mb-4 flex gap-4">
          <input
            type="number"
            placeholder="Кількість"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
          <input
            type="number"
            placeholder="Ціна"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
  <label className="block mb-1 font-medium">Термін придатності</label>
  <input
    type="date"
    value={form.expirationDate}
    onChange={(e) =>
      setForm({ ...form, expirationDate: e.target.value })
    }
    className="w-full p-2 border border-gray-300 rounded"
  />
</div>

        <div className="mb-4 flex items-center gap-2">
          <input
            id="requiresPrescription"
            type="checkbox"
            checked={form.requiresPrescription}
            onChange={(e) =>
              setForm({ ...form, requiresPrescription: e.target.checked })
            }
          />
          
          <label htmlFor="requiresPrescription">Потребує рецепт</label>
        </div>

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded w-full"
        >
          {editingId ? "Оновити" : "Додати"}
        </button>
      </form>

      {/* 🔍 Пошук і сортування */}
      <div className="mb-4 flex flex-col md:flex-row gap-4 items-center">
        <input
          type="text"
          placeholder="Пошук за назвою..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border border-gray-300 rounded w-full md:w-1/3"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow-md rounded-lg">
          <thead className="bg-gray-200">
            <tr>
              {[
                { key: "name", label: "Назва" },
                { key: "description", label: "Опис" },
                { key: "stock", label: "Кількість" },
                { key: "price", label: "Ціна" },
                { key: "expirationDate", label: "Термін придатності" },
              ].map(({ key, label }) => (
                <th
                  key={key}
                  className="p-3 cursor-pointer hover:underline"
                  onClick={() => toggleSort(key)}
                >
                  {label} {sortKey === key ? (sortAsc ? "▲" : "▼") : ""}
                </th>
              ))}
              <th className="p-3">Рецепт</th>
              <th className="p-3">Дії</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((med) => (
              <tr key={med.id} className="border-b">
                <td className="p-3">{med.name}</td>
                <td className="p-3">{med.description}</td>
                <td className="p-3 text-center">{med.stock}</td>
                <td className="p-3 text-center">{med.price} ₴</td>
                <td className="p-3 text-center">
  {med.expirationDate ? (
    <span
      className={`px-2 py-1 rounded text-white text-xs ${
        getExpirationStatus(med.expirationDate) === "expired"
          ? "bg-red-600"
          : getExpirationStatus(med.expirationDate) === "warning"
          ? "bg-yellow-500"
          : "bg-green-500"
      }`}
    >
      {new Date(med.expirationDate).toLocaleDateString()}
    </span>
  ) : (
    "-"
  )}
</td>



                <td className="p-3 text-center">{med.requiresPrescription ? "Так" : "Ні"}</td>
                <td className="p-3 flex gap-2 ">
                  <button
                    onClick={() => handleEdit(med)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white py-1 px-3 rounded"
                  >
                    Редагувати
                  </button>
                  <button
                    onClick={() => handleDelete(med.id)}
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

export default ManageMedicationsPage;
