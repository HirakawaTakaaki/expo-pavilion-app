// src/app/pavilion/[id]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';

interface Pavilion {
  id: number;
  name: string;
  description: string;
  image_url: string;
}

interface Review {
  id: number;
  pavilion_id: number;
  name: string;
  comment: string;
  again: boolean;
  created_at: string;
}

export default function PavilionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [pavilion, setPavilion] = useState<Pavilion | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [again, setAgain] = useState<'yes' | 'no' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: pavilionData }, { data: reviewData }] = await Promise.all([
        supabase.from('pavilions').select('*').eq('id', id).single(),
        supabase.from('reviews').select('*').eq('pavilion_id', id).order('id', { ascending: false }),
      ]);

      setPavilion(pavilionData);
      setReviews(reviewData || []);
      setLoading(false);
    };

    if (id) fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || again === null) return;
    setIsSubmitting(true);

    const { error } = await supabase.from('reviews').insert([
      {
        pavilion_id: Number(id),
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
      const { data: updated } = await supabase.from('reviews').select('*').eq('pavilion_id', id).order('id', { ascending: false });
      setReviews(updated || []);
    } else {
      alert('投稿に失敗しました');
    }

    setIsSubmitting(false);
  };

  if (loading) return <div className="p-6 text-center">読み込み中...</div>;
  if (!pavilion) return <div className="p-6 text-center text-red-500">パビリオンが見つかりませんでした。</div>;

  return (
    <main className="max-w-3xl mx-auto p-6 text-slate-800 dark:text-slate-100">
      <button
        className="mb-4 text-blue-600 hover:underline text-sm"
        onClick={() => router.back()}
      >
        ← 一覧に戻る
      </button>

      <h1 className="text-3xl font-bold mb-4">{pavilion.name}</h1>
      <Image
        src={pavilion.image_url}
        alt={pavilion.name}
        width={800}
        height={400}
        className="rounded-xl mb-4 object-cover"
      />
      <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed whitespace-pre-wrap mb-6">
        {pavilion.description}
      </p>

      <section>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">口コミ一覧</h2>
          <button
            className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            onClick={() => setReviewDialogOpen(true)}
          >
            投稿する
          </button>
        </div>

        {reviews.length === 0 ? (
          <p className="text-sm text-gray-500">まだ口コミがありません。</p>
        ) : (
          <ul className="space-y-2">
            {reviews.map((r) => (
              <li key={r.id} className="border-b pb-2 text-sm">
                <p className="font-semibold">{r.name || '匿名'}</p>
                <p>{r.comment}</p>
                <p className="text-xs text-gray-500 italic">
  また行きたい：{r.again ? 'はい' : 'いいえ'} / 投稿日時：{new Date(r.created_at).toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>口コミを投稿</DialogTitle>
            <DialogClose className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl">×</DialogClose>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              type="text"
              placeholder="名前（任意）"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-2 rounded text-sm"
            />
            <textarea
              placeholder="コメント"
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
