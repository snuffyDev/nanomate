export const createPlaybackController = (animation: Animation) => {
	return {
		play: () => {
			animation.play();
			return new Promise<Animation>((resolve) => {
				animation.finished.then(resolve).catch(() => {
					animation.commitStyles();
				});
			});
		},
		pause: () => {
			animation.pause();
		},
		cancel: () => {
			animation.cancel();
		},
		finish: () => {
			animation.finish();
		},
		finished: async () => {
			try {
				await animation.finished;
			} finally {
				animation.commitStyles();
			}
		},
	} as const;
};

export type PlaybackController = ReturnType<typeof createPlaybackController>;
