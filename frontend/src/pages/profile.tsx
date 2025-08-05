import { Link } from "react-router-dom";
import { useAuth } from "../Auth/useAuth";

export const ProfilePage: React.FC = () => {
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
          <Link to="/ideas">
            <button className="mt-4 cursor-pointer rounded-2xl bg-blue-400 p-3 font-bold text-neutral-100 hover:bg-blue-400/95">
              Go to ideas
            </button>
          </Link>
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
