import { useAsyncState } from './useAsyncState.ts';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  duration: string;
}

interface CategoryVideos {
  categoryId: number;
  categoryTitle: string;
  videos: Video[];
}

const App = () => {
  const state = useAsyncState<CategoryVideos[]>(async () => {
    const response = await fetch('http://localhost:8000/api/videos/popular');
    if (!response.ok) {
      throw new Error(`Could not fetch videos from API`);
    }
    return (await response.json()) as CategoryVideos[];
  });

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
