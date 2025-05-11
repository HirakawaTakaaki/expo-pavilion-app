'use client';

import { useParams } from 'next/navigation';

const mockPavilions = [
  {
    id: 1,
    name: '日本館',
    description: '日本の文化と技術を紹介するパビリオンです。',
    reviews: [
      { name: 'Taro', comment: 'とても感動しました！' },
      { name: 'Yuki', comment: '伝統と未来が融合していて良かったです。' },
    ],
  },
  {
    id: 2,
    name: '未来館',
    description: '最先端の未来技術を体験できる展示です。',
    reviews: [
      { name: 'Ken', comment: 'ロボットの実演がすごかった！' },
    ],
  },
];

export default function PavilionDetail() {
  const params = useParams();
  const id = Number(params.id);

  const pavilion = mockPavilions.find((p) => p.id === id);

  if (!pavilion) return <p className="p-4">パビリオンが見つかりませんでした。</p>;

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-2">{pavilion.name}</h1>
      <p className="text-gray-700 mb-4">{pavilion.description}</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">口コミ一覧</h2>
      <ul className="space-y-2">
        {pavilion.reviews.map((review, index) => (
          <li key={index} className="border rounded p-2 bg-white shadow">
            <strong>{review.name}</strong>: {review.comment}
          </li>
        ))}
      </ul>
    </main>
  );
}
