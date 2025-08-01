//Login.tsx
import { useState } from "react";
import { useAuth } from "../../Auth/useAuth";
import { useNavigate } from "react-router-dom";

const LoginSection = () => {
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
      setError("Failed to sign up. Email might already be in use.");
      console.error(err);
    } finally {
      // This runs whether the request succeeded or failed
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-neutral-800">
      <main className="mx-auto flex min-h-screen max-w-[1400px] items-center justify-center bg-neutral-800">
        <div className="flex h-fit w-fit flex-col items-center gap-6 rounded-4xl border border-neutral-500/40 bg-neutral-700 p-5">
          <h1 className="text-2xl font-bold text-neutral-100">Login</h1>
          <div className="flex flex-col items-start">
            <h1 className="mb-1.5 h-fit w-fit pl-1 font-[500] text-neutral-100">
              Email
            </h1>
            <input
              className="h-13 w-80 rounded-2xl border border-black/20 bg-neutral-100 p-2"
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
              className="h-13 w-80 rounded-2xl border border-black/20 bg-neutral-100 p-2"
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
            className="cursor-pointer rounded-2xl font-[500] bg-blue-400 p-2 px-8 text-[18px] text-neutral-100 hover:bg-blue-400/90 disabled:bg-blue-500"
            disabled={loading}
          >
            login
          </button>
          {error && (
            <div className="rounded-md bg-red-100 p-2 text-red-500">
              {error}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
export default LoginSection;
