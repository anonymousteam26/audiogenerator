"use client";

import { useEffect, useRef, useState } from "react";

type LengthMode = "short" | "medium" | "long";

interface Episode {
  id: string;
  title: string;
  sourceName: string;
  lengthMode: LengthMode;
  status: string;
  audioUrl: string | null;
  durationSec: number | null;
  createdAt: string;
}

const LENGTH_LABELS: Record<LengthMode, string> = {
  short: "Short (~3 min)",
  medium: "Medium (~7 min)",
  long: "Long (~15 min)",
};

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [lengthMode, setLengthMode] = useState<LengthMode>("medium");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeEpisodeId, setActiveEpisodeId] = useState<string | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const loadEpisodes = async () => {
    const res = await fetch("/api/episodes");
    const data = await res.json();
    setEpisodes(data.episodes ?? []);
  };

  useEffect(() => {
    loadEpisodes();
  }, []);

  useEffect(() => {
    if (!activeEpisodeId) return;
    pollRef.current = setInterval(async () => {
      const res = await fetch(`/api/episodes/${activeEpisodeId}`);
      const data = await res.json();
      if (data.episode?.status === "ready" || data.episode?.status === "failed") {
        clearInterval(pollRef.current!);
        setActiveEpisodeId(null);
        setSubmitting(false);
        loadEpisodes();
      }
    }, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activeEpisodeId]);

  const handleSubmit = async () => {
    if (!file) return;
    setError(null);
    setSubmitting(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("lengthMode", lengthMode);

    try {
      const res = await fetch("/api/generate", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setActiveEpisodeId(data.episodeId);
      loadEpisodes();
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <h1>Doc → Podcast</h1>
      <p className="subtitle">Upload a document. Get a two-host podcast discussing it.</p>

      <div className="panel">
        <div
          className="dropzone"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const dropped = e.dataTransfer.files[0];
            if (dropped) setFile(dropped);
          }}
        >
          {file ? file.name : "Click or drag a PDF, DOCX, or TXT file here"}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt,.md"
          hidden
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />

        <div className="length-toggle">
          {(Object.keys(LENGTH_LABELS) as LengthMode[]).map((mode) => (
            <button
              key={mode}
              className={`length-btn ${lengthMode === mode ? "active" : ""}`}
              onClick={() => setLengthMode(mode)}
            >
              {LENGTH_LABELS[mode]}
            </button>
          ))}
        </div>

        <button className="generate-btn" onClick={handleSubmit} disabled={!file || submitting}>
          {submitting ? "Generating…" : "Generate podcast"}
        </button>

        {error && <p className="error-text">{error}</p>}
        {submitting && !error && (
          <p className="episode-meta" style={{ marginTop: 8 }}>
            This can take a minute or two — writing the script, then narrating it.
          </p>
        )}
      </div>

      <div className="panel">
        <h2 style={{ fontSize: 18, marginTop: 0 }}>Past episodes</h2>
        {episodes.length === 0 && <p className="episode-meta">No episodes yet.</p>}
        {episodes.map((ep) => (
          <div className="episode-item" key={ep.id}>
            <div className="episode-title">{ep.title}</div>
            <div className="episode-meta">
              {LENGTH_LABELS[ep.lengthMode]} ·{" "}
              <span className="status-pill">{ep.status}</span>
              {ep.durationSec ? ` · ~${Math.round(ep.durationSec / 60)} min` : ""}
            </div>
            {ep.status === "ready" && ep.audioUrl && (
              <audio controls src={ep.audioUrl} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
