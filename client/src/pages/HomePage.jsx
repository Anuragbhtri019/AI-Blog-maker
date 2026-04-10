import { useState, useCallback, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';
import BlogCard from '../components/BlogCard';
import { Loader2, Filter } from 'lucide-react';
import { useInfiniteScroll } from '../hooks';
import { HOMEPAGE_CATEGORIES } from '../constants/categories';

/**
 * Home page with infinite scroll feed and category filter
 */
export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isScrolling, setIsScrolling] = useState(false);

  /**
   * Fetch blogs with pagination
   */
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } =
    useInfiniteQuery({
      queryKey: ['blogs', selectedCategory],
      queryFn: async ({ pageParam = 0 }) => {
        const params = {
          page: pageParam,
          limit: 9,
          ...(selectedCategory !== 'All' && { category: selectedCategory }),
        };
        const response = await apiClient.get('/blogs', { params });
        return response.data;
      },
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.blogs.length < 9) return undefined;
        return pages.length;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchInterval: 1000 * 60 * 2, // Refresh feed to surface scheduled auto-blogs
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: true,
    });

  // Infinite scroll hook
  useInfiniteScroll(
    () => {
      if (hasNextPage && !isFetchingNextPage) {
        setIsScrolling(true);
        fetchNextPage();
      }
    },
    { threshold: 500 }
  );

  // Flatten pages array into single blog array
  const blogs = data?.pages.flatMap(page => page.blogs) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={40} className="animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-danger bg-opacity-10 text-danger p-6 rounded-lg">
          <p>Error loading blogs: {error?.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Welcome to VibeBlog
          </h1>
          <p className="text-lg md:text-xl text-muted max-w-3xl mx-auto leading-relaxed">
            Discover stories, ideas, and insights from our community. Read beautiful, well-crafted
            content every day.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-16 px-2 -mx-2 scrollbar-hide">
          <Filter size={20} className="text-primary flex-shrink-0" />
          {HOMEPAGE_CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`px-5 py-2.5 rounded-full font-semibold transition-all duration-300 whitespace-nowrap text-sm ${
                selectedCategory === category
                  ? 'bg-primary text-white shadow-lg shadow-primary/50 scale-105'
                  : 'bg-surface text-text hover:bg-surface/80 border border-muted/30 hover:border-primary'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Blogs Grid */}
        {blogs.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {blogs.map((blog, index) => (
                <div key={`${blog._id}-${index}`} className="fade-in">
                  <BlogCard blog={blog} />
                </div>
              ))}
            </div>

            {/* Load more button */}
            {hasNextPage && (
              <div className="flex justify-center py-12">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="btn-primary px-10 py-3.5 flex items-center gap-2 font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-muted font-medium">No blogs found in this category.</p>
          </div>
        )}
      </section>
    </div>
  );
}
