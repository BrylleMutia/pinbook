import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { useToast } from "../toast";
import type { Entry, PageDetail, PageInput } from "../types";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EntryForm } from "../components/EntryForm";
import { PageForm } from "../components/PageForm";
import { Sheet } from "../components/Sheet";
import { Fab, Shell, SkeletonCards } from "../components/Shell";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowUpIcon,
  ExternalLinkIcon,
  PencilIcon,
  TrashIcon,
} from "../components/ui";

interface EntrySheetState {
  entry: Entry | null;
}

interface ConfirmState {
  kind: "page" | "entry";
  id: string;
  title: string;
}

export function PageDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [page, setPage] = useState<PageDetail | null>(null);
  const [error, setError] = useState("");
  const [pageSheetOpen, setPageSheetOpen] = useState(false);
  const [entrySheet, setEntrySheet] = useState<EntrySheetState | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setPage(await api.getPage(id));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load page");
    }
  }, [id]);

  useEffect(() => {
    setPage(null);
    void load();
  }, [load]);

  const savePage = async (data: PageInput) => {
    if (!id) return;
    setBusy(true);
    try {
      await api.updatePage(id, data);
      setPageSheetOpen(false);
      toast("Page updated");
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to update page");
    } finally {
      setBusy(false);
    }
  };

  const movePage = async (direction: "up" | "down") => {
    if (!id) return;
    try {
      await api.movePage(id, direction);
      toast(direction === "up" ? "Moved up" : "Moved down");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to move page");
    }
  };

  const saveEntry = async (data: {
    title: string;
    description: string;
    url: string;
    iconEmoji: string;
  }) => {
    if (!id) return;
    setBusy(true);
    try {
      if (entrySheet?.entry) {
        await api.updateEntry(entrySheet.entry.id, data);
        toast("Entry updated");
      } else {
        await api.createEntry({ ...data, pageId: id });
        toast("Entry added");
      }
      setEntrySheet(null);
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to save entry");
    } finally {
      setBusy(false);
    }
  };

  const moveEntry = async (direction: "up" | "down") => {
    if (!entrySheet?.entry) return;
    try {
      await api.moveEntry(entrySheet.entry.id, direction);
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to move entry");
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.kind === "page" && id) {
        await api.deletePage(id);
        toast("Page deleted");
        navigate("/");
      } else {
        await api.deleteEntry(confirm.id);
        setEntrySheet(null);
        setPageSheetOpen(false);
        toast("Entry deleted");
        await load();
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setConfirm(null);
    }
  };

  const entryIndex =
    entrySheet?.entry && page
      ? page.entries.findIndex((e) => e.id === entrySheet.entry?.id)
      : -1;
  const canMoveUp = entryIndex > 0;
  const canMoveDown = entryIndex >= 0 && entryIndex < (page?.entries.length ?? 0) - 1;

  return (
    <Shell>
      <header className="sticky top-0 z-10 flex items-center gap-1 border-b border-stone-200/70 bg-stone-50/90 px-2 py-2 backdrop-blur">
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="rounded-full p-2 text-stone-500 transition hover:bg-stone-100"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-2.5 px-1">
          <span className="text-2xl">{page?.iconEmoji ?? "📄"}</span>
          <h1 className="truncate text-lg font-semibold text-stone-800">
            {page?.title ?? "…"}
          </h1>
        </div>
        {page && (
          <button
            onClick={() => setPageSheetOpen(true)}
            aria-label="Edit page"
            className="rounded-full p-2 text-stone-500 transition hover:bg-stone-100"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
        )}
      </header>

      <main className="space-y-2.5 px-4 pb-28 pt-4">
        {page === null && !error && <SkeletonCards />}

        {error && (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-center">
            <p className="text-sm font-medium text-rose-500">{error}</p>
            <button
              onClick={() => {
                setPage(null);
                void load();
              }}
              className="mt-3 rounded-full bg-rose-400 px-5 py-2 text-sm font-semibold text-white transition active:scale-95"
            >
              Try again
            </button>
          </div>
        )}

        {page && page.entries.length === 0 && (
          <div className="flex flex-col items-center px-6 pt-16 text-center">
            <span className="text-5xl">🔗</span>
            <h2 className="mt-4 text-lg font-semibold text-stone-700">No links yet</h2>
            <p className="mt-1 text-sm text-stone-400">
              Add your first documentation link to this page.
            </p>
          </div>
        )}

        {page &&
          page.entries.length > 0 &&
          page.entries.map((entry) => (
            <div key={entry.id} className="flex items-stretch gap-1.5">
              <a
                href={entry.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-stone-200/70 bg-white p-3.5 shadow-sm transition active:scale-[0.99]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-xl">
                  {entry.iconEmoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-stone-800">{entry.title}</span>
                  {entry.description && (
                    <span className="block truncate text-xs text-stone-400">
                      {entry.description}
                    </span>
                  )}
                </span>
                <ExternalLinkIcon className="h-4 w-4 shrink-0 text-stone-300" />
              </a>
              <button
                onClick={() => setEntrySheet({ entry })}
                aria-label={`Edit ${entry.title}`}
                className="shrink-0 self-center rounded-full p-2 text-stone-300 transition hover:bg-stone-100 hover:text-stone-500"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
      </main>

      <Fab onClick={() => setEntrySheet({ entry: null })} label="Add entry" />

      <Sheet
        open={pageSheetOpen}
        title="Edit page"
        onClose={() => setPageSheetOpen(false)}
      >
        {page && (
          <>
            <PageForm initial={page} submitting={busy} onSubmit={savePage} />
            <div className="mt-5 space-y-3 border-t border-stone-100 pt-4">
              <div className="flex gap-3">
                <button
                  onClick={() => void movePage("up")}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-stone-200 py-2.5 text-sm font-medium text-stone-600 transition active:scale-95"
                >
                  <ArrowUpIcon className="h-4 w-4" /> Move up
                </button>
                <button
                  onClick={() => void movePage("down")}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-stone-200 py-2.5 text-sm font-medium text-stone-600 transition active:scale-95"
                >
                  <ArrowDownIcon className="h-4 w-4" /> Move down
                </button>
              </div>
              <button
                onClick={() => setConfirm({ kind: "page", id: page.id, title: page.title })}
                className="flex w-full items-center justify-center gap-1.5 rounded-full bg-rose-50 py-2.5 text-sm font-semibold text-rose-500 transition active:scale-95"
              >
                <TrashIcon className="h-4 w-4" /> Delete page
              </button>
            </div>
          </>
        )}
      </Sheet>

      <Sheet
        open={entrySheet !== null}
        title={entrySheet?.entry ? "Edit entry" : "New entry"}
        onClose={() => setEntrySheet(null)}
      >
        <EntryForm
          initial={entrySheet?.entry ?? null}
          submitting={busy}
          onSubmit={saveEntry}
          onMove={moveEntry}
          onDelete={
            entrySheet?.entry
              ? () =>
                  setConfirm({
                    kind: "entry",
                    id: entrySheet.entry!.id,
                    title: entrySheet.entry!.title,
                  })
              : undefined
          }
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
        />
      </Sheet>

      <ConfirmDialog
        open={confirm !== null}
        title={confirm?.kind === "page" ? "Delete this page?" : "Delete this entry?"}
        message={
          confirm
            ? confirm.kind === "page"
              ? `"${confirm.title}" and all of its entries will be removed.`
              : `"${confirm.title}" will be removed.`
            : undefined
        }
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setConfirm(null)}
      />
    </Shell>
  );
}
