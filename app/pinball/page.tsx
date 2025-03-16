"use client";

import dynamic from "next/dynamic";

const PinballGame = dynamic(() => import("./PinballGame"), {
  ssr: false,
  loading: () => <div style={{ color: "#fff", fontSize: "24px" }}>Chargement...</div>,
});

export default function PinballPage() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#000",
        overflow: "hidden",
      }}
    >
      <PinballGame />
    </div>
  );
}