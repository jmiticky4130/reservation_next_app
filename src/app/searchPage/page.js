import Search from  '@/app/components/search';
import { Suspense } from 'react';
import { getUser } from '../lib/data';
import UserDisplay from '../components/UserDisplay';
 

export default async function Page(props) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
 
  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search users..." />
      </div>
      <Suspense key={query + currentPage} fallback={<div>Loading...</div>}>
        <UserDisplay query={query} currentPage={currentPage} />
      </Suspense>
    </div>
  );
}