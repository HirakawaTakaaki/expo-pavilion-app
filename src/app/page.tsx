// src/app/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';

interface Pavilion {
  id: number;
  name: string;
  description: string;
  image_url: string;
}

interface Review {
  pavilion_id: number;
  again: boolean;
  name?: string;
  comment?: string;
}

export default function Home() {
  const [pavilions, setPavilions] = useState<Pavilion[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [viewType, setViewType] = useState<'list' | 'block'>('list');
  const [sortType, setSortType] = useState<'default' | 'rating'>('default');
  const [selected, setSelected] = useState<Pavilion | null>(null);
  const [showDetail, setShowDetail] = useState(true);

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
        .select('pavilion_id, again, name, comment');

      if (!error) setReviews(data || []);
    };

    fetchPavilions();
    fetchReviews();
  }, []);

  const getReviewSummary = (pavilionId: number) => {
    const relevant = reviews.filter((r) => r.pavilion_id === pavilionId);
    const yesCount = relevant.filter((r) => r.again).length;
    const total = relevant.length;
    return total > 0 ? `${yesCount} / ${total}人が「また行きたい」` : 'まだ評価がありません';
  };

  const getYesRate = (pavilionId: number): number => {
    const relevant = reviews.filter((r) => r.pavilion_id === pavilionId);
    if (relevant.length === 0) return -1;
    return relevant.filter((r) => r.again).length / relevant.length;
  };

  const sortedPavilions = useMemo(() => {
    if (sortType === 'default') return pavilions;
    return [...pavilions].sort((a, b) => getYesRate(b.id) - getYesRate(a.id));
  }, [pavilions, reviews, sortType]);

  return (
    <main className="p-6 max-w-5xl mx-auto text-slate-800 dark:text-slate-100">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-center sm:text-left text-primary">パビリオン一覧</h1>
        <div className="flex gap-4">
          <ToggleGroup
            type="single"
            value={viewType}
            onValueChange={(val) => val && setViewType(val as 'list' | 'block')}
            className="border rounded-xl overflow-hidden bg-background text-foreground shadow"
          >
            <ToggleGroupItem value="list" className="px-4 py-2">リスト表示</ToggleGroupItem>
            <ToggleGroupItem value="block" className="px-4 py-2">ブロック表示</ToggleGroupItem>
          </ToggleGroup>

          <ToggleGroup
            type="single"
            value={sortType}
            onValueChange={(val) => val && setSortType(val as 'default' | 'rating')}
            className="border rounded-xl overflow-hidden bg-background text-foreground shadow"
          >
            <ToggleGroupItem value="default" className="px-4 py-2">通常順</ToggleGroupItem>
            <ToggleGroupItem value="rating" className="px-4 py-2">評価順</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {viewType === 'list' ? (
        <ul className="space-y-4">
          {sortedPavilions.map((p) => (
            <li key={p.id} className="flex justify-between items-center border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition cursor-pointer" onClick={() => { setSelected(p); setShowDetail(true); }}>
              <span className="text-lg font-semibold text-blue-700 dark:text-blue-400 hover:underline">{p.name}</span>
              <p className="text-sm text-slate-500 italic">{getReviewSummary(p.id)}</p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {sortedPavilions.map((p) => (
            <div
              key={p.id}
              onClick={() => { setSelected(p); setShowDetail(true); }}
              className="cursor-pointer border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition"
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
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
            <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
              {selected && getReviewSummary(selected.id)}
            </DialogDescription>
            <DialogClose className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"></DialogClose>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              <button
                className="text-sm text-blue-600 hover:underline"
                onClick={() => setShowDetail(!showDetail)}
              >
                {showDetail ? 'パビリオン情報を隠す' : 'パビリオン情報を表示'}
              </button>

              {showDetail && (
                <div className="space-y-2">
                  <Image
                    src={selected.image_url}
                    alt={selected.name}
                    width={500}
                    height={300}
                    className="rounded-xl object-cover"
                  />
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selected.description}</p>
                </div>
              )}

              <div>
                <h3 className="text-md font-semibold mb-2">口コミ一覧</h3>
                <ul className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  {reviews
                    .filter((r) => r.pavilion_id === selected.id)
                    .map((r, i) => (
                      <li key={i} className="text-sm text-gray-700 dark:text-gray-300 border-b pb-1">
                        <strong>{r.name || '匿名'}</strong>: {r.comment || '(コメントなし)'}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
