import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <a 
          href="/" 
          className="flex items-center gap-2 w-fit hover:opacity-80 transition-opacity"
          data-testid="logo-home-link"
        >
          <div className="relative w-10 h-10">
            <Image
              src="/images/logo.svg"
              alt="Halal Bites ATL Logo"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 40px, 40px"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Halal Bites ATL
            </h1>
            <p className="text-sm text-gray-600">
              Discover the best halal restaurants & muslim-owned cafes in Atlanta
            </p>
          </div>
        </a>
      </div>
    </nav>
  );
} 