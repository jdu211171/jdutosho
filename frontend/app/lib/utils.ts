import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function cleanText(text: string) {
	return text
		.replace(/ÔÇÿ/g, "'")  // Replace special quote with standard quote
		.replace(/\u0027/g, "'") // Replace unicode quote with standard quote
		.normalize('NFKC')  // Normalize unicode characters
}
