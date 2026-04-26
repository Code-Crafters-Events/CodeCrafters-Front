import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import TicketModal from "../components/molecules/TicketModal/TicketModal";

const {
  mockSave,
  mockText,
  mockLine,
  mockAddImage,
  mockSetFontSize,
  mockSetTextColor,
  mockSetDrawColor,
} = vi.hoisted(() => ({
  mockSave: vi.fn(),
  mockText: vi.fn(),
  mockLine: vi.fn(),
  mockAddImage: vi.fn(),
  mockSetFontSize: vi.fn(),
  mockSetTextColor: vi.fn(),
  mockSetDrawColor: vi.fn(),
}));

vi.mock("jspdf", () => ({
  default: vi.fn().mockImplementation(function () {
    return {
      setFontSize: mockSetFontSize,
      setTextColor: mockSetTextColor,
      text: mockText,
      setDrawColor: mockSetDrawColor,
      line: mockLine,
      addImage: mockAddImage,
      save: mockSave,
    };
  }),
}));

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

const baseTicket = {
  eventId: 42,
  eventTitle: "HackMadrid 2026",
  verificationCode: "CC-XYZ-001",
  qrUrl: "https://api.qrserver.com/qr.png",
  date: "15 ABR 2026 · 10:00h",
};

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);
const mockImageWith = ({
  triggerOnLoad = false,
  triggerOnError = false,
} = {}) => {
  const originalImage = global.Image;
  let capturedOnLoad;
  let capturedOnError;

  global.Image = class {
    set onload(fn) {
      capturedOnLoad = fn;
    }
    set onerror(fn) {
      capturedOnError = fn;
    }
    set crossOrigin(_v) {}
    set src(_v) {}
  };

  const restore = () => {
    global.Image = originalImage;
  };
  const fireLoad = () => capturedOnLoad?.();
  const fireError = () => capturedOnError?.();
  return { restore, fireLoad, fireError };
};

describe("TicketModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("no renderiza nada cuando ticket es null", () => {
    const { container } = wrap(
      <TicketModal ticket={null} onClose={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("no renderiza nada cuando ticket es undefined", () => {
    const { container } = wrap(<TicketModal onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it("muestra el título '¡Entrada Confirmada!'", () => {
    wrap(<TicketModal ticket={baseTicket} onClose={() => {}} />);
    expect(screen.getByText("¡Entrada Confirmada!")).toBeInTheDocument();
  });

  it("muestra el título del evento", () => {
    wrap(<TicketModal ticket={baseTicket} onClose={() => {}} />);
    expect(screen.getByText("HackMadrid 2026")).toBeInTheDocument();
  });

  it("muestra el código de verificación", () => {
    wrap(<TicketModal ticket={baseTicket} onClose={() => {}} />);
    expect(screen.getByText("CC-XYZ-001")).toBeInTheDocument();
  });

  it("renderiza la imagen QR con el src correcto", () => {
    wrap(<TicketModal ticket={baseTicket} onClose={() => {}} />);
    expect(screen.getByAltText("Código QR")).toHaveAttribute(
      "src",
      baseTicket.qrUrl,
    );
  });

  it("muestra la fecha cuando ticket.date está definida", () => {
    wrap(<TicketModal ticket={baseTicket} onClose={() => {}} />);
    expect(screen.getByText("15 ABR 2026 · 10:00h")).toBeInTheDocument();
  });

  it("NO muestra la fecha cuando ticket.date es undefined", () => {
    wrap(
      <TicketModal
        ticket={{ ...baseTicket, date: undefined }}
        onClose={() => {}}
      />,
    );
    expect(screen.queryByText("15 ABR 2026 · 10:00h")).not.toBeInTheDocument();
  });

  it("renderiza los 4 botones de acción", () => {
    wrap(<TicketModal ticket={baseTicket} onClose={() => {}} />);
    expect(screen.getByText("Descargar PDF")).toBeInTheDocument();
    expect(screen.getByText("Ver Info del Evento")).toBeInTheDocument();
    expect(screen.getByText("Mis Entradas")).toBeInTheDocument();
    expect(screen.getByText("Cerrar")).toBeInTheDocument();
  });

  it("navega al evento y cierra al click en 'Ver Info del Evento'", () => {
    const onClose = vi.fn();
    wrap(<TicketModal ticket={baseTicket} onClose={onClose} />);
    fireEvent.click(screen.getByText("Ver Info del Evento"));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/home/info/42");
  });

  it("navega a mis entradas y cierra al click en 'Mis Entradas'", () => {
    const onClose = vi.fn();
    wrap(<TicketModal ticket={baseTicket} onClose={onClose} />);
    fireEvent.click(screen.getByText("Mis Entradas"));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/home/my-tickets");
  });

  it("llama a onClose al hacer click en 'Cerrar'", () => {
    const onClose = vi.fn();
    wrap(<TicketModal ticket={baseTicket} onClose={onClose} />);
    fireEvent.click(screen.getByText("Cerrar"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("llama a onClose al hacer click en el overlay", () => {
    const onClose = vi.fn();
    const { container } = wrap(
      <TicketModal ticket={baseTicket} onClose={onClose} />,
    );
    fireEvent.click(container.firstChild);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("NO llama a onClose al hacer click dentro del modal (stopPropagation)", () => {
    const onClose = vi.fn();
    wrap(<TicketModal ticket={baseTicket} onClose={onClose} />);
    fireEvent.click(screen.getByText("¡Entrada Confirmada!"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("llama a addImage y save con el nombre del evento cuando la imagen QR carga (onload)", async () => {
    const { restore, fireLoad } = mockImageWith();
    wrap(<TicketModal ticket={baseTicket} onClose={() => {}} />);
    fireEvent.click(screen.getByText("Descargar PDF"));
    fireLoad();
    await waitFor(() => {
      expect(mockAddImage).toHaveBeenCalled();
      expect(mockSave).toHaveBeenCalledWith(
        expect.stringContaining("HackMadrid"),
      );
    });
    restore();
  });

  it("llama a save con sufijo 'sin_qr' y SIN addImage cuando la imagen falla (onerror)", async () => {
    const { restore, fireError } = mockImageWith();
    wrap(<TicketModal ticket={baseTicket} onClose={() => {}} />);
    fireEvent.click(screen.getByText("Descargar PDF"));
    fireError();
    await waitFor(() => {
      expect(mockAddImage).not.toHaveBeenCalled();
      expect(mockSave).toHaveBeenCalledWith(expect.stringContaining("sin_qr"));
    });
    restore();
  });

  it("usa 'N/A' como código en el PDF cuando verificationCode es undefined", async () => {
    const { restore, fireLoad } = mockImageWith();
    wrap(
      <TicketModal
        ticket={{ ...baseTicket, verificationCode: undefined }}
        onClose={() => {}}
      />,
    );
    fireEvent.click(screen.getByText("Descargar PDF"));
    fireLoad();
    await waitFor(() => {
      const textCalls = mockText.mock.calls.map((c) => c[0]);
      expect(textCalls).toContain("N/A");
    });
    restore();
  });

  it("usa 'Consultar en la aplicación' como fecha en el PDF cuando date es undefined", async () => {
    const { restore, fireLoad } = mockImageWith();
    wrap(
      <TicketModal
        ticket={{ ...baseTicket, date: undefined }}
        onClose={() => {}}
      />,
    );
    fireEvent.click(screen.getByText("Descargar PDF"));
    fireLoad();
    await waitFor(() => {
      const textCalls = mockText.mock.calls.map((c) => c[0]);
      expect(textCalls).toContain("Consultar en la aplicación");
    });
    restore();
  });
});
