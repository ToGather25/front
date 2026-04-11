export default function SectionTitle({ children, className = "" }) {
  return (
    <h2 className={`text-sub-tit-1 font-bold text-grey-12 leading-tight ${className}`}>
      {children}
    </h2>
  );
}
