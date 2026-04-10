import MobileShell from '@/components/layout/MobileShell';
import Header from '@/components/layout/Header';
import TabBar from '@/components/layout/TabBar';
import BottomNav from '@/components/layout/BottomNav';
import RequestCard from '@/components/requests/RequestCard';
import { getRequests } from '@/lib/actions/requests';
import { mapRequest } from '@/lib/mappers';

export default async function RequestsPage() {
  const rawRequests = await getRequests();
  const requests = rawRequests.map(mapRequest);

  return (
    <MobileShell>
      <Header />
      <TabBar />
      <div className="flex-1 px-6 py-5 flex flex-col gap-3 pb-4">
        {requests.length === 0 ? (
          <p className="text-[13px] text-text-dim text-center py-10">
            No ride requests right now. If you need a lift, post a request.
          </p>
        ) : (
          requests.map((req) => (
            <RequestCard key={req.id} request={req} />
          ))
        )}
      </div>
      <BottomNav />
    </MobileShell>
  );
}
