
import dynamic from 'next/dynamic';

const ReferenceAuthCard = dynamic(() => import('@/components/auth/ReferenceAuthCard'), {
  ssr: false,
  loading: () => <div className="h-[720px] animate-pulse rounded-[2rem] bg-slate-100" />,
});

export default function Home() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] px-4 pb-12 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <ReferenceAuthCard defaultTab="login" />
      </div>
    </div>
  );
}
