import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./src/routeTree.gen";

export const getRouter = () => createRouter({ routeTree, scrollRestoration: true, defaultPreloadStaleTime: 0 });
