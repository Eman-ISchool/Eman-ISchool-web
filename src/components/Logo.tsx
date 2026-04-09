import Image from 'next/image';

export function Logo({ className = '' }: { className?: string }) {
    return (
        <div className={`relative h-12 w-32 md:h-14 md:w-40 ${className}`}>
            <Image
                src="/logo-full.jpg"
                alt="Eman ISchool"
                fill
                sizes="(min-width: 768px) 160px, 128px"
                className="object-contain"
                priority
            />
        </div>
    );
}
