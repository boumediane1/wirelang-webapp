import { useEffect, useState } from 'react';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  duration: string;
}

interface VideoCategory {
  categoryId: number;
  categoryTitle: string;
  videos: Video[];
}

type CategoriesState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: VideoCategory[] }
  | { status: 'error'; error: Error };

const App = () => {
  const [state, setState] = useState<CategoriesState>({ status: 'idle' });

  useEffect(() => {
    const fetchCategories = async () => {
      setState({ status: 'loading' });

      try {
        const response = await fetch(
          'http://localhost:8000/api/videos/popular',
        );

        if (response.ok) {
          const categories: VideoCategory[] = await response.json();
          setState({ status: 'success', data: categories });
        } else {
          setState({
            status: 'error',
            error: new Error(`HTTP error! status: ${response.status}`),
          });
        }
      } catch (error) {
        setState({
          status: 'error',
          error: error instanceof Error ? error : new Error('Unknown error'),
        });
      }
    };

    void fetchCategories();
  }, []);

  switch (state.status) {
    case 'idle':
      return 'idle';

    case 'loading':
      return 'loading';

    case 'error':
      return state.error.message;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      {state.data.map((category) => (
        <section key={category.categoryId} className="space-y-4">
          <h2 className="text-xl font-semibold">{category.categoryTitle}</h2>
          {category.videos.length === 0 ? (
            <p className="text-sm text-gray-500">No videos found.</p>
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {category.videos.map((video) => (
                <li key={video.id} className="space-y-2">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="aspect-video w-full rounded object-cover"
                  />
                  <p className="font-medium">{video.title}</p>
                  <p className="text-sm text-gray-600">{video.channelTitle}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
};

export default App;
