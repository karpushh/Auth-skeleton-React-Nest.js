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
  const { user, logout } = useAuth();

  if (!user) {
    return <div className="text-center">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen w-full bg-neutral-800">
      <main className="mx-auto flex min-h-screen max-w-[1400px] justify-center bg-neutral-800">
        <div className="flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <h2 className="mb-4 text-3xl font-bold text-neutral-200">
              Profile
            </h2>
            <p className="text-neutral-200">
              <strong className="font-bold text-neutral-200">Username:</strong>{" "}
              {user.username}
            </p>
            <p className="text-neutral-200">
              <strong className="font-bold text-neutral-200">Email:</strong>{" "}
              {user.email}
            </p>
          </div>
          <p className="mt-4 text-sm text-gray-200">
            This is a protected page. You can only see this if you are logged
            in.
          </p>
          <a href="/ideas">
            <button className="mt-4 cursor-pointer rounded-2xl bg-blue-400 p-3 font-bold text-neutral-100 hover:bg-blue-400/95">
              Go to ideas
            </button>
          </a>
          <button
            className="mt-4 cursor-pointer rounded-2xl bg-blue-400 p-3 font-bold text-neutral-100 hover:bg-blue-400/95"
            onClick={() => logout()}
          >
            Logout
          </button>
        </div>
      </main>
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
