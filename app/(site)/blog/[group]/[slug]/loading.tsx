export default function ArticleLoading() {
  return (
    <main className="mx-auto w-full max-w-4xl animate-pulse px-4 py-16 sm:px-6 lg:px-8">
      <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mt-8 h-12 max-w-2xl rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mt-4 h-5 max-w-xl rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mt-12 grid gap-4">
        <div className="h-5 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-5 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-5 w-4/5 rounded bg-slate-200 dark:bg-slate-800" />
      </div>
    </main>
  );
}
