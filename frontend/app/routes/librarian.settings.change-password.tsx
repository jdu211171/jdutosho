import { ChangePasswordForm } from "~/components/account/change-password-form"
import { Separator } from "~/components/ui/separator"

export default function SettingsChangePasswordPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Change Password</h3>
        <p className="text-sm text-muted-foreground">
          Change your password to keep your account secure.
          Make sure to use a strong password that you don't use elsewhere.
        </p>
      </div>
      <Separator />
      <ChangePasswordForm />
    </div>
  )
}
