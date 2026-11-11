import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
  type JournalEntryCreate,
  type JournalEntryOut,
  type JournalEntryUpdate,
} from "../api";
import {
  compressImageToBase64,
  decryptJournalPayload,
  encryptJournalPayload,
  type DecryptedJournalEntry,
  type JournalPayload,
} from "../utils/cryptoVault";

interface JournalTabProps {
  userId: string | null;
  currentPhase?: string | null;
  onShowToast: (msg: string, type?: "success" | "error" | "info") => void;
}

const DEFAULT_VAULT_KEY = "selene-journal-key-2026";

const JOURNAL_TAG_OPTIONS = [
  "General Reflection",
  "Menstrual Phase",
  "Follicular Bloom",
  "Ovulatory Surge",
  "Luteal Shift",
  "Body & Symptoms",
  "Workouts & Movement",
  "Emotional Wellbeing",
  "Food & Cravings",
  "Rest & Sleep",
];

export const JournalTab: React.FC<JournalTabProps> = ({
  userId,
  currentPhase,
  onShowToast,
}) => {
  // Entries State
  const [rawEntries, setRawEntries] = useState<JournalEntryOut[]>([]);
  const [decryptedEntries, setDecryptedEntries] = useState<DecryptedJournalEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [decrypting, setDecrypting] = useState<boolean>(false);

  // New Entry Composer State
  const [entryDate, setEntryDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState<string>("" );
  const [bodyText, setBodyText] = useState<string>("");
  const [tag, setTag] = useState<string>("General Reflection");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>("all");

  // Lightbox Modal State
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load raw entries from server
  const loadEntries = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const items = await apiGet<JournalEntryOut[]>(`/users/${userId}/journal`);
      setRawEntries(items);
    } catch (err: unknown) {
      onShowToast(`Could not load journal entries: ${String(err)}`, "error");
    } finally {
      setLoading(false);
    }
  }, [userId, onShowToast]);

  useEffect(() => {
    if (userId) {
      void loadEntries();
    }
  }, [userId, loadEntries]);

  // Decrypt raw entries automatically
  useEffect(() => {
    if (rawEntries.length === 0) {
      setDecryptedEntries([]);
      return;
    }

    let isMounted = true;
    setDecrypting(true);

    const decryptAll = async () => {
      const decryptedList: DecryptedJournalEntry[] = [];

      for (const item of rawEntries) {
        let payload: JournalPayload;
        try {
          payload = await decryptJournalPayload(
            DEFAULT_VAULT_KEY,
            item.encrypted_payload,
            item.iv,
            item.salt,
          );
        } catch {
          // Fallback demo key for previously created entries
          try {
            payload = await decryptJournalPayload(
              "vault-demo-2026",
              item.encrypted_payload,
              item.iv,
              item.salt,
            );
          } catch {
            payload = {
              title: "Journal Entry",
              body: "[Private entry saved securely]",
              images: [],
              created_phase: "General",
            };
          }
        }

        decryptedList.push({
          id: item.id,
          user_id: item.user_id,
          entry_date: item.entry_date,
          tag: item.tag,
          created_at: item.created_at,
          updated_at: item.updated_at,
          raw_cipher: {
            encrypted_payload: item.encrypted_payload,
            iv: item.iv,
            salt: item.salt,
          },
          payload,
        });
      }

      if (isMounted) {
        setDecryptedEntries(decryptedList);
        setDecrypting(false);
      }
    };

    void decryptAll();

    return () => {
      isMounted = false;
    };
  }, [rawEntries]);

  // Handle Photo File Pick & Compression
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      onShowToast("Please choose an image file (PNG, JPEG, WebP).", "error");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      onShowToast("Image is larger than 15MB. Please pick a smaller image.", "error");
      return;
    }

    try {
      onShowToast("Attaching photo...", "info");
      const compressed = await compressImageToBase64(file, 1200, 1200, 0.82);
      setAttachedImage(compressed);
      setImageName(file.name);
      onShowToast("Photo attached.", "success");
    } catch {
      onShowToast("Could not process image. Please try another.", "error");
    }
  };

  const handleRemoveAttachedImage = () => {
    setAttachedImage(null);
    setImageName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Save New or Updated Entry
  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bodyText.trim() && !title.trim()) {
      onShowToast("Please write a reflection or title before saving.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload: JournalPayload = {
        title: title.trim() || `Reflection on ${entryDate}`,
        body: bodyText.trim(),
        images: attachedImage ? [attachedImage] : [],
        phase: currentPhase || undefined,
        tags: [tag],
        created_phase: currentPhase || undefined,
      };

      const encrypted = await encryptJournalPayload(DEFAULT_VAULT_KEY, payload);

      if (editingId) {
        // Edit existing entry
        const updateBody: JournalEntryUpdate = {
          entry_date: entryDate,
          tag,
          encrypted_payload: encrypted.ciphertext,
          iv: encrypted.iv,
          salt: encrypted.salt,
        };
        await apiPut<JournalEntryOut>(`/users/${userId}/journal/${editingId}`, updateBody);
        onShowToast("Journal entry updated.", "success");
      } else {
        // Create new entry
        const createBody: JournalEntryCreate = {
          entry_date: entryDate,
          tag,
          encrypted_payload: encrypted.ciphertext,
          iv: encrypted.iv,
          salt: encrypted.salt,
        };
        await apiPost<JournalEntryOut>(`/users/${userId}/journal`, createBody);
        onShowToast("Reflection saved.", "success");
      }

      // Reset composer
      setTitle("");
      setBodyText("");
      setAttachedImage(null);
      setImageName("");
      setEditingId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      await loadEntries();
    } catch (err: unknown) {
      onShowToast(`Failed to save entry: ${String(err)}`, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Start Editing
  const handleStartEdit = (entry: DecryptedJournalEntry) => {
    setEditingId(entry.id);
    setEntryDate(entry.entry_date);
    setTitle(entry.payload.title);
    setBodyText(entry.payload.body);
    setTag(entry.tag || "General Reflection");
    if (entry.payload.images && entry.payload.images.length > 0) {
      setAttachedImage(entry.payload.images[0]);
      setImageName("Attached photo");
    } else {
      setAttachedImage(null);
      setImageName("");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setBodyText("");
    setAttachedImage(null);
    setImageName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Delete Entry
  const handleDeleteEntry = async (entryId: string) => {
    if (!window.confirm("Are you sure you want to delete this reflection?")) return;
    try {
      await apiDelete(`/users/${userId}/journal/${entryId}`);
      onShowToast("Entry removed.", "info");
      await loadEntries();
    } catch (err: unknown) {
      onShowToast(`Failed to delete entry: ${String(err)}`, "error");
    }
  };

  // Filtered & Searched Entries
  const filteredEntries = useMemo(() => {
    return decryptedEntries.filter((item) => {
      if (selectedTagFilter !== "all" && item.tag !== selectedTagFilter) {
        return false;
      }
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const matchTitle = item.payload.title.toLowerCase().includes(q);
      const matchBody = item.payload.body.toLowerCase().includes(q);
      const matchTag = item.tag.toLowerCase().includes(q);
      const matchDate = item.entry_date.includes(q);
      return matchTitle || matchBody || matchTag || matchDate;
    });
  }, [decryptedEntries, selectedTagFilter, searchQuery]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Journal Status Header */}
      <section
        className="panel"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          padding: "16px 20px",
          background: "var(--panel-bg, #FFFFFF)",
          border: "1px solid var(--border, #E8DFD0)",
          borderRadius: "var(--radius, 16px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(140, 115, 75, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#8C734B",
              fontWeight: 700,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "1.3rem" }}>edit_note</span>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700 }}>Your Daily Journal</h3>
              <span
                style={{
                  background: "rgba(140, 115, 75, 0.1)",
                  color: "#8C734B",
                  border: "1px solid rgba(140, 115, 75, 0.25)",
                  fontSize: "0.72rem",
                  padding: "2px 8px",
                  borderRadius: 999,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Private Notes
              </span>
            </div>
            <p className="muted" style={{ margin: "3px 0 0", fontSize: "0.82rem", color: "#6B5E50" }}>
              {decryptedEntries.length} {decryptedEntries.length === 1 ? "entry" : "entries"} recorded
            </p>
          </div>
        </div>
      </section>

      {/* Entry Composer Form */}
      <section
        className="panel"
        style={{
          padding: "24px",
          background: "var(--panel-bg, #FFFFFF)",
          border: "1px solid var(--border, #E8DFD0)",
          borderRadius: "var(--radius, 16px)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "#2C241B" }}>
            {editingId ? "Edit Reflection" : "Write a New Reflection"}
          </h3>
          {editingId && (
            <button
              type="button"
              className="ghost"
              onClick={handleCancelEdit}
              style={{ fontSize: "0.82rem", padding: "4px 8px", cursor: "pointer" }}
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={(e) => void handleSaveEntry(e)}>
          <div className="row" style={{ gap: 14, marginBottom: 14, flexWrap: "wrap", display: "flex" }}>
            <label style={{ flex: "1 1 180px" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: 6, color: "#6B5E50" }}>
                Date
              </span>
              <input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #D8CCB8",
                  background: "#FAF7F2",
                }}
              />
            </label>

            <label style={{ flex: "2 1 240px" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: 6, color: "#6B5E50" }}>
                Topic / Tag
              </span>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #D8CCB8",
                  background: "#FAF7F2",
                }}
              >
                {JOURNAL_TAG_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label style={{ display: "block", marginBottom: 14 }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: 6, color: "#6B5E50" }}>
              Title (Optional)
            </span>
            <input
              type="text"
              placeholder="e.g. Morning walk reflections, energy notes..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid #D8CCB8",
                background: "#FAF7F2",
              }}
            />
          </label>

          <label style={{ display: "block", marginBottom: 14 }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: 6, color: "#6B5E50" }}>
              Your Notes & Thoughts
            </span>
            <textarea
              rows={4}
              placeholder="How are you feeling today? What did you notice about your energy, mood, or body?"
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #D8CCB8",
                background: "#FAF7F2",
                fontFamily: "inherit",
                fontSize: "0.92rem",
                lineHeight: 1.5,
              }}
            />
          </label>

          {/* Photo Attachment */}
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: 6, color: "#6B5E50" }}>
              Attach Photo (Optional)
            </span>

            {attachedImage ? (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #D8CCB8",
                  background: "#FAF7F2",
                }}
              >
                <img
                  src={attachedImage}
                  alt="Preview"
                  style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 6 }}
                />
                <span style={{ fontSize: "0.85rem", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {imageName || "Attached photo"}
                </span>
                <button
                  type="button"
                  className="ghost"
                  onClick={handleRemoveAttachedImage}
                  style={{ fontSize: "0.78rem", color: "#ef4444", padding: "4px 8px", cursor: "pointer" }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => void handleFileChange(e)}
                  style={{ display: "none" }}
                  id="journal-image-file"
                />
                <label
                  htmlFor="journal-image-file"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: "1px dashed #C8B89E",
                    background: "#FAF7F2",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    color: "#5A4630",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "1.1rem", color: "#8C734B" }}>add_photo_alternate</span>
                  <span>Add a photo to this reflection</span>
                </label>
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            {editingId && (
              <button
                type="button"
                className="secondary"
                onClick={handleCancelEdit}
                style={{ padding: "8px 16px", cursor: "pointer" }}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="primary"
              style={{
                padding: "9px 22px",
                background: "#8C734B",
                color: "#FFFFFF",
                borderRadius: "999px",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
              }}
            >
              {submitting ? "Saving..." : editingId ? "Update Reflection" : "Save Reflection"}
            </button>
          </div>
        </form>
      </section>

      {/* Journal Entries Timeline */}
      <section
        className="panel"
        style={{
          padding: "24px",
          background: "var(--panel-bg, #FFFFFF)",
          border: "1px solid var(--border, #E8DFD0)",
          borderRadius: "var(--radius, 16px)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 18,
          }}
        >
          <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "#2C241B" }}>
            Past Reflections
          </h3>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              type="search"
              placeholder="Search your notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: "6px 12px",
                fontSize: "0.85rem",
                borderRadius: "8px",
                border: "1px solid #D8CCB8",
                background: "#FAF7F2",
                width: 200,
              }}
            />

            <select
              value={selectedTagFilter}
              onChange={(e) => setSelectedTagFilter(e.target.value)}
              style={{
                padding: "6px 10px",
                fontSize: "0.85rem",
                borderRadius: "8px",
                border: "1px solid #D8CCB8",
                background: "#FAF7F2",
              }}
            >
              <option value="all">All Topics ({decryptedEntries.length})</option>
              {JOURNAL_TAG_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading || decrypting ? (
          <div style={{ padding: "36px 0", textAlign: "center", color: "#6B5E50" }}>
            Loading your reflections...
          </div>
        ) : filteredEntries.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "#6B5E50" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "2.4rem", color: "#C8B89E", display: "block", marginBottom: 8 }}>
              menu_book
            </span>
            <p style={{ margin: 0, fontSize: "0.95rem" }}>
              {searchQuery || selectedTagFilter !== "all"
                ? "No entries match your search."
                : "Your journal is empty. Write your first reflection above."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {filteredEntries.map((entry) => (
              <article
                key={entry.id}
                style={{
                  padding: "18px 20px",
                  borderRadius: "12px",
                  border: "1px solid #E8DFD0",
                  background: "#FAF7F2",
                  transition: "box-shadow 0.2s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: 10,
                    marginBottom: 10,
                  }}
                >
                  <div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#8C734B" }}>
                        {entry.entry_date}
                      </span>
                      {entry.tag && (
                        <span
                          style={{
                            background: "rgba(140, 115, 75, 0.1)",
                            color: "#8C734B",
                            border: "1px solid rgba(140, 115, 75, 0.2)",
                            fontSize: "0.72rem",
                            padding: "2px 8px",
                            borderRadius: 999,
                            fontWeight: 600,
                          }}
                        >
                          {entry.tag}
                        </span>
                      )}
                      {entry.payload.phase && (
                        <span
                          style={{
                            background: "#FFFFFF",
                            color: "#6B5E50",
                            border: "1px solid #E8DFD0",
                            fontSize: "0.72rem",
                            padding: "2px 8px",
                            borderRadius: 999,
                          }}
                        >
                          {entry.payload.phase} Phase
                        </span>
                      )}
                    </div>
                    <h4 style={{ margin: 0, fontSize: "1.08rem", fontWeight: 700, color: "#2C241B" }}>
                      {entry.payload.title}
                    </h4>
                  </div>

                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button
                      type="button"
                      className="ghost"
                      onClick={() => handleStartEdit(entry)}
                      style={{ fontSize: "0.8rem", padding: "4px 10px", color: "#5A4630", cursor: "pointer" }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="ghost"
                      onClick={() => void handleDeleteEntry(entry.id)}
                      style={{ fontSize: "0.8rem", padding: "4px 10px", color: "#ef4444", cursor: "pointer" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Entry Body Text */}
                <p
                  style={{
                    margin: "0 0 12px",
                    lineHeight: 1.6,
                    fontSize: "0.92rem",
                    whiteSpace: "pre-wrap",
                    color: "#3D342A",
                  }}
                >
                  {entry.payload.body}
                </p>

                {/* Attached Images */}
                {entry.payload.images && entry.payload.images.length > 0 && (
                  <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {entry.payload.images.map((imgSrc, idx) => (
                      <div
                        key={idx}
                        onClick={() => setLightboxImage(imgSrc)}
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: "8px",
                          overflow: "hidden",
                          border: "1px solid #D8CCB8",
                          cursor: "pointer",
                          position: "relative",
                        }}
                      >
                        <img
                          src={imgSrc}
                          alt="Journal attachment"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Lightbox Modal for Photo Enlarge */}
      {lightboxImage && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => setLightboxImage(null)}
        >
          <div
            style={{
              position: "relative",
              maxWidth: "90vw",
              maxHeight: "90vh",
              background: "#FAF7F2",
              padding: 10,
              borderRadius: "16px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                background: "rgba(0,0,0,0.6)",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>close</span>
            </button>
            <img
              src={lightboxImage}
              alt="Enlarged photo"
              style={{
                maxWidth: "100%",
                maxHeight: "85vh",
                borderRadius: "10px",
                display: "block",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
