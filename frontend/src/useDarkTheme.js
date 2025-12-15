import { useEffect, useState } from "react";
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

export const useDarkTheme = () => {
  const [dark, setDark] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (dark) {
      document.body.classList.add("dark-theme");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-theme");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  // Botão para alternar
  const ToggleButton = (
    <button
      onClick={() => setDark(!dark)}
      style={{
        background: "transparent",
        border: "none",
        fontSize: "1.2rem",
        cursor: "pointer",
        color: "inherit"
      }}
      title={dark ? "Usar tema claro" : "Usar tema escuro"}
    >
      {dark ?
        <LightModeIcon />
        :
        <DarkModeIcon />}
    </button>
  );

  return { dark, setDark, ToggleButton };
};