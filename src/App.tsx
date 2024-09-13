import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DashboardHome from "./pages/home/dashboard";
import "non.geist";
import { Toaster } from "@/components/ui/toaster";
import { ClerkProvider } from "@clerk/clerk-react";

// For Geist Mono
import "non.geist/mono";
import SourceHome from "./pages/home/source";
import TemplatesHome from "./pages/home/template";
import DocumentEditorScreen from "./pages/editor/document";
import SignIn from "./pages/auth/signIn";
import SignUpPage from "./pages/auth/signUp";
import AuthLayout from "./layouts/auth";
import ProjectsScreen from "./pages/home/projects";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    errorElement: <div>Not Found</div>,
    children: [
      {
        path: "/",
        element: <ProjectsScreen />,
      },

      {
        path: "/project/:id",
        element: (
          <div>
            <DashboardHome />
          </div>
        ),
      },
      {
        path: "/project/:id/sources",
        element: (
          <div>
            <SourceHome />
          </div>
        ),
      },
      {
        path: "/project/:id/templates",
        element: (
          <div>
            <TemplatesHome />
          </div>
        ),
      },
      {
        path: "/project/:id/team",
        element: (
          <div>
            <TemplatesHome />
          </div>
        ),
      },

      {
        path: "/document/editor/:id",
        element: (
          <div>
            <DocumentEditorScreen />
          </div>
        ),
      },
    ],
  },
  {
    path: "/sign-in",
    element: (
      <div>
        <SignIn />
      </div>
    ),
  },
  {
    path: "/sign-up",
    element: (
      <div>
        <SignUpPage />
      </div>
    ),
  },
]);
function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <Toaster />
      <RouterProvider router={router} />
    </ClerkProvider>
  );
}

export default App;
