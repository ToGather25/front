export default function Section({ className = "", children }) {
  return (
    <section className={`w-full ${className}`}>
      <div className="max-w-[1576px] mx-auto px-4">{children}</div>
    </section>
  );
}
