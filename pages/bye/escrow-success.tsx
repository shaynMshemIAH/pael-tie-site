export default function EscrowSuccess() {
  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold">Escrow reserved ✅</h1>
      <p className="mt-2 text-neutral-300">Funds are reserved and will release on the date you set.</p>
      <a href="/bye" className="underline mt-4 inline-block">Back to Bye</a>
    </main>
  );
}
