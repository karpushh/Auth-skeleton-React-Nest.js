//App.tsx
import { Navigate, Route, Routes } from "react-router";
import { AuthProvider } from "./Auth/AuthProvider";
import { useAuth } from "./Auth/useAuth";
import LandingPage from "./pages/landing/Main";
import LoginPage from "./pages/landing/Login";
import SignupPage from "./pages/landing/Signup";
import IdeasPage from "./pages/ideas/main";

const ProtectedRoute: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const PublicRoute: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
};

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div className="text-center">Loading profile...</div>;
  }

  return (
    <div className="rounded-lg bg-white p-8 shadow-md">
      <h2 className="mb-4 text-3xl font-bold">Profile</h2>
      <p>
        <strong className="font-medium">Username:</strong> {user.username}
      </p>
      <p>
        <strong className="font-medium">Email:</strong> {user.email}
      </p>
      <p className="mt-4 text-sm text-gray-500">
        This is a protected page. You can only see this if you are logged in.
      </p>
    </div>
  );
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
