import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const targetUrl = url.searchParams.get('url');

	if (!targetUrl) {
		return new Response('Missing URL parameter', { status: 400 });
	}

	try {
		const response = await fetch(targetUrl);
		if (!response.ok) {
			return new Response(`Failed to fetch ICS: ${response.statusText}`, {
				status: response.status
			});
		}
		const text = await response.text();
		return new Response(text, {
			headers: {
				'Content-Type': 'text/calendar; charset=utf-8'
			}
		});
	} catch (error) {
		return new Response(`Error fetching ICS: ${(error as Error).message}`, { status: 500 });
	}
};
