"use client";

import { useEffect } from "react";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Keep the production page generic while preserving the diagnostic in server logs.
    console.error("Admin dashboard render failed");
  }, []);

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-xl items-center px-4 py-16">
      <div className="w-full border-2 border-red-600 bg-red-50 p-6 text-red-900 shadow-[5px_5px_0px_#000000] dark:bg-red-950 dark:text-red-100">
        <p className="font-mono text-xs font-black uppercase tracking-wider">Admin dashboard error</p>
        <h1 className="mt-2 font-mono text-xl font-black uppercase">The dashboard could not load.</h1>
        <p className="mt-3 text-sm">Try again. If the problem continues, check the server log using this diagnostic digest:</p>
        <code className="mt-2 block break-all border border-red-300 bg-white/60 p-2 font-mono text-xs dark:border-red-800 dark:bg-black/30">
          {error.digest || "no digest available"}
        </code>
        <button type="button" onClick={() => reset()} className="mt-5 border-2 border-black bg-[#ffe600] px-4 py-2 font-mono text-xs font-black uppercase text-black shadow-[3px_3px_0px_#000000]">
          Retry dashboard
        </button>
      </div>
    </main>
  );
}
