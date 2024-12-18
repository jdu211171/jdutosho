import { json, type ActionFunctionArgs } from '@remix-run/node'
import { isTheme } from 'remix-themes'
import { themeSessionResolver } from '~/services/theme.server'

export async function action({ request }: ActionFunctionArgs) {
	const session = await themeSessionResolver(request)
	const formData = await request.formData()
	const theme = formData.get('theme')

	if (!isTheme(theme)) {
		return json({
			success: false,
			message: 'Invalid theme',
		}, { status: 400 })
	}

	const cookie = await session.setTheme(theme)
	return json(
		{ success: true },
		{
			headers: {
				'Set-Cookie': cookie,
			},
		}
	)
}
