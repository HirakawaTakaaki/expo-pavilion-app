'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Pavilion = {
  id: number;
  name: string;
  description: string;
};

type Review = {
  name: string;
  comment: string;
};

export default function PavilionDetail() {
  const { id } = useParams();
  const pavilionId = Number(id);

  const [pavilion, setPavilion] = useState<Pavilion | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // パビリオンの情報を取得
  const fetchPavilionInfo = async () => {
    const { data, error } = await supabase
      .from('pavilions')
      .select('*')
      .eq('id', pavilionId)
      .single();

    if (!error) {
      setPavilion(data);
    } else {
      console.error('パビリオン取得エラー:', error.message);
    }
  };

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('name, comment')
      .eq('pavilion_id', pavilionId)
      .order('created_at', { ascending: false });

    if (!error) setReviews(data || []);
  };

  useEffect(() => {
    fetchPavilionInfo();
    fetchReviews();
  }, [pavilionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase.from('reviews').insert([
      {
        pavilion_id: pavilionId,
        name: name || '匿名',
        comment,
      },
    ]);

    if (!error) {
      setComment('');
      setName('');
      fetchReviews(); // 再取得
    } else {
      alert('投稿に失敗しました');
    }

    setIsSubmitting(false);
  };

  if (!pavilion) return <p className="p-4">読み込み中...</p>;

  return (
    <main className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">{pavilion.name}</h1>
      <p className="text-gray-600 mb-4">{pavilion.description}</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">口コミ投稿</h2>
      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <input
          type="text"
          placeholder="名前（任意）"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <textarea
          placeholder="コメントを入力してください"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          disabled={isSubmitting || !comment}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          投稿する
        </button>
      </form>

      <h2 className="text-xl font-semibold mt-6 mb-2">口コミ一覧</h2>
      <ul className="space-y-2">
        {reviews.length === 0 ? (
          <p className="text-gray-500">まだ口コミはありません。</p>
        ) : (
          reviews.map((review, index) => (
            <li key={index} className="border rounded p-2 bg-white shadow">
              <strong>{review.name}</strong>: {review.comment}
            </li>
          ))
        )}
      </ul>
    </main>
  );
}
