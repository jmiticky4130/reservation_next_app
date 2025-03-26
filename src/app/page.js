import {getUser} from '@/app/lib/data';
import Link from 'next/link';

export default async function Home() {
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  <Link  href="/searchPage">
  searchPage
  
  </Link>
  </div>
  );
}
