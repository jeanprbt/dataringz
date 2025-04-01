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
        return `${start.toLocaleDateString('en-US', { month: 'short' })} ${start.getDate()} - ${end.toLocaleDateString('en-US', { month: 'short' })} ${end.getDate()}, ${end.getFullYear()}`;
    }
    
    // Otherwise show full dates
    return `${yearMonthDayDate(startDate)} - ${yearMonthDayDate(endDate)}`;
};

export { formatDateRange, yearMonthDayDate }