import { useEffect, useState } from "react";
import axios from "../api/axios";

function SalesHistoryPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState("saleDate");
  const [sortAsc, setSortAsc] = useState(false);
  const [pharmacists, setPharmacists] = useState([]);
  const [pharmacistFilter, setPharmacistFilter] = useState("");

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const [salesRes, usersRes] = await Promise.all([
          axios.get("/sales/history"),
          axios.get("/users"), // Використовується для фільтру за фармацевтом
        ]);
        setSales(salesRes.data);
        const onlyPharmacists = usersRes.data.filter((u) => u.role === "PHARMACIST");
        setPharmacists(onlyPharmacists);
      } catch (err) {
        console.error(err);
        setError("Не вдалося завантажити історію продажів.");
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  const toggleSort = (key) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const filtered = sales
    .filter((s) => {
      const pharmacistName = `${s.pharmacist?.userInfo?.firstName || ""} ${s.pharmacist?.userInfo?.lastName || ""}`.toLowerCase();
      const clientName = s.client?.fullName?.toLowerCase() || "";
      return (
        (clientName.includes(searchTerm.toLowerCase()) ||
         pharmacistName.includes(searchTerm.toLowerCase()))
      );
    })
    .filter((s) =>
      pharmacistFilter ? s.pharmacistId === parseInt(pharmacistFilter) : true
    )
    .sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (sortKey === "totalPrice") return sortAsc ? valA - valB : valB - valA;
      if (sortKey === "saleDate") return sortAsc ? new Date(valA) - new Date(valB) : new Date(valB) - new Date(valA);
      if (sortKey === "client") return sortAsc
        ? (a.client?.fullName || "").localeCompare(b.client?.fullName || "")
        : (b.client?.fullName || "").localeCompare(a.client?.fullName || "");
      if (sortKey === "pharmacist") return sortAsc
        ? (a.pharmacist?.userInfo?.lastName || "").localeCompare(b.pharmacist?.userInfo?.lastName || "")
        : (b.pharmacist?.userInfo?.lastName || "").localeCompare(a.pharmacist?.userInfo?.lastName || "");

      return 0;
    });

  if (loading) return <div className="p-4 text-center">Завантаження...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Історія продажів</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Пошук за клієнтом або фармацевтом..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border border-gray-300 rounded w-full md:w-1/3"
        />
        <select
          value={pharmacistFilter}
          onChange={(e) => setPharmacistFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded w-full md:w-1/3"
        >
          <option value="">Усі фармацевти</option>
          {pharmacists.map((p) => (
            <option key={p.id} value={p.id}>
              {p.userInfo?.lastName} {p.userInfo?.firstName}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow-md rounded-lg">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 text-left cursor-pointer" onClick={() => toggleSort("client")}>Клієнт</th>
              <th className="p-3 text-left cursor-pointer" onClick={() => toggleSort("pharmacist")}>Фармацевт</th>
              <th className="p-3 text-left">Медикаменти</th>
              <th className="p-3 text-left cursor-pointer" onClick={() => toggleSort("totalPrice")}>Сума</th>
              <th className="p-3 text-left cursor-pointer" onClick={() => toggleSort("saleDate")}>Дата</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((sale) => (
              <tr key={sale.id} className="border-b">
                <td className="p-3">{sale.client?.fullName || "Невідомо"}</td>
                <td className="p-3">
                  {sale.pharmacist?.userInfo
                    ? `${sale.pharmacist.userInfo.lastName} ${sale.pharmacist.userInfo.firstName}`
                    : "Невідомо"}
                </td>
                <td className="p-3">
                  <ul className="list-disc pl-5">
                    {sale.saleItems.map((item) => (
                      <li key={item.id}>
                        {item.medication.name} x{item.quantity}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="p-3">{sale.totalPrice.toFixed(2)} ₴</td>
                <td className="p-3">{new Date(sale.saleDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SalesHistoryPage;
