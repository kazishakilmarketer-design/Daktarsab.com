import React from 'react';

interface LogoProps {
    className?: string;
    /** Use 'auto' for natural size, or pass a height class like 'h-10' */
    style?: React.CSSProperties;
}

export default function Logo({ className = "h-[38px] md:h-[42px]", style }: LogoProps) {
    return (
        <div className="flex items-center">
            <img
                src="/daktarsab-logo-2.png"
                alt="ডাক্তার সাহেব (DaktarSab) Logo"
                className={`object-contain transition-all ${className}`}
                style={style}
            />
        </div>
    );
}
