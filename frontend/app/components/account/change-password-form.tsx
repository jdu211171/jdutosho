import { useNavigation, Form as RemixForm } from '@remix-run/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '../ui/form'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useEffect, useState } from 'react'

const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, 'Current password is required'),
		newPassword: z.string().min(6, 'Password must be at least 6 characters'),
		confirmPassword: z.string().min(1, 'Please confirm your new password'),
	})
	.refine(data => data.newPassword === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	})

type ChangePasswordValues = z.infer<typeof changePasswordSchema>

interface ChangePasswordFormProps {
	actionData?: {
		success: boolean
		message: string
	} | null
}

export function ChangePasswordForm({ actionData }: ChangePasswordFormProps) {
	const navigation = useNavigation()
	const isSubmitting = navigation.state === 'submitting'
	const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
	const [feedbackVariant, setFeedbackVariant] = useState<
		'success' | 'error' | null
	>(null)

	const form = useForm<ChangePasswordValues>({
		resolver: zodResolver(changePasswordSchema),
		defaultValues: {
			currentPassword: '',
			newPassword: '',
			confirmPassword: '',
		},
	})

	useEffect(() => {
		if (actionData) {
			setFeedbackMessage(actionData.message)
			setFeedbackVariant(actionData.success ? 'success' : 'error')
			if (actionData.success) {
				form.reset()
			}
		}
	}, [actionData, form])

	return (
		<Form {...form}>
			<RemixForm method='post' className='space-y-8'>
				{feedbackMessage && (
					<div
						className={`p-4 rounded-md ${feedbackVariant === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
					>
						{feedbackMessage}
					</div>
				)}
				<FormField
					control={form.control}
					name='currentPassword'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Current Password</FormLabel>
							<FormControl>
								<Input
									type='password'
									placeholder='Enter current password'
									{...field}
									name='currentPassword'
									autoComplete='current-password'
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='newPassword'
					render={({ field }) => (
						<FormItem>
							<FormLabel>New Password</FormLabel>
							<FormControl>
								<Input
									type='password'
									placeholder='Enter new password'
									{...field}
									name='newPassword'
									autoComplete='new-password'
								/>
							</FormControl>
							<FormDescription>
								Password must be at least 6 characters long.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='confirmPassword'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Confirm New Password</FormLabel>
							<FormControl>
								<Input
									type='password'
									placeholder='Confirm new password'
									{...field}
									name='confirmPassword'
									autoComplete='new-password'
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type='submit' disabled={isSubmitting}>
					{isSubmitting ? 'Changing Password...' : 'Change Password'}
				</Button>
			</RemixForm>
		</Form>
	)
}
