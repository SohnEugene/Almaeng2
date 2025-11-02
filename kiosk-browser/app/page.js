"use client"; // 이 파일이 클라이언트에서만 렌더링됨을 명시

import { useEffect, useState } from "react";

export default function HomePage() {
  const [weight, setWeight] = useState(null);

  useEffect(() => {
    const fetchWeight = async () => {
      try {
        const res = await fetch("http://10.0.2.2:8000/weight");
        const data = await res.json();
        setWeight(data.weight);
      } catch (err) {
        console.error("Failed to fetch weight:", err);
      }
    };

    fetchWeight();
    const interval = setInterval(fetchWeight, 1000); // 1초마다 갱신
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "20vh" }}>
      <h1>Current Weight</h1>
      <p style={{ fontSize: "2rem" }}>
        {weight !== null ? `${weight} kg` : "Loading..."}
      </p>
    </div>
  );
}
