import MobileShell from '@/components/layout/MobileShell';
import Header from '@/components/layout/Header';
import TabBar from '@/components/layout/TabBar';
import BottomNav from '@/components/layout/BottomNav';
import RequestCard from '@/components/requests/RequestCard';
import { requests } from '@/lib/mock-data';

export default function RequestsPage() {
  return (
    <MobileShell>
      <Header />
      <TabBar />
      <div className="flex-1 px-6 py-5 flex flex-col gap-3 pb-4">
        {requests.map((req) => (
          <RequestCard key={req.id} request={req} />
        ))}
      </div>
      <BottomNav />
    </MobileShell>
  );
}
