"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/api/message") // Appel à ton backend Spring Boot
      .then((response) => response.text())
      .then((data) => setMessage(data))
      .catch((error) => console.error("Erreur lors de la requête:", error));
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-2xl font-bold">Message du backend :</h1>
        <p className="text-lg text-blue-500">{message || "Chargement..."}</p>
      </main>
    </div>
  );
}
