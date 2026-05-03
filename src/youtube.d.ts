declare namespace YT {
  interface PlayerEvent {
    target: Player;
  }

  interface OnStateChangeEvent extends PlayerEvent {
    data: PlayerState;
  }

  interface PlayerOptions {
    videoId: string;
    events?: {
      onReady?: (event: PlayerEvent) => void;
      onStateChange?: (event: OnStateChangeEvent) => void;
    };
  }

  class Player {
    constructor(elementId: HTMLDivElement, options: PlayerOptions);
    mute(): void;
    playVideo(): void;
    pauseVideo(): void;
    destroy(): void;
    seekTo(seconds: number, allowSeekAhead: boolean);
    getCurrentTime(): number;
  }

  enum PlayerState {
    UNSTARTED = -1,
    ENDED = 0,
    PLAYING = 1,
    PAUSED = 2,
    BUFFERING = 3,
    CUED = 5,
  }
}

interface Window {
  onYouTubeIframeAPIReady: (() => void) | undefined;
}
