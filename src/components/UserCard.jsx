import React from "react";

const roleIcons = {
  USER: "👤",
  PHARMACIST: "💊",
  DOCTOR: "🩺",
  ADMIN: "🛡️",
};

const roleTitles = {
  USER: "Користувач",
  PHARMACIST: "Фармацевт",
  DOCTOR: "Лікар",
  ADMIN: "Адміністратор",
};

function UserCard({ fullName, role }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-100">
      {/* Tooltip */}
      <div className="relative group cursor-pointer">
        <span className="text-xl">{roleIcons[role]}</span>
        <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition bg-black text-white text-xs px-2 py-1 rounded z-10 whitespace-nowrap">
          {roleTitles[role]}
        </div>
      </div>

      <span className="italic">{fullName}</span>
    </div>
  );
}

export default UserCard;
