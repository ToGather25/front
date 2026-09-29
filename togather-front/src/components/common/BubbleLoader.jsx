export default function BubbleLoader({ size = "md", fullScreen = false }) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20",
  };

  const loader = (
    <div className={`bubble ${sizeClasses[size]}`}>
      <div className="w-3 h-full" />
      <div className="w-3 h-full" />
      <div className="w-3 h-full" />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
        {loader}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      {loader}
    </div>
  );
}
