import ClientModal from "../components/ClientModal";
import { useEffect, useState } from "react";
import axios from "../api/axios";
import Select from "react-select";

function SalesPage() {
  const [clients, setClients] = useState([]);
  const [medications, setMedications] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    clientId: "",
  });
  
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, medsRes] = await Promise.all([
          axios.get("/clients"),
          axios.get("/medications"),
        ]);
        setClients(clientsRes.data);
        setMedications(medsRes.data);
      } catch (err) {
        console.error(err);
        setError("Помилка завантаження даних.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const addToCart = (medication) => {
    const existing = cart.find((item) => item.medicationId === medication.id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.medicationId === medication.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        { medicationId: medication.id, name: medication.name, quantity: 1, priceAtSale: medication.price },
      ]);
    }
  };

  const updateQuantity = (medicationId, quantity) => {
    if (quantity < 1) return;
    setCart(
      cart.map((item) =>
        item.medicationId === medicationId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (medicationId) => {
    setCart(cart.filter((item) => item.medicationId !== medicationId));
  };

  const handleSubmit = async () => {
    try {
      const clientId = form.clientId;

if (!clientId) {
  setError("Потрібно вибрати або створити клієнта.");
  return;
}


      await axios.post("/sales/new", {
        clientId: parseInt(clientId), // <-- виправлено тут!
        items: cart.map((item) => ({
          medicationId: item.medicationId,
          quantity: item.quantity,
          priceAtSale: item.priceAtSale,
        })),
      });
      

      setSuccess("Продаж успішно завершено!");
      setCart([]);
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Помилка оформлення продажу.");
    }
  };

  const totalPrice = cart.reduce((acc, item) => acc + item.priceAtSale * item.quantity, 0);

  if (loading) return <div className="p-4 text-center">Завантаження...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Продаж медикаментів</h1>

      {success && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>
      )}

<div className="mb-4">
<label className="block mb-1 font-medium">Клієнт</label>
<div className="flex gap-2 items-start">
  <div className="flex-1">
    <Select
      options={clients.map((c) => ({
        value: c.id,
        label: c.fullName,
      }))}
      onChange={(selected) =>
        setForm((prev) => ({ ...prev, clientId: selected?.value }))
      }
      placeholder="Пошук клієнта..."
      isClearable
    />
  </div>
  <button
    type="button"
    onClick={() => setShowModal(true)}
    className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded"
  >
    + Новий
  </button>
</div>

</div>

      {/* Додавання медикаментів */}
      <div className="mb-6">
  <h2 className="text-xl font-semibold mb-4">Додати медикамент</h2>

  {/* Поле пошуку */}
  <input
    type="text"
    placeholder="Пошук медикаменту..."
    className="mb-4 w-full md:w-1/3 p-2 border border-gray-300 rounded"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />

  {/* Таблиця в обмеженому контейнері */}
  <div className="border rounded shadow overflow-hidden">
    <table className="w-full">
      <thead className="bg-gray-200 sticky top-0">
        <tr>
          <th className="p-2 text-left">Назва</th>
          <th className="p-2 text-left">Ціна</th>
          <th className="p-2 text-left">В наявності</th>
          <th className="p-2 text-left">Рецепт</th>
          <th className="p-2 text-left">Дії</th>
        </tr>
      </thead>
    </table>
    <div className="overflow-y-auto max-h-64">
      <table className="w-full">
        <tbody>
          {medications
            .filter((med) =>
              med.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((med) => (
              <tr key={med.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{med.name}</td>
                <td className="p-2">{med.price.toFixed(2)} ₴</td>
                <td className="p-2">{med.stock}</td>
                <td className="p-2">
                  {med.requiresPrescription ? "Так" : "Ні"}
                </td>
                <td className="p-2">
                  <button
                    onClick={() => addToCart(med)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Додати
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  </div>
</div>


      {/* Кошик */}
      {cart.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Кошик</h2>
          <table className="w-full bg-white shadow-md rounded-lg">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2">Назва</th>
                <th className="p-2">Кількість</th>
                <th className="p-2">Ціна</th>
                <th className="p-2">Дії</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.medicationId} className="border-b">
                  <td className="p-2">{item.name}</td>
                  <td className="p-2">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(item.medicationId, parseInt(e.target.value))
                      }
                      className="w-16 p-1 border rounded"
                    />
                  </td>
                  <td className="p-2">{item.priceAtSale} ₴</td>
                  <td className="p-2">
                    <button
                      onClick={() => removeFromCart(item.medicationId)}
                      className="text-red-500"
                    >
                      Видалити
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-right mt-4 font-bold text-lg">
            Загальна сума: {totalPrice.toFixed(2)} ₴
          </div>

          <button
            onClick={handleSubmit}
            className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
          >
            Оформити продаж
          </button>
        </div>
      )}
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

export default SalesPage;
