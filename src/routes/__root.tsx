import { Outlet, Link, createRootRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import "../styles.css";

const TITLE = "FootFlux — The Football Hub";
const DESCRIPTION = "Discover football facts, legendary players, famous clubs and the biggest leagues on FootFlux.";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "author", content: "FootFlux" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
    ],
  }),
  component: RootComponent,
  notFoundComponent: () => <div className="ff-error-page"><h1>404</h1><p>Page not found.</p><Link to="/" className="ff-error-link">Go home</Link></div>,
});

function RootComponent() {
  return <RootShell><Outlet /></RootShell>;
}

function RootShell({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}
