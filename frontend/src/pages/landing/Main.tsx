import { Link } from "react-router-dom";

export default function Main() {
  return (
    <div className="min-h-screen w-full bg-neutral-800 fixed">
      <main className="mx-auto flex min-h-screen max-w-[1400px] justify-center bg-neutral-800">
        <div className="mt-50 flex h-fit w-fit gap-5">
          <Link
            className="text-2xlhover:bg-blue-400/95 rounded-2xl bg-blue-400 p-5 text-2xl font-bold text-neutral-100 hover:bg-blue-400/95"
            to="/login"
          >
            Login
          </Link>
          <Link
            className="rounded-2xl bg-blue-400 p-5 text-2xl font-bold text-neutral-100 hover:bg-blue-400/95"
            to="/signup"
          >
            signup
          </Link>
        </div>
      </main>
    </div>
  );
};

