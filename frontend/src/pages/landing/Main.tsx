const Main = () => {
  return (
    <div className="min-h-screen w-full bg-neutral-800">
      <main className="mx-auto flex min-h-screen max-w-[1400px] justify-center bg-neutral-800">
        <div className="mt-50 flex h-fit w-fit gap-5">
          <a
            className="text-2xlhover:bg-blue-400/95 rounded-2xl bg-blue-400 p-5 text-2xl font-bold text-neutral-100 hover:bg-blue-400/95"
            href="/login"
          >
            Login
          </a>
          <a
            className="rounded-2xl bg-blue-400 p-5 text-2xl font-bold text-neutral-100 hover:bg-blue-400/95"
            href="/signup"
          >
            signup
          </a>
        </div>
      </main>
    </div>
  );
};

export default Main;
