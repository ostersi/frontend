import { useEffect, useState } from "react";
import axios from "../api/axios";

function MedicationsPage() {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortAsc, setSortAsc] = useState(true);

  const [filterNeedsPrescription, setFilterNeedsPrescription] = useState(false);
  const [filterNoPrescription, setFilterNoPrescription] = useState(false);

  useEffect(() => {
    const fetchMedications = async () => {
      try {
        const res = await axios.get("/medications");
        const today = new Date();

      const filtered = res.data.filter((med) => {
        if (!med.expirationDate) return true; 
        return new Date(med.expirationDate) >= today;
      });

      setMedications(filtered);
      } catch (err) {
        console.error("Помилка завантаження медикаментів:", err);
        setError("Не вдалося завантажити медикаменти.");
      } finally {
        setLoading(false);
      }
    };
    fetchMedications();
  }, []);

  const filteredMedications = medications
    .filter((med) =>
      med.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((med) => {
      if (filterNeedsPrescription && !filterNoPrescription)
        return med.requiresPrescription === true;
      if (!filterNeedsPrescription && filterNoPrescription)
        return med.requiresPrescription === false;
      if (filterNeedsPrescription && filterNoPrescription)
        return true;
      return true; // обидва викл. = показати всі
    })
    .sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (typeof valA === "string") {
        return sortAsc
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      } else {
        return sortAsc ? valA - valB : valB - valA;
      }
    });

  if (loading) return <div className="p-4 text-center">Завантаження...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Список медикаментів</h1>

      {/* 🔍 Пошук і фільтри */}
      <div className="flex flex-col md:flex-row gap-4 mb-4 items-center">
        <input
          type="text"
          placeholder="Пошук за назвою..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border border-gray-300 rounded w-full md:w-1/3"
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filterNeedsPrescription}
            onChange={(e) => setFilterNeedsPrescription(e.target.checked)}
          />
          Потребує рецепт
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filterNoPrescription}
            onChange={(e) => setFilterNoPrescription(e.target.checked)}
          />
          Без рецепта
        </label>
      </div>

      {/* 📋 Таблиця */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow-md rounded-lg">
          <thead className="bg-gray-200">
            <tr>
              {[
                { key: "name", label: "Назва" },
                { key: "description", label: "Опис" },
                { key: "stock", label: "Кількість" },
                { key: "price", label: "Ціна" },
              ].map(({ key, label }) => (
                <th
                  key={key}
                  className="p-3 cursor-pointer hover:underline"
                  onClick={() => {
                    if (sortKey === key) setSortAsc(!sortAsc);
                    else {
                      setSortKey(key);
                      setSortAsc(true);
                    }
                  }}
                >
                  {label} {sortKey === key ? (sortAsc ? "▲" : "▼") : ""}
                </th>
              ))}
              <th className="p-3 ">Рецепт</th>
            </tr>
          </thead>
          <tbody>
            {filteredMedications.map((med) => (
              <tr key={med.id} className="border-b">
                <td className="p-3">{med.name}</td>
                <td className="p-3">{med.description}</td>
                <td className="p-3 text-center">{med.stock}</td>
                <td className="p-3 text-center">{med.price.toFixed(2)} ₴</td>
                <td className="p-3 text-center">
                  {med.requiresPrescription ? "✅" : "❌"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MedicationsPage;
