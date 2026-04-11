export default function LoadingState({
  text = 'جاري تحميل البيانات...',
  className = '',
}) {
  return (
    <div className={`flex items-center justify-center gap-3 py-10 text-gray-600 dark:text-gray-300 ${className}`}>
      <span className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-primary-600 animate-spin" />
      <span className="text-sm md:text-base">{text}</span>
    </div>
  );
}
