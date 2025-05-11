'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';

type Pavilion = {
  id: number;
  name: string;
  description: string;
  image_url: string;
};

export default function Home() {
  const [pavilions, setPavilions] = useState<Pavilion[]>([]);

  useEffect(() => {
    const fetchPavilions = async () => {
      const { data, error } = await supabase
        .from('pavilions')
        .select('*')
        .order('id');

      if (error) {
        console.error('エラー:', error.message);
      } else {
        console.log('取得したデータ:', data); // ← これを追加
        setPavilions(data as Pavilion[]);
      }
    };

    fetchPavilions();
  }, []);


  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">パビリオン一覧</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {pavilions.map((pavilion) => (
          <Link href={`/pavilion/${pavilion.id}`} key={pavilion.id}>
            <div className="border rounded-xl p-4 shadow hover:shadow-lg transition bg-white">
              <Image
                src={pavilion.image_url}
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
