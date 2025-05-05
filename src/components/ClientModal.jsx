import { useState, useEffect } from "react";
import axios from "../api/axios";
import ErrorMessage from "./ErrorMessage";

function ClientModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    fullName: "",
    contactInfo: "",
  });
  const [anonymous, setAnonymous] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => setError(""), 3000);
      return () => clearTimeout(timeout);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!anonymous) {
      if (!form.fullName.trim()) {
        setError("Поле 'ПІБ' обов’язкове.");
        return;
      }
      if (!form.contactInfo.trim()) {
        setError("Поле 'Контактна інформація' обов’язкове.");
        return;
      }
    }

    try {
      setIsSubmitting(true);

      const payload = anonymous
        ? {} // Сервер сам сформує дані
        : {
            fullName: form.fullName.trim(),
            contactInfo: form.contactInfo.trim(),
          };

      const res = await axios.post("/clients", payload);
      onCreated(res.data);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Не вдалося створити клієнта.");
    } finally {
      setIsSubmitting(false);
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

          <ErrorMessage message={error} />

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded"
              disabled={isSubmitting}
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Збереження..." : "Зберегти"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ClientModal;
