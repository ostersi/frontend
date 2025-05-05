import { useState } from "react";
import axios from "../api/axios";

function ClientModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    fullName: "",
    contactInfo: "",
  });
  const [anonymous, setAnonymous] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = anonymous
        ? {} // Надсилаємо без полів — бекенд сам створить "Клієнт #..."
        : form;

      const res = await axios.post("/clients", payload);
      onCreated(res.data);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Не вдалося створити клієнта.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Новий клієнт</h2>

        <form onSubmit={handleSubmit}>
          <label className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={() => setAnonymous(!anonymous)}
              className="mr-2"
            />
            Анонімний клієнт
          </label>

          {!anonymous && (
            <>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="ПІБ"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
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
            </>
          )}

          {error && (
            <div className="text-red-500 text-sm mb-2">{error}</div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Зберегти
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ClientModal;
