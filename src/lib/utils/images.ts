/**
 * Utility functions for image handling with Vite's built-in image optimization
 */

/**
 * Helper function to get the URL from imported images
 * This handles different possible image import formats that Vite might provide
 */
export function getImageUrl(imageImport: any): string {
	// Handle different possible image import formats
	if (typeof imageImport === 'string') return imageImport;
	if (imageImport?.src) return imageImport.src;
	if (imageImport?.default) return imageImport.default;
	return imageImport; // Fallback
}

/**
 * Preloads images to ensure they're cached
 * @param images Array of image URLs to preload
 */
export function preloadImages(images: string[]): void {
	images.forEach((url) => {
		const link = document.createElement('link');
		link.rel = 'preload';
		link.as = 'image';
		link.href = url;
		document.head.appendChild(link);
	});
}

/**
 * Checks if an image is loaded successfully
 * @param src Image source URL
 * @returns Promise that resolves when the image is loaded or rejects on error
 */
export function checkImageLoaded(src: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve();
		img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
		img.src = src;
	});
}
