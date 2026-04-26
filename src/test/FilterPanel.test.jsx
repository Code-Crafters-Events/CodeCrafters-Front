import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import FilterPanel from "../components/molecules/FilterPanel/FilterPanel";

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => vi.fn() };
});

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => vi.fn() };
});

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onSearch: vi.fn(),
};

const wrap = (props = {}) =>
  render(
    <MemoryRouter>
      <FilterPanel {...defaultProps} {...props} />
    </MemoryRouter>,
  );

describe("FilterPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("no renderiza nada cuando isOpen=false", () => {
    const { container } = wrap({ isOpen: false });
    expect(container.firstChild).toBeNull();
  });

  it("renderiza el panel cuando isOpen=true", () => {
    wrap();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("el panel tiene aria-modal=true y aria-label correcto", () => {
    wrap();
    const panel = screen.getByRole("dialog");
    expect(panel).toHaveAttribute("aria-modal", "true");
    expect(panel).toHaveAttribute("aria-label", "Panel de filtros");
  });

  it("llama a onClose al hacer click en el backdrop", () => {
    const onClose = vi.fn();
    wrap({ onClose });
    const backdrop = document.querySelector("[aria-hidden='true']");
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("muestra los grupos de filtros: Categoría, Precio, Nombre, Alias, Fecha, Opciones", () => {
    wrap();
    expect(screen.getByText("Categoría")).toBeInTheDocument();
    expect(screen.getByText("Precio")).toBeInTheDocument();
    expect(screen.getByText("Nombre evento")).toBeInTheDocument();
    expect(screen.getByText("Alias")).toBeInTheDocument();
    expect(screen.getByText("Fecha")).toBeInTheDocument();
    expect(screen.getByText("Opciones de visualización")).toBeInTheDocument();
  });

  it("renderiza las opciones de categoría PRESENCIAL y ONLINE", () => {
    wrap();
    expect(screen.getByLabelText("Presencial")).toBeInTheDocument();
    expect(screen.getByLabelText("Online")).toBeInTheDocument();
  });

  it("selecciona la categoría PRESENCIAL al hacer click", () => {
    wrap();
    fireEvent.click(screen.getByLabelText("Presencial"));
    expect(screen.getByLabelText("Presencial")).toBeChecked();
  });

  it("selecciona la categoría ONLINE al hacer click", () => {
    wrap();
    fireEvent.click(screen.getByLabelText("Online"));
    expect(screen.getByLabelText("Online")).toBeChecked();
  });

  it("muestra 'Limpiar selección' solo cuando hay una categoría seleccionada", () => {
    wrap();
    expect(screen.queryByText("Limpiar selección")).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Presencial"));
    expect(screen.getByText("Limpiar selección")).toBeInTheDocument();
  });

  it("limpia la categoría al hacer click en 'Limpiar selección'", () => {
    wrap();
    fireEvent.click(screen.getByLabelText("Presencial"));
    fireEvent.click(screen.getByText("Limpiar selección"));
    expect(screen.getByLabelText("Presencial")).not.toBeChecked();
    expect(screen.queryByText("Limpiar selección")).not.toBeInTheDocument();
  });

  it("muestra los campos de precio mínimo y máximo por defecto", () => {
    wrap();
    expect(screen.getByPlaceholderText("0")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("999")).toBeInTheDocument();
  });

  it("oculta los campos de precio al marcar 'Gratis'", () => {
    wrap();
    fireEvent.click(screen.getByLabelText("Gratis"));
    expect(screen.queryByPlaceholderText("0")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("999")).not.toBeInTheDocument();
  });

  it("limpia priceMin y priceMax al marcar 'Gratis'", () => {
    wrap();
    fireEvent.change(screen.getByPlaceholderText("0"), {
      target: { value: "10", name: "priceMin" },
    });
    fireEvent.change(screen.getByPlaceholderText("999"), {
      target: { value: "50", name: "priceMax" },
    });
    fireEvent.click(screen.getByLabelText("Gratis"));
    expect(screen.queryByPlaceholderText("0")).not.toBeInTheDocument();
  });

  it("vuelve a mostrar los campos de precio al desmarcar 'Gratis'", () => {
    wrap();
    fireEvent.click(screen.getByLabelText("Gratis"));
    fireEvent.click(screen.getByLabelText("Gratis"));
    expect(screen.getByPlaceholderText("0")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("999")).toBeInTheDocument();
  });

  it("actualiza el campo de título al escribir", () => {
    wrap();
    const input = screen.getByPlaceholderText("Buscar por título...");
    fireEvent.change(input, { target: { value: "Hackathon", name: "title" } });
    expect(input.value).toBe("Hackathon");
  });

  it("actualiza el campo de alias al escribir", () => {
    wrap();
    const input = screen.getByPlaceholderText("Buscar por alias...");
    fireEvent.change(input, {
      target: { value: "jennifer", name: "authorAlias" },
    });
    expect(input.value).toBe("jennifer");
  });

  it("el checkbox 'Mostrar eventos pasados' empieza desmarcado", () => {
    wrap();
    expect(screen.getByLabelText("Mostrar eventos pasados")).not.toBeChecked();
  });

  it("marca el checkbox 'Mostrar eventos pasados' al hacer click", () => {
    wrap();
    fireEvent.click(screen.getByLabelText("Mostrar eventos pasados"));
    expect(screen.getByLabelText("Mostrar eventos pasados")).toBeChecked();
  });

  it("llama a onSearch con los filtros actuales al hacer click en 'Buscar'", () => {
    const onSearch = vi.fn();
    const onClose = vi.fn();
    wrap({ onSearch, onClose });
    fireEvent.click(screen.getByLabelText("Presencial"));
    fireEvent.change(screen.getByPlaceholderText("Buscar por título..."), {
      target: { value: "React Summit", name: "title" },
    });
    fireEvent.click(screen.getByText("Buscar"));
    expect(onSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        category: "PRESENCIAL",
        title: "React Summit",
      }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("envía priceMin='0' y priceMax='0' cuando está marcado 'Gratis'", () => {
    const onSearch = vi.fn();
    wrap({ onSearch });
    fireEvent.click(screen.getByLabelText("Gratis"));
    fireEvent.click(screen.getByText("Buscar"));
    expect(onSearch).toHaveBeenCalledWith(
      expect.objectContaining({ priceMin: "0", priceMax: "0" }),
    );
  });

  it("envía campos vacíos como undefined en onSearch", () => {
    const onSearch = vi.fn();
    wrap({ onSearch });
    fireEvent.click(screen.getByText("Buscar"));
    const args = onSearch.mock.calls[0][0];
    expect(args.category).toBeUndefined();
    expect(args.title).toBeUndefined();
    expect(args.authorAlias).toBeUndefined();
    expect(args.dateFrom).toBeUndefined();
    expect(args.dateTo).toBeUndefined();
  });

  it("incluye showPast=true cuando el checkbox está marcado", () => {
    const onSearch = vi.fn();
    wrap({ onSearch });
    fireEvent.click(screen.getByLabelText("Mostrar eventos pasados"));
    fireEvent.click(screen.getByText("Buscar"));
    expect(onSearch).toHaveBeenCalledWith(
      expect.objectContaining({ showPast: true }),
    );
  });

  it("llama a onSearch con {} y a onClose al hacer click en 'Volver'", () => {
    const onSearch = vi.fn();
    const onClose = vi.fn();
    wrap({ onSearch, onClose });

    fireEvent.click(screen.getByLabelText("Online"));
    fireEvent.click(screen.getByText("Volver"));
    expect(onSearch).toHaveBeenCalledWith({});
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("resetea los filtros al hacer click en 'Volver'", () => {
    wrap();
    fireEvent.click(screen.getByLabelText("Online"));
    expect(screen.getByLabelText("Online")).toBeChecked();
    fireEvent.click(screen.getByText("Volver"));
    expect(screen.getByLabelText("Online")).not.toBeChecked();
  });

  it("actualiza la fecha de inicio al escribir", () => {
    wrap();
    const inputs = screen.getAllByDisplayValue("");
    const dateFromInput = document.querySelector("input[name='dateFrom']");
    fireEvent.change(dateFromInput, {
      target: { value: "2026-05-01", name: "dateFrom" },
    });
    expect(dateFromInput.value).toBe("2026-05-01");
  });

  it("actualiza la fecha de fin al escribir", () => {
    wrap();
    const dateToInput = document.querySelector("input[name='dateTo']");
    fireEvent.change(dateToInput, {
      target: { value: "2026-06-30", name: "dateTo" },
    });
    expect(dateToInput.value).toBe("2026-06-30");
  });

  it("envía las fechas correctamente en onSearch", () => {
    const onSearch = vi.fn();
    wrap({ onSearch });
    const dateFromInput = document.querySelector("input[name='dateFrom']");
    const dateToInput = document.querySelector("input[name='dateTo']");
    fireEvent.change(dateFromInput, {
      target: { value: "2026-05-01", name: "dateFrom" },
    });
    fireEvent.change(dateToInput, {
      target: { value: "2026-05-31", name: "dateTo" },
    });
    fireEvent.click(screen.getByText("Buscar"));
    expect(onSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        dateFrom: "2026-05-01",
        dateTo: "2026-05-31",
      }),
    );
  });

  it("envía priceMin y priceMax cuando se rellenan manualmente", () => {
    const onSearch = vi.fn();
    wrap({ onSearch });

    fireEvent.change(screen.getByPlaceholderText("0"), {
      target: { value: "10", name: "priceMin" },
    });
    fireEvent.change(screen.getByPlaceholderText("999"), {
      target: { value: "100", name: "priceMax" },
    });
    fireEvent.click(screen.getByText("Buscar"));

    expect(onSearch).toHaveBeenCalledWith(
      expect.objectContaining({ priceMin: "10", priceMax: "100" }),
    );
  });
});
