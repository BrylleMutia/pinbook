import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import { useToast } from "../toast";
import type { Page, PageInput } from "../types";
import { PageForm } from "../components/PageForm";
import { Sheet } from "../components/Sheet";
import { Fab, Shell, SkeletonCards } from "../components/Shell";
import { ChevronRightIcon, LogOutIcon } from "../components/ui";

export function Home() {
  const { logout } = useAuth();
  const { toast } = useToast();
  const [pages, setPages] = useState<Page[] | null>(null);
  const [error, setError] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setPages(await api.listPages());
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load pages");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const createPage = async (data: PageInput) => {
    setSaving(true);
    try {
      await api.createPage(data);
      setSheetOpen(false);
      toast("Page created");
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to create page");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Shell>
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200/70 bg-stone-50/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-lg">
            📌
          </span>
          <h1 className="font-semibold text-stone-800">Pinbook</h1>
        </div>
        <button
          onClick={logout}
          aria-label="Log out"
          className="rounded-full p-2 text-stone-400 transition hover:bg-stone-100 hover:text-stone-600"
        >
          <LogOutIcon className="h-5 w-5" />
        </button>
      </header>

      <main className="px-4 pb-28 pt-4">
        {pages === null && !error && <SkeletonCards />}

        {error && (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-center">
            <p className="text-sm font-medium text-rose-500">{error}</p>
            <button
              onClick={() => {
                setPages(null);
                void load();
              }}
              className="mt-3 rounded-full bg-rose-400 px-5 py-2 text-sm font-semibold text-white transition active:scale-95"
            >
              Try again
            </button>
          </div>
        )}

        {pages && pages.length === 0 && (
          <div className="flex flex-col items-center px-6 pt-16 text-center">
            <span className="text-5xl">🗂️</span>
            <h2 className="mt-4 text-lg font-semibold text-stone-700">No pages yet</h2>
            <p className="mt-1 text-sm text-stone-400">
              Create your first page, e.g. for AWS or React, then fill it with documentation links.
            </p>
          </div>
        )}

        {pages && pages.length > 0 && (
          <div className="space-y-2.5">
            {pages.map((page) => (
              <Link
                key={page.id}
                to={`/page/${page.id}`}
                className="flex items-center gap-3 rounded-2xl border border-stone-200/70 bg-white p-4 shadow-sm transition active:scale-[0.99]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-2xl">
                  {page.iconEmoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-stone-800">{page.title}</span>
                  <span className="block text-xs text-stone-400">
                    {page.entryCount} {page.entryCount === 1 ? "entry" : "entries"}
                  </span>
                </span>
                <ChevronRightIcon className="h-5 w-5 shrink-0 text-stone-300" />
              </Link>
            ))}
          </div>
        )}
      </main>

      <Fab onClick={() => setSheetOpen(true)} label="Add page" />

      <Sheet open={sheetOpen} title="New page" onClose={() => setSheetOpen(false)}>
        <PageForm submitting={saving} onSubmit={createPage} />
      </Sheet>
    </Shell>
  );
}
