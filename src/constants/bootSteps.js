export const BOOT_STEPS = [
  { pct: 0, label: "INICIALIZANDO SISTEMA...", log: null },
  {
    pct: 18,
    label: "VALIDANDO BASE DE DATOS...",
    log: "✓ PostgreSQL — schema validado",
  },
  {
    pct: 36,
    label: "CARGANDO SEGURIDAD...",
    log: "✓ Spring Security + JWT — activo",
  },
  {
    pct: 52,
    label: "COMPILANDO API REST...",
    log: "✓ REST API — 14 endpoints listos",
  },
  {
    pct: 68,
    label: "MONTANDO ENDPOINTS...",
    log: "✓ Cloudinary + Stripe — conectados",
  },
  {
    pct: 82,
    label: "CARGANDO FRONTEND...",
    log: "✓ React.js — componentes compilados",
  },
  { pct: 100, label: "SISTEMA ONLINE", log: "✓ SYSTEM ONLINE — todo nominal" },
];

export const STEP_DELAY_MS = 750;
