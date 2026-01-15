'use client';

import React from 'react';
import {
	WrenchScrewdriverIcon,
	PaintBrushIcon,
	HomeIcon,
	SparklesIcon,
} from '@heroicons/react/24/outline';

export function OnboardingWelcomeIllustration({
	className = 'w-72 h-72',
}: { className?: string }) {
	return (
		<div className={`relative ${className} flex items-center justify-center`}>
			{/* Background circles */}
			<div className="absolute inset-0 flex items-center justify-center">
				<div className="w-64 h-64 rounded-full bg-violet-100 opacity-40" />
			</div>
			<div className="absolute inset-0 flex items-center justify-center">
				<div className="w-48 h-48 rounded-full bg-violet-200 opacity-30" />
			</div>
			
			{/* Center large tool icon */}
			<div className="relative z-10">
				<WrenchScrewdriverIcon className="w-32 h-32 text-violet-600" strokeWidth={1.5} />
			</div>
			
			{/* Floating corner icons */}
			<div className="absolute top-8 left-8 opacity-70">
				<HomeIcon className="w-12 h-12 text-violet-500" strokeWidth={2} />
			</div>
			<div className="absolute top-8 right-8 opacity-70">
				<PaintBrushIcon className="w-12 h-12 text-violet-500" strokeWidth={2} />
			</div>
			<div className="absolute bottom-8 left-12 opacity-60">
				<SparklesIcon className="w-10 h-10 text-violet-400" strokeWidth={2} />
			</div>
			<div className="absolute bottom-8 right-12 opacity-60">
				<SparklesIcon className="w-10 h-10 text-violet-400" strokeWidth={2} />
			</div>
		</div>
	);
}


