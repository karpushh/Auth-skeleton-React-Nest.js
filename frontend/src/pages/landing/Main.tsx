const Main = () => {
  return (
    <div className="min-h-screen w-full bg-gray-100">
      <main className="mx-auto flex min-h-screen max-w-[1400px] justify-center bg-neutral-700">
        <div className="mt-50 h-fit w-fit flex gap-5">
          <a className="bg-neutral-100 p-2 rounded-2xl w-18 text-center" href="/login">Login</a >
          <a className="bg-neutral-100 p-2 rounded-2xl w-18 text-center" href="/signup">signup</a>
        </div>
      </main>
    </div>
  );
};

export default Main;
