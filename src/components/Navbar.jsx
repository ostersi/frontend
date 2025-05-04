import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../api/axios";
import UserCard from "./UserCard";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await axios.get("/users/me");
        setUser(res.data);
      } catch (err) {
        console.error("Помилка завантаження користувача:", err);
      }
    };
    if (token) fetchMe();
  }, [token]);

  if (!token || !user) return null;

  const role = user.role;
  const fullName = `${user.lastName} ${user.firstName}`;

  const navLinksByRole = {
    USER: [{ path: "/medications", label: "Медикаменти" }],
    PHARMACIST: [
      { path: "/medications", label: "Медикаменти" },
      { path: "/manage-medications", label: "Управління медикаментами" },
      { path: "/clients/manage", label: "Клієнти" },
      { path: "/sales/new", label: "Новий продаж" },
      { path: "/sales/history", label: "Історія продажів" },
      { path: "/prescriptions/all", label: "Всі рецепти" },
    ],
    DOCTOR: [
      { path: "/medications", label: "Медикаменти" },
      { path: "/prescriptions", label: "Рецепти" },
    ],
    ADMIN: [
      { path: "/medications", label: "Медикаменти" },
      { path: "/manage-medications", label: "Управління медикаментами" },
      { path: "/clients/manage", label: "Клієнти" },
      { path: "/sales/history", label: "Історія продажів" },
      { path: "/users/manage", label: "Користувачі" },
      { path: "/prescriptions/all", label: "Всі рецепти" },
      { path: "/audit-log", label: "Аудит" },
    ],
  };

  const roleColors = {
    USER: "bg-blue-900",
    PHARMACIST: "bg-green-900",
    DOCTOR: "bg-purple-900",
    ADMIN: "bg-red-900",
  };

  const navLinks = navLinksByRole[role] || [];
  const navbarColor = roleColors[role] || "bg-gray-900";

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className={`${navbarColor} text-white shadow-md mb-6`}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex gap-3 flex-wrap">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`py-2 px-4 rounded-md text-sm font-medium transition ${
                location.pathname.startsWith(link.path)
                  ? "bg-white text-black"
                  : "hover:bg-white/10"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
        <UserCard fullName={fullName} role={role} />

          <button
            onClick={handleLogout}
            className="bg-white text-black hover:bg-gray-100 py-2 px-4 rounded-md text-sm font-medium"
          >
            Вийти
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
