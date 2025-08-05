//Login.tsx
import { useState } from "react";
import { useAuth } from "../../Auth/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { handleAuthError } from "../../Auth/utils";

export default function LoginSection() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const Login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const loginData = {
        email: email,
        password: password,
      };

      await login(loginData);
      navigate("/profile");
    } catch (err) {
      const errorMessage = handleAuthError(err);
      setError(errorMessage);
      console.error(err);
    } finally {
      // This runs whether the request succeeded or failed
      setLoading(false);
    }
  };

  return (
    <div className="fixed min-h-screen w-full bg-neutral-800">
      <main className="mx-auto flex min-h-screen max-w-[1400px] items-center justify-center bg-neutral-800">
        <div className="flex h-fit w-fit flex-col items-center gap-6 rounded-4xl border border-neutral-500/40 bg-neutral-700 p-5">
          <h1 className="text-2xl font-bold text-neutral-100">Login</h1>
          <div className="flex flex-col items-start">
            <h1 className="mb-1.5 h-fit w-fit pl-1 font-[500] text-neutral-100">
              Email
            </h1>
            <input
              className="h-13 w-80 rounded-2xl border border-black/20 bg-neutral-100 text-black/85 p-2"
              type="text"
              placeholder="email"
              name="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col items-start">
            <h1 className="mb-1.5 h-fit w-fit pl-1 font-[500] text-neutral-100">
              Password
            </h1>
            <input
              className="h-13 w-80 rounded-2xl border border-black/20 bg-neutral-100 p-2 text-black/85"
              type="text"
              placeholder="password"
              name="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            onClick={Login}
            className="cursor-pointer rounded-2xl bg-blue-400 p-2 px-8 text-[18px] font-[500] text-neutral-100 hover:bg-blue-400/90 disabled:bg-blue-500"
            disabled={loading}
          >
            login
          </button>
          {error && (
            <div className="h-fit w-fit rounded-md p-2 whitespace-pre-wrap text-red-400">
              {error}
            </div>
          )}
          <div className="text-[14px] text-neutral-200">
            Don't have an account?{" "}
            <Link className="font-bold underline" to="/signup">
              signup here
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
