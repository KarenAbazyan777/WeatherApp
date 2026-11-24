// Formats a moment in the city's local time.
// timezoneOffset: city's shift from UTC in seconds (openweathermap `timezone`)
// unixSeconds:    the moment to show, in seconds (openweathermap `dt`), default = now
export const dateBuilder = (timezoneOffset, unixSeconds = Date.now() / 1000) => {
    // Shift the moment by the city's offset, then print it as UTC:
    // the result is the clock time people see in that city.
    const cityTime = new Date((unixSeconds + timezoneOffset) * 1000);

    return cityTime.toLocaleString('en-US', {
        timeZone: 'UTC',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
};
