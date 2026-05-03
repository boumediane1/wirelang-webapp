import { useAsyncState } from './useAsyncState';
import { Link } from 'react-router';
import { useYouTubePlayer } from './useYouTubePlayer';
import { useEffect, useRef, useState } from 'react';

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

  const { ref, time, seekTo, pauseVideo } = useYouTubePlayer('M7FIvfx5J10');

  const [autoPause, setAutoPause] = useState(false);

  const segments = state.status === 'success' ? state.data : [];

  const segmentIndex = segments.findLastIndex(
    (segment) => time >= segment.start,
  );

  const previousSegment = segments[segmentIndex - 1];
  const currentSegment = segments[segmentIndex];
  const nextSegment = segments[segmentIndex + 1];

  const lastPausedAtSegmentIndex = useRef<number | null>(null);
  const lastTime = useRef(0);

  useEffect(() => {
    if (!autoPause || !currentSegment) return;

    if (time < lastTime.current) {
      lastPausedAtSegmentIndex.current = null;
    }

    const end = currentSegment.start + currentSegment.duration;

    // prevent auto-pause after resuming immediately
    if (lastPausedAtSegmentIndex.current === segmentIndex) {
      return;
    }

    if (time >= end) {
      lastPausedAtSegmentIndex.current = segmentIndex;
      pauseVideo();
    }
    lastTime.current = time;
  }, [autoPause, time, segmentIndex, currentSegment, pauseVideo]);

  return (
    <>
      <Link to="/">Home</Link>
      <div className="mx-auto flex max-w-6xl gap-4 p-6">
        <div>
          <div
            ref={ref}
            style={{ backgroundColor: '#000', width: 640, height: 390 }}
          />

          {currentSegment &&
            time < currentSegment.start + currentSegment.duration && (
              <p>{currentSegment.text}</p>
            )}

          <div className="flex gap-x-4">
            <button
              disabled={previousSegment === undefined}
              onClick={() => {
                if (previousSegment) {
                  seekTo(previousSegment.start);
                }
              }}
            >
              Previous
            </button>

            <button
              disabled={currentSegment === undefined}
              onClick={() => {
                if (currentSegment) {
                  seekTo(currentSegment.start);
                }
              }}
            >
              Repeat
            </button>

            <button
              disabled={nextSegment === undefined}
              onClick={() => {
                if (nextSegment) {
                  seekTo(nextSegment.start);
                }
              }}
            >
              Next
            </button>
            <button onClick={() => setAutoPause(!autoPause)}>Auto-pause</button>
          </div>
        </div>

        {state.status === 'loading' && <p>loading…</p>}
        {state.status === 'error' && <p>{state.error.message}</p>}
        {state.status === 'success' && (
          <ul>
            {state.data.map((segment) => (
              <li
                key={segment.start}
                onClick={() => {
                  seekTo(segment.start);
                }}
              >
                <div
                  className={`flex gap-4 ${segment === currentSegment ? 'bg-red-500' : ''}`}
                >
                  <div>{segment.start}</div>
                  <div>{segment.text}</div>
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
