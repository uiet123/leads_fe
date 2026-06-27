export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences.
        </p>
      </div>
      <div className="rounded-xl border bg-card text-card-foreground shadow p-6 h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground">Settings Form Placeholder</p>
      </div>
    </div>
  );
}
