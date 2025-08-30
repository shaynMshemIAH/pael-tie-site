export default function Success() {
  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold">Bye traversal committed ✅</h1>
      <p className="mt-2 text-neutral-300">
        Payment received. Terms apply. You can return to the Bye page below.
      </p>
      <a href="/bye" className="underline mt-4 inline-block">Back to Bye</a>
    </main>
  );
}
