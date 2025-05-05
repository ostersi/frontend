import { useEffect, useState } from "react";

function ErrorMessage({ message, duration = 3000 }) {
    const [visible, setVisible] = useState(true);
  
    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(() => setVisible(false), duration);
        return () => clearTimeout(timer);
      }, [message, duration]);
  
    if (!visible || !message) return null;
  
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <strong className="font-bold">Помилка: </strong>
        <span>{message}</span>
      </div>
    );
  }
  
  export default ErrorMessage;
  