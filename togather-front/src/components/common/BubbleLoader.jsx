const SIZE_FONT = {
  sm: "text-[6px]",
  md: "text-[8px]",
  lg: "text-[10px]",
};

export default function BubbleLoader({ size = "md", fullScreen = false, className = "text-primary" }) {
  const loader = <div className={`bubble-spinner ${SIZE_FONT[size]} ${className}`} />;

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
        {loader}
      </div>
    );
  }

  return <div className="flex items-center justify-center">{loader}</div>;
}
