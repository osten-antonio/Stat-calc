export function BackgroundGraph() {
    return (
        <svg
            className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none"
            preserveAspectRatio="xMidYMid slice"
        >
            <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path
                        d="M 40 0 L 0 0 0 40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                    />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <path
                className="graph-line"
                d="M0,300 Q100,280 150,200 T250,180 T350,220 T450,100 T550,150 T650,80 T750,120 T850,60 T950,100 T1050,40 T1150,80 T1250,30 T1350,60 T1450,20 T1550,50 T1650,15 T1750,40 T1850,10 T1950,30"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            />
            <path
                className="graph-line-2"
                d="M0,350 Q80,340 120,320 T200,350 T280,300 T360,330 T440,280 T520,310 T600,250 T680,290 T760,230 T840,270 T920,200 T1000,250 T1080,180 T1160,220 T1240,160 T1320,200 T1400,140 T1480,180 T1560,120 T1640,160 T1720,100 T1800,140 T1880,80 T1960,120"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="4 4"
            />
        </svg>
    );
}
