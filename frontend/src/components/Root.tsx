import { Outlet } from 'react-router';
import TopNavigation from './TopNavigation';

export default function Root() {
  return (
    <div className="h-screen w-full flex flex-col bg-[#000411]">
      <TopNavigation />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}