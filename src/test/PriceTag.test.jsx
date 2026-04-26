import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import PriceTag from "../components/atoms/PriceTag/PriceTag";

describe("PriceTag", () => {
  it('muestra "FREE" cuando price es 0', () => {
    render(<PriceTag price={0} />);
    expect(screen.getByText("FREE")).toBeInTheDocument();
  });

  it('muestra "FREE" cuando price es null', () => {
    render(<PriceTag price={null} />);
    expect(screen.getByText("FREE")).toBeInTheDocument();
  });

  it('muestra "FREE" cuando price es undefined', () => {
    render(<PriceTag />);
    expect(screen.getByText("FREE")).toBeInTheDocument();
  });

  it("muestra el precio con € cuando price > 0", () => {
    render(<PriceTag price={25} />);
    expect(screen.getByText("25€")).toBeInTheDocument();
  });

  it("muestra precio decimal correctamente", () => {
    render(<PriceTag price={9.99} />);
    expect(screen.getByText("9.99€")).toBeInTheDocument();
  });
});