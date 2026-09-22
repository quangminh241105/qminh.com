export default function ProjectLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl animate-pulse px-4 py-16 sm:px-6 lg:px-8">
      <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mt-8 h-12 max-w-xl rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mt-4 h-5 max-w-2xl rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    </main>
  );
}
