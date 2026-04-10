import { Link } from 'react-router-dom';
import { Heart, Github, Twitter } from 'lucide-react';

/**
 * Footer component
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface border-t border-muted mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg" />
              <span className="font-bold text-lg">VibeBlog</span>
            </div>
            <p className="text-sm text-muted">
              A beautiful platform for reading and sharing ideas.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="link-hover">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/" className="link-hover">
                  Trending
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="link-hover">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="link-hover">
                  API Docs
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold mb-4">Follow</h3>
            <div className="flex gap-4">
              <a href="#" className="p-2 hover:bg-background rounded-lg transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="p-2 hover:bg-background rounded-lg transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-muted pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted">
          <p>
            © {currentYear} VibeBlog. All rights reserved.
          </p>
          <div className="flex items-center gap-1">
            Made with <Heart size={16} className="text-accent" /> by VibeBlog Team
          </div>
        </div>
      </div>
    </footer>
  );
}
