export default function TermsOfServicePage() {
  return (
    <main className="flex flex-col items-center justify-center py-20 px-6 sm:px-10 lg:px-12 bg-[var(--color-background-default)] text-[var(--color-text-default)] flex-grow">
      <h1 className="text-[var(--font-size-4xl)] font-[var(--font-weight-extrabold)] mb-[var(--spacing-6)] text-center">Terms of Service</h1>
      <p className="text-[var(--font-size-lg)] max-w-prose text-center leading-relaxed">
        By using the Nexus App, you agree to our terms and conditions.
        This is a placeholder for our comprehensive terms of service.
      </p>
      <p className="text-[var(--font-size-base)] max-w-prose text-center mt-[var(--spacing-6)] text-[var(--color-text-muted)]">
        Review these terms carefully before proceeding.
      </p>
    </main>
  );
}
