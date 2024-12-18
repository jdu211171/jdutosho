import { Moon, Sun } from 'lucide-react'
import { Theme, useTheme } from 'remix-themes'
import { Button } from './ui/button'
import { useFetcher } from '@remix-run/react'

export function ThemeToggle() {
	const fetcher = useFetcher()
	const [theme, setTheme] = useTheme()

	const toggleTheme = () => {
		const newTheme = theme === 'light' ? 'dark' : 'light'
		setTheme(newTheme)

		const formData = new FormData()
		formData.append('theme', newTheme)

		fetcher.submit(formData, {
			method: 'post',
			action: '/action/set-theme',
		})
	}

	return (
		<Button
			variant='ghost'
			size='icon'
			onClick={toggleTheme}
			className='relative'
			type='button'
		>
			<Sun className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
			<Moon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
			<span className='sr-only'>Toggle theme</span>
		</Button>
	)
}
