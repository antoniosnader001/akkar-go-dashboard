import { useState } from 'react'
import { ShieldCheck, Database, Building2 } from 'lucide-react'
import { Button } from '../components/ui/Button'

export default function SettingsPage() {
  const [apiBaseUrl, setApiBaseUrl] = useState<string>('')

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forest">Settings</h1>
          <p className="mt-1 text-sm text-muted">
            Configure the admin panel environment and identity mapping rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => {}}>
            <ShieldCheck className="h-4 w-4" />
            Save (mock)
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="rounded-2xl border border-border bg-background p-5 lg:col-span-6 space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-forest" />
            <div className="text-sm font-semibold text-forest">App</div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-xs font-semibold text-muted">App name</div>
              <div className="mt-1 rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold text-forest">
                Akkar Go Admin
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-muted">Environment</div>
              <div className="mt-1 rounded-xl border border-border bg-background px-3 py-2 text-sm text-forest">
                Development
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-muted">API Base URL</div>
              <input
                value={apiBaseUrl}
                onChange={(e) => setApiBaseUrl(e.target.value)}
                placeholder="https://your-domain.com (production backend)"
                className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-leaf/20"
              />
            </div>

            <div>
              <div className="text-xs font-semibold text-muted">Admin email</div>
              <input
                value={'admin@example.com'}
                readOnly
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-muted"
              />
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-background p-4">
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-leaf" />
              <div>
                <div className="text-sm font-semibold text-forest">Security notes</div>
                <ul className="mt-2 list-disc pl-5 text-sm text-muted space-y-1">
                  <li>Do not expose database secrets in the browser.</li>
                  <li>Use secure server APIs for production.</li>
                  <li>Admin auth will be added before going live.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background p-5 lg:col-span-6 space-y-4">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-forest" />
            <div className="text-sm font-semibold text-forest">Database Identity Rules</div>
          </div>

          <div className="rounded-xl border border-border/70 bg-background p-4">
            <div className="text-sm text-muted mb-3">
              Helps prevent confusion between Clerk, users, drivers, and rides.
            </div>

            <div className="space-y-2 text-sm">
              <IdentityRule left="Clerk user.id" right="→ users.clerk_id" />
              <IdentityRule left="users.id" right="→ drivers.user_id" />
              <IdentityRule left="drivers.id" right="→ rides.driver_id" />
              <IdentityRule left="users.id" right="→ rides.user_id" />
            </div>

            <div className="mt-4 text-xs text-muted">
              This is informational for debugging; production should rely on validated backend joins.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function IdentityRule({ left, right }: { left: string; right: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2">
      <div className="font-semibold text-forest">{left}</div>
      <div className="text-muted">{right}</div>
    </div>
  )
}
