module.exports = datetimeFormatter = function (timestamp) {
    var datetime = new Date(timestamp);
    var years = datetime.getFullYear();
    var months = datetime.getMonth(); // MM = 0-11
    months++; // human readable
    var days = datetime.getDate();
    var hours = datetime.getHours();
    var minutes = datetime.getMinutes();
    minutes = minutes.toString().length == 1 ? "0".concat(minutes) : "".concat(minutes);
    return { years: years, months: months, days: days, hours: hours, minutes: minutes };
};
module.exports = datetimeRelative = function (timeStamp) {
    var now = new Date();
    var secondsPast = (now.getTime() - timeStamp) / 1000;
    if (secondsPast < 60) {
        return "".concat(parseInt(secondsPast), "s ago");
    }
    if (secondsPast < 3600) {
        return "".concat(parseInt(secondsPast / 60), "m ago");
    }
    if (secondsPast <= 86400) {
        return "".concat(parseInt(secondsPast / 3600), "h ago");
    }
    if (secondsPast > 86400) {
        mydate = new Date(timeStamp);
        day = mydate.getDate();
        month = mydate.toDateString().match(/ [a-zA-Z]*/)[0].replace(" ", "");
        year = mydate.getFullYear() == now.getFullYear() ? "" : " " + mydate.getFullYear();
        return day + " " + month + year;
    }
};
//# sourceMappingURL=datetime_formatter.js.map