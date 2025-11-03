
import dynamic from 'next/dynamic';
const LoanManagementSystem = dynamic(() => import('../components/LoanManagementSystem'), { ssr: false });
export default function Home() {
  return <LoanManagementSystem />;
}
