import { ImgHTMLAttributes } from 'react';
import Image from 'next/image';

interface ECRLogoProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'width' | 'height'> {
    className?: string;
    noBackground?: boolean;
}

export default function ECRLogo({ className = "w-8 h-8", noBackground = false, ...props }: ECRLogoProps) {
    return (
        <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
            <Image
                src="/logo.png"
                alt="ECR Portal Logo"
                fill
                style={{ objectFit: 'contain' }}
                sizes="(max-width: 768px) 100vw, 33vw"
            />
        </div>
    );
}
