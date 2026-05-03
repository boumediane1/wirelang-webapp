import { useEffect, useRef, useState } from 'react';

export const useYouTubePlayer = (videoId: string) => {
  const player = useRef<YT.Player | null>(null);
  const [time, setTime] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const seekTo = (seconds: number, allowSeekAhead: boolean) => {
    return player.current?.seekTo(seconds, allowSeekAhead);
  };

  useEffect(() => {
    const src = 'https://www.youtube.com/iframe_api';

    if (!document.querySelector(`script[src='${src}']`)) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (element === null) return;

    let intervalId: number;

    const init = () => {
      player.current = new YT.Player(element, {
        videoId,
        events: {
          onReady: () => {
            intervalId = setInterval(() => {
              if (player.current === null) return;
              setTime(player.current.getCurrentTime());
            }, 50);
          },

          onStateChange: (event) => {
            console.log('onStateChange', event);
          },
        },
      });
    };

    // small TypeScript lie
    if (window.YT?.Player) {
      init();
    } else {
      window.onYouTubeIframeAPIReady = init;
    }

    return () => {
      clearInterval(intervalId);
      player.current?.destroy();
      player.current = null;
    };
  }, [videoId]);

  return { ref, time, seekTo };
};
