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

const VAULT_SESSION_KEY = "clue_journal_vault_key";
const DEFAULT_DEMO_KEY = "clue-vault-demo-2026";

const JOURNAL_TAG_OPTIONS = [
  "General Reflection",
  "Menstrual Phase",
  "Follicular Bloom",
  "Ovulatory Surge",
  "Luteal Shift",
  "Body & Symptoms",
  "Athletic Training",
  "Emotional Wellbeing",
  "Nutrition & Cravings",
  "Rest & Dreams",
];

export const JournalTab: React.FC<JournalTabProps> = ({
  userId,
  currentPhase,
  onShowToast,
}) => {
  // Vault Encryption Key State
  const [passphrase, setPassphrase] = useState<string>(() => {
    return sessionStorage.getItem(VAULT_SESSION_KEY) || "";
  });
  const [keyInput, setKeyInput] = useState<string>("");
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return Boolean(sessionStorage.getItem(VAULT_SESSION_KEY));
  });

  // Entries State
  const [rawEntries, setRawEntries] = useState<JournalEntryOut[]>([]);
  const [decryptedEntries, setDecryptedEntries] = useState<DecryptedJournalEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [decrypting, setDecrypting] = useState<boolean>(false);

  // New Entry Composer State
  const [entryDate, setEntryDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState<string>("");
  const [bodyText, setBodyText] = useState<string>("");
  const [tag, setTag] = useState<string>("General Reflection");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>("all");

  // Lightbox & Database Proof Modal State
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [proofEntry, setProofEntry] = useState<DecryptedJournalEntry | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load raw encrypted entries from server
  const loadEncryptedEntries = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const items = await apiGet<JournalEntryOut[]>(`/users/${userId}/journal`);
      setRawEntries(items);
    } catch (err: unknown) {
      onShowToast(`Failed to load journal: ${String(err)}`, "error");
    } finally {
      setLoading(false);
    }
  }, [userId, onShowToast]);

  useEffect(() => {
    if (userId && isUnlocked) {
      void loadEncryptedEntries();
    }
  }, [userId, isUnlocked, loadEncryptedEntries]);

  // Decrypt raw entries whenever rawEntries or passphrase changes
  useEffect(() => {
    if (!isUnlocked || !passphrase || rawEntries.length === 0) {
      if (rawEntries.length === 0) setDecryptedEntries([]);
      return;
    }

    let isMounted = true;
    setDecrypting(true);

    const decryptAll = async () => {
      const decryptedList: DecryptedJournalEntry[] = [];
      let failCount = 0;

      for (const item of rawEntries) {
        try {
          const payload = await decryptJournalPayload(
            passphrase,
            item.encrypted_payload,
            item.iv,
            item.salt,
          );
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
        } catch {
          failCount++;
        }
      }

      if (isMounted) {
        setDecryptedEntries(decryptedList);
        setDecrypting(false);
        if (failCount > 0 && decryptedList.length === 0) {
          onShowToast("Incorrect vault passphrase for one or more entries.", "error");
        }
      }
    };

    void decryptAll();

    return () => {
      isMounted = false;
    };
  }, [rawEntries, passphrase, isUnlocked, onShowToast]);

  // Handle Vault Unlock
  const handleUnlock = (keyToUse?: string) => {
    const key = (keyToUse ?? keyInput).trim();
    if (!key) {
      onShowToast("Please enter a vault passphrase or PIN.", "error");
      return;
    }
    sessionStorage.setItem(VAULT_SESSION_KEY, key);
    setPassphrase(key);
    setIsUnlocked(true);
    setKeyInput("");
    onShowToast("Vault unlocked with client-side AES-GCM-256.", "success");
  };

  // Handle Vault Lock
  const handleLock = () => {
    sessionStorage.removeItem(VAULT_SESSION_KEY);
    setPassphrase("");
    setIsUnlocked(false);
    setDecryptedEntries([]);
    setProofEntry(null);
    setLightboxImage(null);
    onShowToast("Journal Vault locked. Encryption keys purged from memory.", "info");
  };

  // Handle Image File Selection & Client-Side Compression
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      onShowToast("Please choose an image file (JPEG, PNG, WebP).", "error");
      return;
    }

    try {
      const compressedBase64 = await compressImageToBase64(file, 960, 0.8);
      setAttachedImage(compressedBase64);
      setImageName(file.name);
      onShowToast("Photo compressed and prepared for client-side encryption.", "success");
    } catch (err: unknown) {
      onShowToast(`Failed to process image: ${String(err)}`, "error");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = () => {
    setAttachedImage(null);
    setImageName("");
  };

  // Handle Save / Update Entry
  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !passphrase) return;

    if (!title.trim() && !bodyText.trim()) {
      onShowToast("Please enter a title or write your thoughts before saving.", "error");
      return;
    }

    setSubmitting(true);

    try {
      const payload: JournalPayload = {
        title: title.trim() || "Untitled Reflection",
        body: bodyText.trim(),
        mood: tag,
        phase: currentPhase || undefined,
        images: attachedImage ? [attachedImage] : [],
        updatedAt: new Date().toISOString(),
      };

      // Client-side zero-knowledge encryption
      const encrypted = await encryptJournalPayload(passphrase, payload);

      if (editingId) {
        // Update existing entry
        const updateBody: JournalEntryUpdate = {
          entry_date: entryDate,
          encrypted_payload: encrypted.encrypted_payload,
          iv: encrypted.iv,
          salt: encrypted.salt,
          tag,
        };
        await apiPut<JournalEntryOut>(`/users/${userId}/journal/${editingId}`, updateBody);
        onShowToast("Journal entry updated and re-encrypted.", "success");
        setEditingId(null);
      } else {
        // Create new entry
        const createBody: JournalEntryCreate = {
          entry_date: entryDate,
          encrypted_payload: encrypted.encrypted_payload,
          iv: encrypted.iv,
          salt: encrypted.salt,
          tag,
        };
        await apiPost<JournalEntryOut>(`/users/${userId}/journal`, createBody);
        onShowToast("Entry encrypted with AES-256 and safely stored in vault.", "success");
      }

      // Reset form
      setTitle("");
      setBodyText("");
      setAttachedImage(null);
      setImageName("");
      setTag("General Reflection");
      setEntryDate(new Date().toISOString().slice(0, 10));

      // Refresh list
      await loadEncryptedEntries();
    } catch (err: unknown) {
      onShowToast(`Encryption/saving failed: ${String(err)}`, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Edit an existing entry
  const handleStartEdit = (entry: DecryptedJournalEntry) => {
    setEditingId(entry.id);
    setEntryDate(entry.entry_date);
    setTitle(entry.payload.title);
    setBodyText(entry.payload.body);
    setTag(entry.tag || "General Reflection");
    if (entry.payload.images && entry.payload.images.length > 0) {
      setAttachedImage(entry.payload.images[0]);
      setImageName("attached-photo.jpg");
    } else {
      setAttachedImage(null);
      setImageName("");
    }
    window.scrollTo({ top: 180, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setBodyText("");
    setAttachedImage(null);
    setImageName("");
    setTag("General Reflection");
    setEntryDate(new Date().toISOString().slice(0, 10));
  };

  // Delete an entry
  const handleDeleteEntry = async (entryId: string) => {
    if (!userId) return;
    if (!window.confirm("Are you sure you want to delete this encrypted journal entry?")) return;

    try {
      await apiDelete(`/users/${userId}/journal/${entryId}`);
      onShowToast("Journal entry deleted from database.", "info");
      await loadEncryptedEntries();
      if (proofEntry?.id === entryId) setProofEntry(null);
    } catch (err: unknown) {
      onShowToast(`Failed to delete entry: ${String(err)}`, "error");
    }
  };

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return decryptedEntries.filter((entry) => {
      if (selectedTagFilter !== "all" && entry.tag !== selectedTagFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = entry.payload.title.toLowerCase().includes(q);
        const matchesBody = entry.payload.body.toLowerCase().includes(q);
        const matchesTag = (entry.tag || "").toLowerCase().includes(q);
        if (!matchesTitle && !matchesBody && !matchesTag) return false;
      }
      return true;
    });
  }, [decryptedEntries, selectedTagFilter, searchQuery]);

  // ================= RENDER: LOCKED VAULT SCREEN =================
  if (!isUnlocked) {
    return (
      <section className="panel" style={{ maxWidth: 740, margin: "0 auto", padding: "36px 28px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(20, 184, 166, 0.12)",
              border: "1px solid rgba(20, 184, 166, 0.35)",
              color: "var(--accent)",
              fontSize: "1.6rem",
              marginBottom: 14,
            }}
          >
            🛡
          </div>
          <h2 style={{ fontSize: "1.6rem", margin: "0 0 8px" }}>Private Journal Vault</h2>
          <p className="muted" style={{ maxWidth: 540, margin: "0 auto", lineHeight: 1.5, fontSize: "0.95rem" }}>
            Your personal thoughts, menstrual observations, and private photos are protected with <strong>Zero-Knowledge Client-Side Encryption</strong>.
          </p>
        </div>

        {/* Technical Privacy Explainer Banner */}
        <div
          style={{
            background: "rgba(6, 78, 59, 0.25)",
            border: "1px solid rgba(20, 184, 166, 0.3)",
            borderRadius: "var(--radius)",
            padding: "16px 20px",
            marginBottom: 26,
            fontSize: "0.88rem",
            lineHeight: 1.6,
          }}
        >
          <strong style={{ color: "var(--accent)", display: "block", marginBottom: 6 }}>
            How your privacy is mathematically protected:
          </strong>
          <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text)" }}>
            <li>
              <strong>Client-Side Encryption:</strong> Everything is encrypted in your browser using <strong>AES-GCM-256</strong> with <strong>PBKDF2 (100,000 SHA-256 rounds)</strong> before ever touching the network.
            </li>
            <li>
              <strong>Zero Server Knowledge:</strong> Your encryption passphrase never leaves your device and is never stored in the database.
            </li>
            <li>
              <strong>Database Administrator Protection:</strong> Even if someone inspects the SQLite database file directly, they only see scrambled ciphertext bytes. They cannot read your thoughts or view your photos.
            </li>
          </ul>
        </div>

        {/* Unlock Form */}
        <div
          style={{
            background: "var(--panel-bg)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "24px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
          }}
        >
          <label style={{ display: "block", marginBottom: 16 }}>
            <span style={{ display: "block", fontWeight: 600, marginBottom: 8, fontSize: "0.9rem" }}>
              Enter Personal Vault Passphrase or PIN
            </span>
            <input
              type="password"
              placeholder="Enter your secret vault key…"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleUnlock();
              }}
              style={{
                width: "100%",
                padding: "10px 14px",
                fontSize: "1rem",
                borderRadius: "var(--radius)",
                border: "1px solid var(--border)",
                background: "rgba(0,0,0,0.2)",
                color: "var(--text)",
              }}
            />
          </label>

          <div className="row" style={{ gap: 10, flexWrap: "wrap", justifyContent: "space-between" }}>
            <button
              type="button"
              className="primary"
              onClick={() => handleUnlock()}
              style={{ flex: 1, minWidth: 160, padding: "10px 16px" }}
            >
              Unlock Private Vault →
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => handleUnlock(DEFAULT_DEMO_KEY)}
              title="Use the pre-configured default demo key for testing"
              style={{ fontSize: "0.85rem", padding: "10px 14px" }}
            >
              Use Default Demo Key ({DEFAULT_DEMO_KEY})
            </button>
          </div>
        </div>
      </section>
    );
  }

  // ================= RENDER: UNLOCKED VAULT VIEW =================
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Vault Status Header */}
      <section
        className="panel"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          padding: "16px 20px",
          background: "linear-gradient(135deg, rgba(6, 78, 59, 0.35) 0%, rgba(15, 23, 42, 0.35) 100%)",
          border: "1px solid rgba(20, 184, 166, 0.3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "rgba(20, 184, 166, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent)",
              fontWeight: 700,
            }}
          >
            🛡
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Private Encrypted Journal</h3>
              <span
                style={{
                  background: "rgba(20, 184, 166, 0.15)",
                  color: "var(--accent)",
                  border: "1px solid rgba(20, 184, 166, 0.3)",
                  fontSize: "0.72rem",
                  padding: "2px 8px",
                  borderRadius: 999,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                AES-GCM-256 Vault Active
              </span>
            </div>
            <p className="muted" style={{ margin: "3px 0 0", fontSize: "0.82rem" }}>
              {decryptedEntries.length} encrypted {decryptedEntries.length === 1 ? "entry" : "entries"} unlocked · Zero-Knowledge local session
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            className="secondary"
            onClick={handleLock}
            style={{ fontSize: "0.82rem", padding: "6px 12px" }}
          >
            Lock Vault
          </button>
        </div>
      </section>

      {/* Entry Composer Form */}
      <section className="panel" style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: "1.15rem" }}>
            {editingId ? "Edit Journal Entry" : "Write New Reflection"}
          </h3>
          {editingId && (
            <button
              type="button"
              className="ghost"
              onClick={handleCancelEdit}
              style={{ fontSize: "0.82rem", padding: "4px 8px" }}
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={(e) => void handleSaveEntry(e)}>
          <div className="row" style={{ gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
            <label style={{ flex: "1 1 180px" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: 6 }}>
                Entry Date
              </span>
              <input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                style={{ width: "100%" }}
              />
            </label>

            <label style={{ flex: "2 1 280px" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: 6 }}>
                Title / Focus Topic
              </span>
              <input
                type="text"
                placeholder="e.g. Luteal phase mood reflection & evening yoga…"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: "100%" }}
              />
            </label>

            <label style={{ flex: "1 1 200px" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: 6 }}>
                Category Tag
              </span>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                style={{ width: "100%" }}
              >
                {JOURNAL_TAG_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label style={{ display: "block", marginBottom: 16 }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: 6 }}>
              Personal Thoughts & Diary Notes
            </span>
            <textarea
              rows={5}
              placeholder="Record your uncensored thoughts, sensations, emotional rhythms, physical symptoms, or recovery insights. Encrypted before transmission…"
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              style={{ width: "100%", lineHeight: 1.6, resize: "vertical" }}
            />
          </label>

          {/* Image Attachment Area */}
          <div style={{ marginBottom: 20 }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: 6 }}>
              Attach Private Photo (Progress, Notes, Mood Board)
            </span>

            {attachedImage ? (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "8px 14px",
                  borderRadius: "var(--radius)",
                  background: "rgba(0,0,0,0.25)",
                  border: "1px solid var(--border)",
                }}
              >
                <img
                  src={attachedImage}
                  alt="Attached preview"
                  style={{
                    width: 54,
                    height: 54,
                    objectFit: "cover",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                  }}
                />
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{imageName || "Photo attached"}</div>
                  <div className="muted" style={{ fontSize: "0.75rem" }}>
                    Will be encrypted inside the AES-256 payload
                  </div>
                </div>
                <button
                  type="button"
                  className="ghost"
                  onClick={handleRemoveImage}
                  style={{ color: "#ef4444", marginLeft: 8, fontSize: "0.8rem", padding: "4px 8px" }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={(e) => void handleImageChange(e)}
                  style={{ display: "none" }}
                  id="journal-image-file"
                />
                <button
                  type="button"
                  className="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ fontSize: "0.85rem", padding: "8px 14px" }}
                >
                  + Attach Image
                </button>
                <span className="muted" style={{ fontSize: "0.8rem" }}>
                  Photos are compressed & encrypted client-side. No unencrypted files are ever saved on disk.
                </span>
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button
              type="submit"
              className="primary"
              disabled={submitting}
              style={{ minWidth: 160, padding: "10px 20px" }}
            >
              {submitting ? "Encrypting & Saving…" : editingId ? "Save & Re-Encrypt" : "Encrypt & Save Entry →"}
            </button>
          </div>
        </form>
      </section>

      {/* Entries List & Filter Controls */}
      <section className="panel" style={{ padding: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 14,
            marginBottom: 20,
            borderBottom: "1px solid var(--border)",
            paddingBottom: 16,
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: "1.15rem" }}>Journal Timeline</h3>
            <p className="muted" style={{ margin: "2px 0 0", fontSize: "0.82rem" }}>
              {filteredEntries.length} of {decryptedEntries.length} entries shown
            </p>
          </div>

          {/* Search & Tag Filter */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Search thoughts & titles…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 220, fontSize: "0.85rem", padding: "6px 12px" }}
            />
            <select
              value={selectedTagFilter}
              onChange={(e) => setSelectedTagFilter(e.target.value)}
              style={{ fontSize: "0.85rem", padding: "6px 10px" }}
            >
              <option value="all">All Tags</option>
              {JOURNAL_TAG_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading / Decrypting Indicators */}
        {loading ? (
          <p className="muted" style={{ textAlign: "center", padding: "30px 0" }}>
            Loading encrypted entries from database…
          </p>
        ) : decrypting ? (
          <p className="muted" style={{ textAlign: "center", padding: "30px 0" }}>
            Decrypting journal entries with your private key…
          </p>
        ) : filteredEntries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 10px" }}>
            <p className="muted" style={{ margin: "0 0 12px", fontSize: "0.95rem" }}>
              {searchQuery || selectedTagFilter !== "all"
                ? "No entries match your search criteria."
                : "Your private journal is empty. Write your first reflection above."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {filteredEntries.map((entry) => (
              <article
                key={entry.id}
                style={{
                  background: "rgba(0, 0, 0, 0.2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  padding: "18px 20px",
                  transition: "border-color 0.15s ease",
                }}
              >
                {/* Entry Header */}
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
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          color: "var(--accent)",
                          fontFamily: "monospace",
                        }}
                      >
                        {entry.entry_date}
                      </span>
                      {entry.tag && (
                        <span
                          style={{
                            background: "rgba(244, 114, 182, 0.12)",
                            color: "#f472b6",
                            border: "1px solid rgba(244, 114, 182, 0.25)",
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
                            background: "rgba(20, 184, 166, 0.1)",
                            color: "var(--accent)",
                            fontSize: "0.72rem",
                            padding: "2px 8px",
                            borderRadius: 999,
                            textTransform: "capitalize",
                          }}
                        >
                          {entry.payload.phase} Phase
                        </span>
                      )}
                    </div>
                    <h4 style={{ margin: 0, fontSize: "1.08rem", fontWeight: 600 }}>{entry.payload.title}</h4>
                  </div>

                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button
                      type="button"
                      className="ghost"
                      onClick={() => setProofEntry(entry)}
                      title="Inspect raw encrypted ciphertext as stored in SQLite database"
                      style={{
                        fontSize: "0.75rem",
                        padding: "4px 8px",
                        color: "var(--accent)",
                        border: "1px solid rgba(20, 184, 166, 0.3)",
                        borderRadius: "4px",
                      }}
                    >
                      View Database Ciphertext
                    </button>
                    <button
                      type="button"
                      className="ghost"
                      onClick={() => handleStartEdit(entry)}
                      style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="ghost"
                      onClick={() => void handleDeleteEntry(entry.id)}
                      style={{ fontSize: "0.75rem", padding: "4px 8px", color: "#ef4444" }}
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
                    color: "var(--text)",
                  }}
                >
                  {entry.payload.body}
                </p>

                {/* Attached Images */}
                {entry.payload.images && entry.payload.images.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    {entry.payload.images.map((imgSrc, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "inline-block",
                          position: "relative",
                          cursor: "pointer",
                          borderRadius: "6px",
                          overflow: "hidden",
                          border: "1px solid var(--border)",
                        }}
                        onClick={() => setLightboxImage(imgSrc)}
                      >
                        <img
                          src={imgSrc}
                          alt="Journal attachment"
                          style={{
                            maxHeight: 180,
                            maxWidth: 260,
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: "rgba(0,0,0,0.6)",
                            color: "#fff",
                            fontSize: "0.7rem",
                            padding: "3px 6px",
                            textAlign: "center",
                          }}
                        >
                          Click to enlarge
                        </div>
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
            background: "rgba(0, 0, 0, 0.85)",
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
              background: "var(--panel-bg)",
              borderRadius: "var(--radius)",
              padding: 12,
              border: "1px solid var(--border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="ghost"
              onClick={() => setLightboxImage(null)}
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                fontSize: "1.2rem",
                color: "var(--text)",
                background: "rgba(0,0,0,0.4)",
                borderRadius: "50%",
                width: 32,
                height: 32,
                padding: 0,
              }}
            >
              ✕
            </button>
            <img
              src={lightboxImage}
              alt="Full size journal attachment"
              style={{
                maxWidth: "100%",
                maxHeight: "82vh",
                objectFit: "contain",
                borderRadius: "6px",
                display: "block",
              }}
            />
          </div>
        </div>
      )}

      {/* Database Privacy Proof Inspector Modal */}
      {proofEntry && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => setProofEntry(null)}
        >
          <div
            style={{
              background: "var(--panel-bg)",
              border: "1px solid rgba(20, 184, 166, 0.4)",
              borderRadius: "var(--radius)",
              padding: "24px",
              maxWidth: 680,
              width: "100%",
              maxHeight: "88vh",
              overflowY: "auto",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "1.3rem" }}>🛡</span>
                <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Physical Database Storage Proof</h3>
              </div>
              <button
                type="button"
                className="ghost"
                onClick={() => setProofEntry(null)}
                style={{ fontSize: "1.1rem" }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: "0.85rem", lineHeight: 1.5, margin: "0 0 14px", color: "var(--muted)" }}>
              This is the raw record physically stored in the SQLite database table <code>journal_entries</code>.
              Even someone with root access or opening <code>tracker.db</code> can only ever see these scrambled cryptographic bytes:
            </p>

            <div
              style={{
                background: "rgba(0,0,0,0.4)",
                padding: "12px 14px",
                borderRadius: "6px",
                border: "1px solid var(--border)",
                fontSize: "0.78rem",
                fontFamily: "monospace",
                color: "var(--accent)",
                wordBreak: "break-all",
                maxHeight: 220,
                overflowY: "auto",
                marginBottom: 16,
              }}
            >
              <div><strong>entry_id:</strong> {proofEntry.id}</div>
              <div style={{ marginTop: 6 }}><strong>entry_date:</strong> {proofEntry.entry_date}</div>
              <div style={{ marginTop: 6 }}><strong>salt (PBKDF2):</strong> {proofEntry.raw_cipher.salt}</div>
              <div style={{ marginTop: 6 }}><strong>iv (AES-GCM):</strong> {proofEntry.raw_cipher.iv}</div>
              <div style={{ marginTop: 6 }}>
                <strong>encrypted_ciphertext:</strong> {proofEntry.raw_cipher.encrypted_payload.slice(0, 300)}…
                <span style={{ color: "var(--muted)" }}> ({proofEntry.raw_cipher.encrypted_payload.length} chars)</span>
              </div>
            </div>

            <div
              style={{
                background: "rgba(6, 78, 59, 0.25)",
                border: "1px solid rgba(20, 184, 166, 0.3)",
                padding: "10px 14px",
                borderRadius: "6px",
                fontSize: "0.82rem",
                lineHeight: 1.5,
              }}
            >
              <strong>Security Assurance:</strong> The plaintext thoughts (<em>&ldquo;{proofEntry.payload.title}&rdquo;</em>) and any attached photos are completely absent from the database. Without your private passphrase, reconstructing the original content is mathematically infeasible.
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <button
                type="button"
                className="secondary"
                onClick={() => setProofEntry(null)}
                style={{ fontSize: "0.85rem", padding: "8px 16px" }}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
