export const createPlaybackController = (animation: Animation) => {
	return {
		play: () => {
			animation.play();
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
	};
};
