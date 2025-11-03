
import dynamic from 'next/dynamic';

const LoanManagementSystem = dynamic(
  () => import('../components/LoanManagementSystem').then((mod) => mod.default),
  { 
    ssr: false,
    loading: () => <div>Cargando...</div>
  }
);

export default function Home() {
  return <LoanManagementSystem />;
}
