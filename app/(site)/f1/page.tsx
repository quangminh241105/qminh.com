import Link from "next/link";
import type { Metadata } from "next";
import F1Player from "@/components/F1Player";

export const metadata: Metadata = {
  title: "F1 Stream | Quang Minh",
  description: "Watch the embedded Formula 1 stream.",
};

const STREAM_URL = "https://westreamf1.st/westreamf1.php";

export default function F1Page() {
  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="border-2 border-black bg-white p-5 shadow-[6px_6px_0px_#000000] dark:border-blue-400 dark:bg-zinc-900 dark:shadow-[6px_6px_0px_#000000] sm:p-8">
        <div className="flex flex-col gap-5 border-b-2 border-black pb-6 dark:border-zinc-700 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 border border-black bg-red-500" />
              <span className="border border-black bg-[#ffe600] px-2 py-0.5 font-mono text-xs font-black uppercase tracking-[0.2em] text-black">
                Live broadcast
              </span>
            </div>
            <h1 className="font-mono text-3xl font-black uppercase tracking-tight text-black dark:text-white sm:text-5xl">
              Formula 1
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400 sm:text-base">
              Tune in through the embedded stream player below. Use fullscreen for a larger race-day view.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex w-fit border-2 border-black bg-white px-3 py-2 font-mono text-xs font-black uppercase tracking-wider text-black shadow-[3px_3px_0px_#000000] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          >
            Back to portfolio
          </Link>
        </div>

        <F1Player src={STREAM_URL} />
      </div>
    </main>
  );
}
