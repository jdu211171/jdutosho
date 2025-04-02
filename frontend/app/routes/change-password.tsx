import { Button } from '~/components/ui/button'
          import {
            Card,
            CardContent,
            CardDescription,
            CardHeader,
            CardTitle,
          } from '~/components/ui/card'
          import { Input } from '~/components/ui/input'
          import { Label } from '~/components/ui/label'
          import { Form, useNavigation } from '@remix-run/react'
          import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
          import { json, redirect } from '@remix-run/node'
          import { isAxiosError } from 'axios'
          import { useActionData, useLoaderData, useNavigate } from 'react-router'
          import { useForm } from 'react-hook-form'
          import { z } from 'zod'
          import { zodResolver } from '@hookform/resolvers/zod'
          import { api } from '~/lib/api'
          import { ArrowLeft } from 'lucide-react'
          import { requireUserSession } from '~/services/auth.server'

          export function meta() {
            return [{ title: 'Change Password' }, { description: 'Change your account password' }]
          }

          const changePasswordSchema = z.object({
            currentPassword: z.string().optional(),
            newPassword: z.string().min(8, 'Password must be at least 8 characters'),
            newPasswordConfirmation: z.string().min(8),
          }).refine(data => data.newPassword === data.newPasswordConfirmation, {
            message: "Passwords don't match",
            path: ['newPasswordConfirmation'],
          });

          type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

          export async function loader({ request }: LoaderFunctionArgs) {
            const { user } = await requireUserSession(request);

            // Check if user is a first-time Google user
            const isFirstTimeGoogleUser = user?.username?.startsWith('google_');

            return json({ isFirstTimeGoogleUser });
          }

          export async function action({ request }: ActionFunctionArgs) {
            const { token } = await requireUserSession(request);
            const formData = await request.formData();

            const currentPassword = formData.get('currentPassword') as string;
            const newPassword = formData.get('newPassword') as string;
            const newPasswordConfirmation = formData.get('newPasswordConfirmation') as string;

            try {
              await api.post('/auth/change-password', {
                current_password: currentPassword || undefined,
                new_password: newPassword,
                new_password_confirmation: newPasswordConfirmation,
              }, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              return redirect('/profile?message=Password changed successfully');
            } catch (error) {
              if (isAxiosError(error)) {
                const messages: Record<string, string[]> = error.response?.data?.errors;
                if (messages) {
                  const formattedErrors = Object.entries(messages).map(
                    ([field, messages]) => `${field}: ${messages.join(', ')}`
                  );
                  return json(
                    { error: formattedErrors.join('; ') },
                    { status: 400 }
                  );
                }
                return json(
                  { error: error.response?.data?.message || 'Failed to change password' },
                  { status: 400 }
                );
              }
              return json({ error: 'Failed to change password' }, { status: 500 });
            }
          }

          type LoaderData = { isFirstTimeGoogleUser: boolean };

          export default function ChangePasswordPage() {
            const { isFirstTimeGoogleUser } = useLoaderData() as LoaderData;
            const actionData = useActionData() as { error?: string };
            const navigation = useNavigation();
            const navigate = useNavigate();
            const isSubmitting = navigation.state === 'submitting';

            const {
              register,
              formState: { errors },
            } = useForm<ChangePasswordFormData>({
              resolver: zodResolver(changePasswordSchema),
              defaultValues: {
                currentPassword: '',
                newPassword: '',
                newPasswordConfirmation: '',
              },
            });

            return (
              <div className='relative flex h-screen w-full items-center justify-center px-4'>
                <Button
                  variant='ghost'
                  onClick={() => navigate('/profile')}
                  className='absolute left-4 top-4'
                >
                  <ArrowLeft className='mr-2 h-4 w-4' />
                  Back to Profile
                </Button>
                <Card className='mx-auto w-full max-w-md'>
                  <CardHeader>
                    <CardTitle className='text-2xl'>Change Password</CardTitle>
                    <CardDescription>
                      {isFirstTimeGoogleUser
                        ? 'Set a new password for your Google-linked account'
                        : 'Enter your current password and choose a new one'}
                    </CardDescription>
                    {actionData?.error && (
                      <p className='text-sm font-medium text-red-500 dark:text-red-400'>
                        {actionData.error}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <Form method='post' className='grid gap-4'>
                      {!isFirstTimeGoogleUser && (
                        <div className='grid gap-2'>
                          <Label htmlFor='currentPassword'>Current Password</Label>
                          <Input
                            {...register('currentPassword')}
                            required
                            id='currentPassword'
                            type='password'
                            placeholder='Enter your current password'
                          />
                          {errors.currentPassword && (
                            <p className='text-sm text-red-500'>{errors.currentPassword.message}</p>
                          )}
                        </div>
                      )}
                      <div className='grid gap-2'>
                        <Label htmlFor='newPassword'>New Password</Label>
                        <Input
                          {...register('newPassword')}
                          required
                          id='newPassword'
                          type='password'
                          placeholder='Enter new password'
                        />
                        {errors.newPassword && (
                          <p className='text-sm text-red-500'>
                            {errors.newPassword.message}
                          </p>
                        )}
                      </div>
                      <div className='grid gap-2'>
                        <Label htmlFor='newPasswordConfirmation'>Confirm New Password</Label>
                        <Input
                          {...register('newPasswordConfirmation')}
                          required
                          id='newPasswordConfirmation'
                          type='password'
                          placeholder='Confirm your new password'
                        />
                        {errors.newPasswordConfirmation && (
                          <p className='text-sm text-red-500'>
                            {errors.newPasswordConfirmation.message}
                          </p>
                        )}
                      </div>
                      <Button
                        type='submit'
                        className='w-full'
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Updating password...' : 'Update Password'}
                      </Button>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            )
          }
