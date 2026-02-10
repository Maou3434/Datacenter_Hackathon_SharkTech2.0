import { Outlet } from 'react-router';
import TopNavigation from './TopNavigation';
import { Toaster } from './ui/sonner';

export default function Root() {
  return (
    <div className="h-screen w-full flex flex-col bg-[#000411]">
      <TopNavigation />
      <Toaster />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}