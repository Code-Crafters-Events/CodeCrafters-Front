import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import EventTag from "../components/atoms/EventTag/EventTag";

describe("EventTag", () => {
  it("renderiza el label", () => {
    render(<EventTag label="ONLINE" color="#00FF9D" borderColor="#00FF9D" />);
    expect(screen.getByText("ONLINE")).toBeInTheDocument();
  });

  it("aplica color y borderColor como estilos inline", () => {
    const { container } = render(
      <EventTag label="PRESENCIAL" color="#FFB800" borderColor="#FFB800" />,
    );
    const span = container.firstChild;
    expect(span).toHaveStyle({ color: "#FFB800", borderColor: "#FFB800" });
  });
});
