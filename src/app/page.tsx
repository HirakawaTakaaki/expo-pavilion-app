// src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Pavilion {
  id: number;
  name: string;
  description: string;
  image_url: string;
}

export default function Home() {
  const [pavilions, setPavilions] = useState<Pavilion[]>([]);
  const [viewType, setViewType] = useState<'list' | 'block'>('list');
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [again, setAgain] = useState<'yes' | 'no' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchPavilions = async () => {
      const { data, error } = await supabase.from('pavilions').select('*').order('id');
      if (!error) setPavilions(data || []);
    };
    fetchPavilions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || again === null) return;
    setIsSubmitting(true);

    const { error } = await supabase.from('reviews').insert([
      {
        pavilion_id: selectedId,
        name: name || '匿名',
        comment,
        again: again === 'yes',
      },
    ]);

    if (!error) {
      setName('');
      setComment('');
      setAgain(null);
      setReviewDialogOpen(false);
    } else {
      alert('投稿に失敗しました');
    }

    setIsSubmitting(false);
  };

  return (
    <main className="relative p-6 max-w-5xl mx-auto text-slate-800 dark:text-slate-100">
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
        </div>
      </div>

      {viewType === 'list' ? (
        <ul className="space-y-4">
          {pavilions.map((p) => (
            <li key={p.id} className="flex justify-between items-center border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition cursor-pointer">
              <span
                onClick={() => router.push(`/pavilion/${p.id}`)}
                className="text-lg font-semibold text-blue-700 dark:text-blue-400 hover:underline"
              >
                {p.name}
              </span>
              <button
                className="text-sm text-blue-600 hover:underline"
                onClick={() => {
                  setSelectedId(p.id);
                  setReviewDialogOpen(true);
                }}
              >
                投稿する
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {pavilions.map((p) => (
            <div
              key={p.id}
              className="relative flex flex-col border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition"
            >
              <div onClick={() => router.push(`/pavilion/${p.id}`)} className="cursor-pointer">
                <Image
                  src={p.image_url}
                  alt={p.name}
                  width={500}
                  height={300}
                  className="rounded-xl object-cover w-full h-40"
                />
                <h2 className="text-lg font-bold mt-3 text-blue-800 dark:text-blue-300">{p.name}</h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 line-clamp-3 mb-6">
                  {p.description}
                </p>
              </div>
              <button
                className="absolute bottom-4 right-4 text-sm text-blue-600 hover:underline"
                onClick={() => {
                  setSelectedId(p.id);
                  setReviewDialogOpen(true);
                }}
              >
                投稿する
              </button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>口コミを投稿</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium">名前（任意）</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-2 rounded text-sm"
            />
            <label htmlFor="comment" className="block text-sm font-medium">コメント</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              className="w-full border p-2 rounded text-sm"
            />
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="again"
                  value="yes"
                  checked={again === 'yes'}
                  onChange={() => setAgain('yes')}
                /> はい
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="again"
                  value="no"
                  checked={again === 'no'}
                  onChange={() => setAgain('no')}
                /> いいえ
              </label>
            </div>
            <button
              type="submit"
              disabled={isSubmitting || again === null}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              投稿する
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
