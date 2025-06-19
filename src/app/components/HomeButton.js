import Link from 'next/link';

export default function HomeButton({ variant = 'default', className = '' }) {
  const variants = {
    default: "inline-flex items-center px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors text-sm",
    simple: "text-blue-400 hover:text-blue-300 hover:underline text-sm",
    corner: "absolute top-4 right-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
  };

  const buttonClass = `${variants[variant]} ${className}`;

  if (variant === 'simple') {
    return (
      <Link href="/" className={buttonClass}>
        ← Back to Homepage
      </Link>
    );
  }

  return (
    <Link href="/" className={buttonClass}>
      <svg 
        className="w-4 h-4 mr-2" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011 1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
        />
      </svg>
      Back to Home
    </Link>
  );
}