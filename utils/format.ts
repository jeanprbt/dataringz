// YY/MM//DD -----------------------------------------------------------------------------------------------------------
function yearMonthDayDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// FORMAT SINGLE DATE --------------------------------------------------------------------------------------------------
const formatDate = (dateString: string, format: 'short' | 'medium' | 'long' = 'medium'): string => {
    if (!dateString) return 'Date not available';

    const date = new Date(dateString);

    switch (format) {
        case 'short':
            // July 28
            return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
        case 'medium':
            // July 28, 2024
            return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        case 'long':
            // Sunday, July 28, 2024
            return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        default:
            return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
};

// FORMAT ATHLETE DATE ------------------------------------------------------------------------------------------------
const formatAthleteDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(date);
};

// DATE FORMAT RANGE ---------------------------------------------------------------------------------------------------
const formatDateRange = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 'Dates not available';

    const start = new Date(startDate);
    const end = new Date(endDate);

    // If same month, show as "July 28 - 31, 2024"
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
        return `${start.toLocaleDateString('en-US', { month: 'long' })} ${start.getDate()} - ${end.getDate()}, ${end.getFullYear()}`;
    }

    // If different months but same year, show as "July 28 - Aug 3, 2024"
    if (start.getFullYear() === end.getFullYear()) {
        return `${start.toLocaleDateString('en-US', { month: 'long' })} ${start.getDate()} - ${end.toLocaleDateString('en-US', { month: 'long' })} ${end.getDate()}, ${end.getFullYear()}`;
    }

    // Otherwise show full dates
    return `${yearMonthDayDate(startDate)} - ${yearMonthDayDate(endDate)}`;
};

// TIME ----------------------------------------------------------------------------------------------------------------
function formatTime(timeStr: string): string {
    const parts = timeStr.split(":");
    const lastPart = parts.pop()!;
    const hasDot = lastPart.includes(".");

    const [secPart, fracPart = ""] = lastPart.split(".");
    const seconds = parseInt(secPart || "0", 10);
    const hundredths = fracPart.padEnd(2, "0").slice(0, 2);

    const minutes = parts.length > 0 ? parseInt(parts.pop()!, 10) : 0;
    const hours = parts.length > 0 ? parseInt(parts.pop()!, 10) : 0;

    const result: string[] = [];
    if (hours) result.push(`${hours}h`);
    if (minutes) result.push(`${minutes}m`);

    const secondsDisplay = hasDot
        ? `${seconds}.${hundredths.replace(/0+$/, "")}s`.replace(/\.$/, "") // clean trailing dot
        : `${seconds}s`;

    result.push(secondsDisplay);

    return result.join(" ");
}

// DISTANCE ------------------------------------------------------------------------------------------------------------
function formatDistance(distanceStr: string): string {
    const parts = distanceStr.split(".");
    const cm = parseInt(parts.pop() || "0", 10);
    const m = parts.length > 0 ? parseInt(parts.pop() || "0", 10) : 0;

    const metersWithCm = `${m}.${cm.toString().padStart(2, "0")}m`;
    return metersWithCm;
}

// HEIGHT --------------------------------------------------------------------------------------------------------------
function formatHeight(height: number): string {
    if (!height && height !== 0) return '';
    const meters = Math.floor(height / 100);
    const centimeters = height % 100;
    return `${meters}.${centimeters.toString().padStart(2, '0')} m`;
}

export { formatDateRange, yearMonthDayDate, formatDate, formatTime, formatDistance, formatAthleteDate, formatHeight }