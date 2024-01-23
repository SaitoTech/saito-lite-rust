export default async () => {
	if (typeof window === 'undefined') {
		let configs = {};
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		let saito = await import('saito-js/server');
		console.log('server : ', saito);
		let result = await saito.initialize();
	} else {
		let configs = {};
		let saito = await import('saito-js/browser');
		console.log('browser : ', saito);
		let result = await saito.initialize();
	}
};
