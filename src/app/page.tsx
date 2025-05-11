'use client';

import Image from 'next/image';
import Link from 'next/link';

// 仮のパビリオンデータ（後でSupabaseと連携予定）
const pavilions = [
  {
    id: 1,
    name: '日本館',
    image: '/pavilion-img/Nihonkan.png', // public フォルダに画像を置く
    description: '日本館は、大阪・関西万博のテーマである「いのち輝く未来社会のデザイン」を開催国としてプレゼンテーションする拠点であり、当該テーマの具現化や、日本の取り組みの発信等を行います。「いのちと、いのちの、あいだに」をテーマに、万博会場内の生ゴミを利用したバイオガス発電や、世界に貢献しうる日本の先端的な技術等を活用し、一つの循環を創出し、持続可能な社会に向けた来場者の行動変容を促します。'
  },
  {
    id: 2,
    name: 'アメリカパビリオン',
    image: '/pavilion-img/america.jpg',
    description: '共に創出できることを想像しよう 米国パビリオンは米国の革新性と独創性を視覚的に表現。木造の外観が特徴的な三角形の建物2棟と並行に、キューブが浮かぶように配置され、ステージも設けられています。パビリオンでは、テクノロジー、宇宙開発、教育、文化、起業家精神における米国のリーダーシップを紹介し、5つの没入型展示エリアが新たな視点から可能性について考えるよう来場者を迎えます。美しきアメリカ'
  },
];

export default function Home() {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">パビリオン一覧</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {pavilions.map((pavilion) => (
          <Link href={`/pavilion/${pavilion.id}`} key={pavilion.id}>
            <div className="border rounded-xl p-4 shadow hover:shadow-lg transition bg-white">
              <Image
                src={pavilion.image}
                alt={pavilion.name}
                width={500}
                height={300}
                className="rounded-xl object-cover"
              />
              <h2 className="text-xl font-semibold mt-2">{pavilion.name}</h2>
              <p className="text-gray-600 text-sm mt-1">{pavilion.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
