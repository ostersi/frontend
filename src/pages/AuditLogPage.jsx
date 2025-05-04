import { useEffect, useState } from "react";
import axios from "../api/axios";
import { formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";

const modelOptions = [
  "User",
  "Client",
  "Medication",
  "Sale",
  "Prescription"
];

const actionOptions = ["CREATE", "UPDATE", "DELETE"];

function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get("/audit-log");
        setLogs(res.data);
      } catch (err) {
        console.error(err);
        setError("Не вдалося отримати лог.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  useEffect(() => {
    let result = [...logs];

    if (modelFilter) {
      result = result.filter((log) => log.model === modelFilter);
    }

    if (actionFilter) {
      result = result.filter((log) => log.action === actionFilter);
    }

    if (searchTerm) {
      result = result.filter((log) =>
        `${log.user?.userInfo?.firstName} ${log.user?.userInfo?.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        `${log.entityId}`.includes(searchTerm)
      );
    }

    setFilteredLogs(result);
  }, [logs, searchTerm, modelFilter, actionFilter]);

  if (loading) return <div className="p-4">Завантаження...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Журнал змін (Audit Log)</h1>

      {/* 🧠 Filters */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <input
          type="text"
          placeholder="Пошук за ПІБ або ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded w-full md:w-1/3"
        />

        <select
          value={modelFilter}
          onChange={(e) => setModelFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">Усі моделі</option>
          {modelOptions.map((model) => (
            <option key={model} value={model}>{model}</option>
          ))}
        </select>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">Усі дії</option>
          {actionOptions.map((action) => (
            <option key={action} value={action}>{action}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow rounded text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 text-left">Дата</th>
              <th className="p-3 text-left">Модель</th>
              <th className="p-3 text-left">Дія</th>
              <th className="p-3 text-left">Користувач</th>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Зміни</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id} className="border-b">
                <td className="p-3">
                  {formatDistanceToNow(new Date(log.timestamp), {
                    addSuffix: true,
                    locale: uk,
                  })}
                </td>
                <td className="p-3">{log.model}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-white ${
                      log.action === "CREATE"
                        ? "bg-green-500"
                        : log.action === "UPDATE"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  >
                    {log.action}
                  </span>
                </td>
                <td className="p-3">
                  {log.user?.userInfo
                    ? `${log.user.userInfo.lastName} ${log.user.userInfo.firstName}`
                    : "-"}
                </td>
                <td className="p-3">{log.entityId || "-"}</td>
                <td className="p-3 break-all whitespace-pre-wrap">
                  {log.action === "UPDATE"
                    ? `До: ${JSON.stringify(log.dataBefore, null, 2)}\nПісля: ${JSON.stringify(
                        log.dataAfter,
                        null,
                        2
                      )}`
                    : JSON.stringify(log.dataAfter, null, 2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AuditLogPage;
