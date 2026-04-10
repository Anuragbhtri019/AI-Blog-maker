import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

/**
 * Main layout wrapper for pages
 */
export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-text">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
