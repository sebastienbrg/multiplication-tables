import { User } from "../appState";
import { Stat } from "../components/StatsData";

// Helper to compute error rate and color
export function getCellColorErrorRate(stat?: Stat) {
    if (!stat || stat.correct + stat.incorrect === 0) {
        return "#e2dede"; // grey
    }
    const total = stat.correct + stat.incorrect;
    const errorRate = stat.incorrect / total;
    // Interpolate from green (#4caf50) to red (#f44336)
    // errorRate 0 => green, 1 => red
    const r = Math.round(76 + (244 - 76) * errorRate);
    const g = Math.round(175 + (67 - 175) * errorRate);
    const b = Math.round(80 + (54 - 80) * errorRate);
    return `rgb(${r},${g},${b})`;
}

export function getMarginDisplay(responseTime: number, maxResponseTime: number) {
    if (responseTime < 3) {
        return <span role="img" aria-label="heart">❤️</span>;
    }
    const margin = maxResponseTime - responseTime;
    if (margin > 2) {
        /* smiley */
        return <span role="img" aria-label="smiley">😊</span>;
    }
    if (margin > 0) {
        return <span role="img" aria-label="sweat">😅</span>
    } else {
        /* sad */
        return <span role="img" aria-label="sad">😢</span>;
    }
}


export const getDisplayTextResponseTime = (stat: Stat, user: User) => {
    if (stat === undefined) {
        return "-";
    }
    return getMarginDisplay(stat.responseTime, user.maxResponseTime)

}