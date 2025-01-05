import { Link } from '@remix-run/react'
import { useTheme } from 'remix-themes'

export function Footer() {
	const [theme] = useTheme()

	return (
		<footer className='w-full py-2 border-t border-border/40 bg-background'>
			<div className='container flex items-center justify-center mx-auto px-4'>
				<Link
					to='https://bytesynergy.framer.website'
					className='flex items-center space-x-2 text-xs text-muted-foreground hover:text-foreground transition-colors'
					target='_blank'
					rel='noopener noreferrer'
				>
					<span>Built by</span>
					<img
						src={theme === 'dark' ? '/bslight.png' : '/bsdark.png'}
						alt='Byte Synergy Co.'
						className='h-8'
					/>
					<span>Byte Synergy Co.</span>
				</Link>
			</div>
		</footer>
	)
}
