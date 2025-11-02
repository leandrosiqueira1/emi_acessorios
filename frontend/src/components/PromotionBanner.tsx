'use client';
import { useEffect, useState } from "react";

type Promotion = {
  title: string;
  end_date: string;
};

export default function PromotionBanner() {
  const [promo, setPromo] = useState<Promotion | null>(null);
  const [timeLeft, setTimeLeft] = useState("");
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

  useEffect(() => {
    fetch(`${BACKEND}/promotions`)
      .then(res => res.json())
      .then(data => {
        if (data) setPromo(data);
      });
  }, []);

  useEffect(() => {
    if (!promo) return;
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(promo.end_date).getTime();
      const diff = end - now;
      if (diff <= 0) {
        setTimeLeft("Promoção encerrada!");
        clearInterval(interval);
        return;
      }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [promo]);

  if (!promo) return null;

  return (
    <div className="bg-gradient-to-tr from-[#64f5ca] via-[#ffa9df] to-[#FFD700] text-2xl text-black text-center py-2 font-bold shadow-md">
      🎉 {promo.title} | ⏰ {timeLeft}
    </div>
  );
}
