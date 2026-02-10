import { createBrowserRouter } from "react-router";
import Root from "./components/Root";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";
import Methodology from "./components/Methodology";
import CarbonMarketplace from "./components/CarbonMarketplace";
import ProtectedRoute from "./auth/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: LandingPage },
      { path: "dashboard", Component: Dashboard },
      { path: "methodology", Component: Methodology },
      { path: "marketplace", Component: () => <ProtectedRoute><CarbonMarketplace /></ProtectedRoute> },
    ],
  },
]);