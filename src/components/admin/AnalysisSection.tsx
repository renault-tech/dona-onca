import React from 'react';

interface AnalysisSectionProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    color?: string;
}

export default function AnalysisSection({ title, description, children, color = 'brand' }: AnalysisSectionProps) {
    const colors: Record<string, string> = {
        brand: 'border-l-brand-500',
        blue: 'border-l-blue-500',
        green: 'border-l-green-500',
        orange: 'border-l-orange-500',
        purple: 'border-l-purple-500',
    };

    return (
        <div className={`card-dark p-6 border-l-4 ${colors[color] || colors.brand} h-full`}>
            <div className="mb-4">
                <h3 className="text-lg font-bold text-white">{title}</h3>
                {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
            </div>
            <div className="relative">
                {children}
            </div>
        </div>
    );
}
