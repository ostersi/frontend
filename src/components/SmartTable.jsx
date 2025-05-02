import { useState, useMemo } from "react";

function SmartTable({ data, columns, searchableKeys = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState(columns[0]?.key || "");
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();

    const filteredData = data.filter((item) => {
      return searchableKeys.some((key) => {
        const value = String(key.split('.').reduce((obj, prop) => obj?.[prop], item) || "");
        return value.toLowerCase().includes(term);
      });
    });

    return filteredData.sort((a, b) => {
      const valA = sortKey.split('.').reduce((obj, prop) => obj?.[prop], a);
      const valB = sortKey.split('.').reduce((obj, prop) => obj?.[prop], b);

      if (valA == null || valB == null) return 0;

      if (typeof valA === "string")
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);

      if (typeof valA === "number" || valA instanceof Date)
        return sortAsc ? valA - valB : valB - valA;

      return 0;
    });
  }, [data, searchTerm, sortKey, sortAsc, searchableKeys]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Пошук..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border border-gray-300 rounded w-full max-w-md"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow-md rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="p-3 cursor-pointer hover:underline text-left"
                  onClick={() => toggleSort(col.key)}
                >
                  {col.label}
                  {sortKey === col.key ? (sortAsc ? " ▲" : " ▼") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={col.key} className="p-3">
                    {typeof col.render === "function"
                      ? col.render(item)
                      : col.key.split('.').reduce((obj, prop) => obj?.[prop], item) || ""}
                  </td>
                ))}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="p-4 text-center text-gray-500">
                  Нічого не знайдено
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SmartTable;
