import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import * as NavigatorModule from "../router/navigator";


describe("navigator utils", () => {
  beforeEach(() => {
    NavigatorModule.setNavigate(null);
  });

  it("setNavigate almacena la función de navegación", () => {
    const nav = vi.fn();
    NavigatorModule.setNavigate(nav);
    NavigatorModule.navigateTo("/home");
    expect(nav).toHaveBeenCalledWith("/home");
  });

  it("navigateTo usa window.location.href cuando navigateFunction es null", () => {
    const originalLocation = window.location;
    delete window.location;
    window.location = { href: "" };

    NavigatorModule.navigateTo("/home/community");
    expect(window.location.href).toBe("/home/community");

    window.location = originalLocation;
  });

  it("navigateTo usa la función de navegación cuando está disponible", () => {
    const nav = vi.fn();
    NavigatorModule.setNavigate(nav);
    NavigatorModule.navigateTo("/home/panel");
    expect(nav).toHaveBeenCalledWith("/home/panel");
  });
});


