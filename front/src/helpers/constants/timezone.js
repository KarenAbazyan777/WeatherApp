export const dateBuilder = (timezone) => {
   
    const nowInLocalTime = Date.now()  + 1000 * (timezone / 3600);
    const millitime = new Date(nowInLocalTime);

    let day = millitime.toLocaleString("en-US", {weekday: "long"});
    let month = millitime.toLocaleString("en-US", {month: "long"}); 
    let date = millitime.toLocaleString("en-US", {day: "numeric"});
    let year = millitime.toLocaleString("en-US", {year: "numeric"}); 
    let hours = millitime.toLocaleString("en-US", {hour: "numeric"}); 
    let hourss = hours.split(' ');
    let minutes = millitime.toLocaleString("en-US", {minute: "numeric"});

    return `${day} ${date} ${month} ${year} ${hourss[0]}:${minutes}`;
}