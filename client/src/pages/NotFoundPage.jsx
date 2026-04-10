import { Link } from 'react-router-dom';
import { Home, ArrowRight } from 'lucide-react';

/**
 * 404 Not Found page
 */
export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">
          404
        </h1>
        <h2 className="text-3xl md:text-4xl font-bold mb-2">Page Not Found</h2>
        <p className="text-lg text-muted mb-8 max-w-md">
          Sorry, the page you're looking for doesn't exist. Let's get you back on track.
        </p>

        <Link
          to="/"
          className="btn-primary px-8 py-4 inline-flex items-center gap-2 text-lg hover:scale-105 transition-transform"
        >
          <Home size={24} />
          Back to Home
          <ArrowRight size={24} />
        </Link>

        {/* Decorative element */}
        <div className="mt-16 opacity-10">
          <div className="text-9xl">VibeBlog</div>
        </div>
      </div>
    </div>
  );
}
