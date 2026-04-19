export const formatDate = (dateStr, timeStr) => {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString("es-ES", { month: "short" }).toUpperCase();
  const year = date.getFullYear();

  const time = timeStr ? ` · ${timeStr.slice(0, 5)}h` : "";

  return `${day} ${month} ${year}${time}`;
};

export const formatDateOnly = (dateStr) => {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString("es-ES", { month: "short" }).toUpperCase();
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
};

export const formatTimeOnly = (timeStr) => {
  if (!timeStr) return "";
  return `${timeStr.slice(0, 5)}h`;
};
