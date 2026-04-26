import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import ButtonConnect from "../components/atoms/ButtonConnect/ButtonConnect";

const mockedUsedNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedUsedNavigate,
  };
});

describe("Button Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("renderiza correctamente el texto", () => {
    render(
      <BrowserRouter>
        <ButtonConnect text="Conectar" />
      </BrowserRouter>,
    );
    expect(screen.getByText("Conectar")).toBeInTheDocument();
  });

  it("llama a onClick cuando se proporciona la prop", () => {
    const onClickMock = vi.fn();
    render(
      <BrowserRouter>
        <ButtonConnect text="Click" onClick={onClickMock} />
      </BrowserRouter>,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  it("navega al path correcto cuando no hay onClick", () => {
    render(
      <BrowserRouter>
        <ButtonConnect text="Ir a Login" path="/login" />
      </BrowserRouter>,
    );

    fireEvent.click(screen.getByText("Ir a Login"));
    expect(mockedUsedNavigate).toHaveBeenCalledWith("/login");
  });

  it("aplica la clase de estilo correctamente desde los CSS Modules", () => {
    render(
      <BrowserRouter>
        <ButtonConnect text="Estilos" BtnClass="primary" />
      </BrowserRouter>,
    );

    const button = screen.getByRole("button");
    expect(button.className).toBeDefined();
  });

  it("prioriza onClick sobre path", () => {
    const onClickMock = vi.fn();
    render(
      <BrowserRouter>
        <ButtonConnect text="Prioridad" onClick={onClickMock} path="/test" />
      </BrowserRouter>,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(onClickMock).toHaveBeenCalled();
    expect(mockedUsedNavigate).not.toHaveBeenCalled();
  });

  it("no hace nada al hacer click si no se proporciona onClick ni path", () => {
    render(
      <BrowserRouter>
        <ButtonConnect text="Nada" />
      </BrowserRouter>,
    );
    fireEvent.click(screen.getByText("Nada"));
    expect(mockedUsedNavigate).not.toHaveBeenCalled();
  });
});
