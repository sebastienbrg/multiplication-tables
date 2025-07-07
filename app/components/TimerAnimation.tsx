"use client";
import { useEffect, useRef, useState } from "react";
export interface TimerAnimationProps {
    duration: number; // in seconds    
    questionStartTime: number;
    onTrigger?: () => void;
}

const RefreshDelay = 100; // 0.1 second for smoother animation

const getColor = (percent: number) => {
    if (percent > 0.5) return "#4caf50"; // green
    if (percent > 0.2) return "#ff9800"; // orange
    return "#f44336"; // red
};

const TimerAnimation = ({ duration, questionStartTime, onTrigger }: TimerAnimationProps) => {
    const [timerValue, setTimerValue] = useState<number>(duration);
    const [running, setRunning] = useState<boolean>(true);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (intervalRef.current)
            clearInterval(intervalRef.current);
        if (!running) {
            return;
        }
        intervalRef.current = setTimeout(() => {
            const elapsedTime = (Date.now() - questionStartTime) / 1000;
            const remainingTime = Math.max(0, duration - elapsedTime);
            setTimerValue(remainingTime);

            if (remainingTime <= 0) {
                if (intervalRef.current) clearTimeout(intervalRef.current);
                setRunning(false);
                setTimerValue(0);
                onTrigger?.();
            }
        }, RefreshDelay);

        return () => {
            if (intervalRef.current) clearTimeout(intervalRef.current);
        };
    }, [duration, questionStartTime, onTrigger, timerValue, running]);

    const percent = Math.max(0, timerValue / duration);
    const radius = 50;
    const stroke = 8;
    const normalizedRadius = radius - stroke / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - percent * circumference;

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <svg height={radius * 2} width={radius * 2}>
                <circle
                    stroke="#eee"
                    fill="none"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <circle
                    stroke={getColor(percent)}
                    fill="none"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference + " " + circumference}
                    style={{ strokeDashoffset, transition: "stroke-dashoffset 0.1s linear, stroke 0.2s" }}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dy=".3em"
                    fontSize="2.5rem"
                    fontFamily="sans-serif"
                >
                    ⏰
                </text>
            </svg>
            <div style={{
                marginTop: 8,
                fontSize: "1.2rem",
                color: getColor(percent),
                fontWeight: "bold"
            }}>
                {Math.ceil(timerValue)}s
            </div>
        </div>
    );
};

export default TimerAnimation;