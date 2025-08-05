//App.tsx
import { Navigate, Route, Routes } from "react-router";
import { AuthProvider } from "./Auth/AuthProvider";
import { useAuth } from "./Auth/useAuth";
import LandingPage from "./pages/landing/Main";
import LoginPage from "./pages/landing/Login";
import SignupPage from "./pages/landing/Signup";
import IdeasPage from "./pages/ideas/main";
import { ProfilePage } from "./pages/profile";
// The app doesn't shows the overall errors for now. (UI)

const LoadingScreen = () => {
  return (
    <div className="fixed flex h-screen w-screen items-center justify-center bg-neutral-800">
      {/* <div className="text-xl text-white">Loading...</div> */}
    </div>
  );
};

const ProtectedRoute: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const PublicRoute: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (user) {
    return <Navigate to="/profile" replace />;
  }

  return children;
};

interface IRouteData {
  path: string;
  element: React.ReactElement;
  is: "Protected" | "Public";
}
const routeDatas: IRouteData[] = [
  { path: "", is: "Public", element: <LandingPage /> },
  { path: "login", is: "Public", element: <LoginPage /> },
  { path: "signup", is: "Public", element: <SignupPage /> },
  { path: "profile", is: "Protected", element: <ProfilePage /> },
  { path: "ideas", is: "Protected", element: <IdeasPage /> },
];
const routesJsx = routeDatas.map((route: IRouteData) => {
  if (route.is === "Public") {
    return (
      <Route
        path={`/${route.path}`}
        element={<PublicRoute>{route.element}</PublicRoute>}
      />
    );
  } else if (route.is === "Protected") {
    return (
      <Route
        path={`/${route.path}`}
        element={<ProtectedRoute>{route.element}</ProtectedRoute>}
      />
    );
  }
});

const AppContent = () => {
  return <Routes>{routesJsx}</Routes>;
};

function App() {
  return (
    <>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </>
  );
}

export default App;
