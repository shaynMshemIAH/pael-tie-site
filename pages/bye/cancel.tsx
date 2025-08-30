export default function Cancel() {
  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold">Checkout canceled</h1>
      <p className="mt-2 text-neutral-300">No charge was made.</p>
      <a href="/bye" className="underline mt-4 inline-block">Back to Bye</a>
    </main>
  );
}
