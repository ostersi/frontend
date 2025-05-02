import { useState } from "react";
import axios from "../api/axios";

function ClientModal({ onClose, onCreated }) {
  const [fullName, setFullName] = useState("");
  const [contactInfo, setContactInfo] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/clients", {
        fullName,
        contactInfo,
      });
      onCreated(res.data); // передаємо новий клієнт назад
      onClose();
    } catch (err) {
      console.error("Помилка створення клієнта:", err);
      alert("Помилка створення клієнта.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Новий клієнт</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Повне ім'я"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
          <input
            type="text"
            placeholder="Контактна інформація"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white"
            >
              Додати
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ClientModal;
