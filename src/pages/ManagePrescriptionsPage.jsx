import { useEffect, useState } from "react";
import axios from "../api/axios";
import ClientModal from "../components/ClientModal";
import Select from "react-select";
import ErrorMessage from "../components/ErrorMessage";

function ManagePrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [clients, setClients] = useState([]);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    clientId: "",
    medicationId: "",
    prescribedById: "",
    validUntil: "",
    allowedUses: 1,
  });

  useEffect(() => {
    fetchPrescriptions();

    const fetchMedications = async () => {
      try {
        const res = await axios.get("/medications/prescription-required");
        setMedications(res.data);
      } catch (err) {
        console.error("Помилка завантаження медикаментів:", err);
        setError("Не вдалося завантажити медикаменти.");
      } finally {
        setLoading(false);
      }
    };

    const fetchClients = async () => {
      try {
        const res = await axios.get("/clients");
        setClients(res.data);
      } catch (err) {
        console.error("Помилка завантаження клієнтів:", err);
        setError("Не вдалося завантажити клієнтів.");
      } finally {
        setLoading(false);
      }
    };

    fetchMedications();
    fetchClients();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const res = await axios.get("/prescriptions");
      setPrescriptions(res.data);
    } catch (err) {
      console.error("Помилка отримання рецептів:", err);
      setError("Не вдалося завантажити рецепти.");
    }
  };

  const fetchData = async () => {
    try {
      const [presRes, clientsRes, medsRes] = await Promise.all([
        axios.get("/prescriptions"),
        axios.get("/clients"),
        axios.get("/medications"),
      ]);
      setPrescriptions(presRes.data);
      setClients(clientsRes.data);
      setMedications(medsRes.data);
    } catch (err) {
      console.error(err);
      setError("Не вдалося завантажити дані.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.clientId || !form.medicationId || !form.validUntil || !form.allowedUses) {
      setError("Заповніть усі поля перед створенням рецепта.");
      return;
    }

    try {
      await axios.post("/prescriptions", {
        ...form,
        clientId: parseInt(form.clientId),
        medicationId: parseInt(form.medicationId),
        prescribedById: parseInt(form.prescribedById), // може бути автоматично з JWT
        allowedUses: parseInt(form.allowedUses),
        validUntil: new Date(form.validUntil),
      });

      setForm({
        clientId: "",
        medicationId: "",
        prescribedById: "",
        validUntil: "",
        allowedUses: 1,
      });
      fetchData();
    } catch (err) {
      console.error(err);
      setError("Помилка створення рецепта.");
    }
  };

  if (loading) return <div className="p-4 text-center">Завантаження...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Управління рецептами</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md mb-8 max-w-2xl mx-auto"
      >
        <h2 className="text-xl font-semibold mb-4">Створити новий рецепт</h2>

        <ErrorMessage message={error} />

        <div className="mb-4">
          <label className="block mb-1 font-medium">Клієнт</label>
          <div className="flex gap-2">
            <Select
              options={clients.map((c) => ({ value: c.id, label: c.fullName }))}
              onChange={(selected) =>
                setForm((prev) => ({ ...prev, clientId: selected?.value }))
              }
              placeholder="Пошук клієнта..."
              isClearable
              className="flex-1 border-gray-300 rounded"
            />
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded"
            >
              + Новий
            </button>
          </div>
        </div>

        <div className="mb-4">
          <Select
            options={medications.map((m) => ({ value: m.id, label: m.name }))}
            onChange={(selected) =>
              setForm((prev) => ({ ...prev, medicationId: selected?.value }))
            }
            placeholder="Пошук медикаменту..."
            isClearable
            className="flex-1 border-gray-300 rounded"
          />
        </div>

        <div className="mb-4">
          <input
            type="number"
            min="1"
            placeholder="Кількість дозволених використань"
            value={form.allowedUses}
            onChange={(e) =>
              setForm({ ...form, allowedUses: e.target.value })
            }
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>

        <div className="mb-4">
          <input
            type="date"
            value={form.validUntil}
            onChange={(e) =>
              setForm({ ...form, validUntil: e.target.value })
            }
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        >
          Створити рецепт
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow-md rounded-lg">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3">Клієнт</th>
              <th className="p-3">Медикамент</th>
              <th className="p-3">Дійсний до</th>
              <th className="p-3">Використано / Дозволено</th>
            </tr>
          </thead>
          <tbody>
            {prescriptions.map((prescription) => (
              <tr key={prescription.id} className="border-b">
                <td className="p-3">
                  {prescription.client?.fullName || "-"}
                </td>
                <td className="p-3">
                  {prescription.medication?.name || "-"}
                </td>
                <td className="p-3">
                  {new Date(prescription.validUntil).toLocaleDateString()}
                </td>
                <td className="p-3 font-semibold">
                  <span
                    className={`px-2 py-1 rounded text-white ${
                      prescription.usedUses >= prescription.allowedUses
                        ? "bg-red-500"
                        : prescription.usedUses > 0
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                  >
                    {prescription.usedUses}/{prescription.allowedUses}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <ClientModal
          onClose={() => setShowModal(false)}
          onCreated={(newClient) => {
            setClients((prev) => [...prev, newClient]);
            setForm((prev) => ({ ...prev, clientId: newClient.id }));
          }}
        />
      )}
    </div>
  );
}

export default ManagePrescriptionsPage;
