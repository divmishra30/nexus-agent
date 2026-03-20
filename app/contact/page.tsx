export default function ContactPage() {
  return (
    <main className="flex flex-col items-center justify-center py-12 px-4 sm:px-8 bg-[var(--color-background-default)] text-[var(--color-text-default)] flex-grow">
      <h1 className="text-[var(--font-size-4xl)] font-[var(--font-weight-extrabold)] mb-4 text-center">Contact Us</h1>
      <p className="text-[var(--font-size-lg)] max-w-prose text-center leading-relaxed">
        Have questions or feedback? Feel free to reach out to us.
        This is a placeholder for our contact information.
      </p>
      <p className="text-[var(--font-size-base)] max-w-prose text-center mt-4 text-[var(--color-text-muted)]">
        You can imagine a contact form or email address here.
      </p>
    </main>
  );
}
