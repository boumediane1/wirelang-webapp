import { useAsyncState } from './useAsyncState';
import { Link } from 'react-router';
import { useYouTubePlayer } from './useYouTubePlayer';

interface SubtitleSegment {
  duration: number;
  start: number;
  text: string;
}

const VideoPlayer = () => {
  const state = useAsyncState<SubtitleSegment[]>(async () => {
    const response = await fetch(
      'http://localhost:8000/api/videos/M7FIvfx5J10/transcription',
    );

    if (!response.ok) {
      throw new Error('failed to fetch transcription');
    }

    return response.json();
  });

  const { ref, time, seekTo } = useYouTubePlayer('M7FIvfx5J10');

  const segmentIndex =
    state.status === 'success'
      ? state.data.findLastIndex((segment) => time >= segment.start)
      : -1;

  return (
    <>
      <Link to="/">Home</Link>
      <div className="mx-auto flex max-w-6xl gap-4 p-6">
        <div>
          <div
            ref={ref}
            style={{ backgroundColor: '#000', width: 640, height: 390 }}
          />

          {state.status === 'success' &&
            segmentIndex !== -1 &&
            time <
              state.data[segmentIndex].start +
                state.data[segmentIndex].duration && (
              <p>{state.data[segmentIndex].text}</p>
            )}

          <div className="flex gap-x-4">
            <button
              disabled={segmentIndex <= 0}
              onClick={() => {
                if (state.status === 'success') {
                  seekTo(state.data[segmentIndex - 1].start);
                }
              }}
            >
              Previous
            </button>

            <button
              disabled={
                state.status !== 'success' ||
                segmentIndex === state.data.length - 1
              }
              onClick={() => {
                if (state.status === 'success') {
                  seekTo(state.data[segmentIndex + 1].start);
                }
              }}
            >
              Next
            </button>
            <button>Auto-pause</button>
          </div>
        </div>

        {state.status === 'loading' && <p>loading…</p>}
        {state.status === 'error' && <p>{state.error.message}</p>}
        {state.status === 'success' && (
          <ul>
            {state.data.map((s) => (
              <li
                key={s.start}
                onClick={() => {
                  seekTo(s.start);
                }}
              >
                <div
                  className={`flex gap-4 ${s.start === state.data[segmentIndex]?.start ? 'bg-red-500' : ''}`}
                >
                  <div>{s.start}</div>
                  <div>{s.text}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default VideoPlayer;
