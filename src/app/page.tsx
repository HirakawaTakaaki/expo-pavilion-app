// src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface Pavilion {
  id: number;
  name: string;
  description: string;
  image_url: string;
}

interface Review {
  pavilion_id: number;
  again: boolean;
}

export default function Home() {
  const [pavilions, setPavilions] = useState<Pavilion[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [viewType, setViewType] = useState<'list' | 'block'>('list');

  useEffect(() => {
    const fetchPavilions = async () => {
      const { data, error } = await supabase
        .from('pavilions')
        .select('*')
        .order('id');

      if (!error) setPavilions(data || []);
    };

    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('pavilion_id, again');

      if (!error) setReviews(data || []);
    };

    fetchPavilions();
    fetchReviews();
  }, []);

  const getReviewSummary = (pavilionId: number) => {
    const relevant = reviews.filter((r) => r.pavilion_id === pavilionId);
    const yesCount = relevant.filter((r) => r.again).length;
    const total = relevant.length;
    return total > 0 ? `${yesCount} / ${total}人が「また行きたい」` : '評価なし';
  };

  return (
    <main className="p-6 max-w-5xl mx-auto text-slate-800 dark:text-slate-100">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-center sm:text-left text-primary">パビリオン一覧</h1>
        <ToggleGroup
          type="single"
          value={viewType}
          onValueChange={(val) => val && setViewType(val as 'list' | 'block')}
          className="border rounded-xl overflow-hidden bg-background text-foreground shadow"
        >
          <ToggleGroupItem value="list" className="px-4 py-2">リスト表示</ToggleGroupItem>
          <ToggleGroupItem value="block" className="px-4 py-2">ブロック表示</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {viewType === 'list' ? (
        <ul className="space-y-4">
          {pavilions.map((p) => (
            <li key={p.id} className="flex gap-4 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition">
              <Image src={p.image_url} alt={p.name} width={150} height={100} className="object-cover rounded-xl" />
              <div className="flex-1">
                <Link href={`/pavilion/${p.id}`} className="text-lg font-semibold text-blue-700 dark:text-blue-400 hover:underline">
                  {p.name}
                </Link>
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-1 line-clamp-2">{p.description}</p>
                <p className="text-sm text-slate-500 italic">{getReviewSummary(p.id)}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {pavilions.map((p) => (
            <Link
              key={p.id}
              href={`/pavilion/${p.id}`}
              className="block border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition"
            >
              <Image
                src={p.image_url}
                alt={p.name}
                width={500}
                height={300}
                className="rounded-xl object-cover"
              />
              <h2 className="text-lg font-bold mt-3 text-blue-800 dark:text-blue-300">{p.name}</h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 line-clamp-2">{p.description}</p>
              <p className="text-sm text-slate-500 italic mt-1">{getReviewSummary(p.id)}</p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
