import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import FeatureCard from "../components/molecules/FeatureCard/FeatureCard";

describe("FeatureCard Component", () => {
  const mockProps = {
    title: "Innovación Tecnológica",
    description: "Desarrollamos soluciones de vanguardia para tu empresa."
  };

  it("debe renderizar el título correctamente", () => {
    render(<FeatureCard {...mockProps} />);    
    const titleElement = screen.getByRole("heading", { level: 3 });
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveTextContent(mockProps.title);
  });

  it("debe renderizar la descripción correctamente", () => {
    render(<FeatureCard {...mockProps} />);
    const descriptionElement = screen.getByText(mockProps.description);    
    expect(descriptionElement).toBeInTheDocument();
    expect(descriptionElement.tagName).toBe("P");
  });

  it("debe aplicar la clase de estilo del contenedor", () => {
    const { container } = render(<FeatureCard {...mockProps} />);
    const articleElement = container.firstChild;
    expect(articleElement.tagName).toBe("ARTICLE");
    expect(articleElement.className).toBeTruthy();
  });
});