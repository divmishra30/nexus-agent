export default function AboutPage() {
  return (
    <main className="flex flex-col items-center justify-center py-20 px-6 sm:px-10 lg:px-12 bg-[var(--color-background-default)] text-[var(--color-text-default)] flex-grow">
      <h1 className="text-[var(--font-size-4xl)] font-[var(--font-weight-extrabold)] mb-[var(--spacing-6)] text-center">About Us</h1>
      <p className="text-[var(--font-size-lg)] max-w-prose text-center leading-relaxed">
        Welcome to Nexus App, your hub for exploring various web functionalities.
        We are dedicated to providing useful tools and engaging content for our users.
      </p>
      <p className="text-[var(--font-size-base)] max-w-prose text-center mt-[var(--spacing-6)] text-[var(--color-text-muted)]">
        This page is a placeholder to demonstrate routing and layout integration.
      </p>
    </main>
  );
}
