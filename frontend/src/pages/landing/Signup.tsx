import { useState } from "react";
import { useAuth } from "../../Auth/useAuth";

const SignupSection = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const SignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const signupData = {
        username: username,
        email: email,
        password: password,
      };

      await signup(signupData);
    } catch (err) {
      setError("Failed to sign up. Email might already be in use.");
      console.error(err);
    } finally {
      // This runs whether the request succeeded or failed
      setLoading(false);
    }
  };

  return (
    <div className="rounded-4xl flex h-fit w-fit flex-col items-center gap-6 border border-neutral-500/40 bg-neutral-200 p-5">
      <div className="flex flex-col items-start">
        <h1 className="mb-1.5 h-fit w-fit pl-1 text-black/80">Username</h1>
        <input
          className="h-13 w-80 rounded-2xl border border-black/20 p-2"
          type="text"
          placeholder="username"
          name="username"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div className="flex flex-col items-start">
        <h1 className="mb-1.5 h-fit w-fit pl-1 text-black/80">Email</h1>
        <input
          className="h-13 w-80 rounded-2xl border border-black/20 p-2"
          type="text"
          placeholder="email"
          name="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="flex flex-col items-start">
        <h1 className="mb-1.5 h-fit w-fit pl-1 text-black/80">Password</h1>
        <input
          className="h-13 w-80 rounded-2xl border border-black/20 p-2"
          type="text"
          placeholder="password"
          name="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button
        onClick={SignUp}
        className="cursor-pointer rounded-2xl bg-blue-400 p-2 px-8 text-[18px] text-neutral-100 hover:bg-blue-400/90 disabled:bg-blue-500"
        disabled={loading}
      >
        Sign In
      </button>
      {error && (
        <div className="rounded-md bg-red-100 p-2 text-red-500">{error}</div>
      )}
    </div>
  );
};

export default SignupSection;
