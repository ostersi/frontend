import { useEffect, useState } from "react";
import axios from "../api/axios";
import { formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";

function PrescriptionListPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortAsc, setSortAsc] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const res = await axios.get("/prescriptions/all");
        setPrescriptions(res.data);
      } catch (err) {
        console.error(err);
        setError("Не вдалося отримати список рецептів.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  const handleSort = (key) => {
    if (key === sortKey) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const getValue = (rx) => {
    switch (sortKey) {
      case "client":
        return rx.client?.fullName || "";
      case "medication":
        return rx.medication?.name || "";
      case "prescriber":
        return `${rx.prescribedBy?.userInfo?.lastName || ""} ${rx.prescribedBy?.userInfo?.firstName || ""}`;
      case "validUntil":
        return new Date(rx.validUntil).getTime();
      case "createdAt":
        return new Date(rx.createdAt).getTime();
      default:
        return "";
    }
  };

  const filtered = prescriptions
    .filter((rx) => {
      const client = rx.client?.fullName || "";
      const med = rx.medication?.name || "";
      const doc = `${rx.prescribedBy?.userInfo?.lastName || ""} ${rx.prescribedBy?.userInfo?.firstName || ""}`;
      return [client, med, doc]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      const valA = getValue(a);
      const valB = getValue(b);

      if (typeof valA === "string") {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? valA - valB : valB - valA;
    });

  if (loading) return <div className="p-4 text-center">Завантаження...</div>;
  if (error) return <div className="p-4 text-red-500 text-center">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Список всіх рецептів</h1>

      {/* 🔍 Пошук */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Пошук за клієнтом, медикаментом, лікарем..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border border-gray-300 rounded w-full md:w-1/2"
        />
      </div>

      {/* 📋 Таблиця */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow-md rounded-lg">
          <thead className="bg-gray-200 text-left">
            <tr>
              {[
                { label: "Клієнт", key: "client" },
                { label: "Медикамент", key: "medication" },
                { label: "Прописав", key: "prescriber" },
                { label: "Дійсний до", key: "validUntil" },
                { label: "Створено", key: "createdAt" },
              ].map(({ label, key }) => (
                <th
                  key={key}
                  className="p-3 cursor-pointer hover:underline"
                  onClick={() => handleSort(key)}
                >
                  {label} {sortKey === key ? (sortAsc ? "▲" : "▼") : ""}
                </th>
              ))}
              <th className="p-3">Використано / Дозволено</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((rx) => (
              <tr key={rx.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{rx.client?.fullName || "-"}</td>
                <td className="p-3">{rx.medication?.name || "-"}</td>
                <td className="p-3">
                  {rx.prescribedBy?.userInfo
                    ? `${rx.prescribedBy.userInfo.lastName} ${rx.prescribedBy.userInfo.firstName}`
                    : "-"}
                </td>
                <td className="p-3">{new Date(rx.validUntil).toLocaleDateString()}</td>
                <td className="p-3 text-sm text-gray-600">
                  {rx.createdAt
                    ? formatDistanceToNow(new Date(rx.createdAt), {
                        addSuffix: true,
                        locale: uk,
                      })
                    : "-"}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-white font-semibold ${
                      rx.usedUses >= rx.allowedUses
                        ? "bg-red-500"
                        : rx.usedUses > 0
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                  >
                    {rx.usedUses}/{rx.allowedUses}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  Рецептів не знайдено.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PrescriptionListPage;
