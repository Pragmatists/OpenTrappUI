var Workload = function (workload) {

    var workloadAsMinutes = 0;

    if (!workload) {
        workloadAsMinutes = 0;
    } else if (isNaN(workload)) {
        var expression = workload
            .replace("m", "")
            .replace("h", "*60")
            .replace("d", "*8*60")
            .split(" ")
            .join("+");
        workloadAsMinutes = eval(expression);
    } else {
        workloadAsMinutes = workload;
    }

    return {
        minutes: workloadAsMinutes,
        print: function () {
            return _([printDays(), printHours(), printMinutes()]).without("").join(" ");
        },
        add: function (workloadToAdd) {
            return new Workload(workloadAsMinutes + workloadToAdd.minutes);
        }
    };

    function printMinutes() {
        var minutes = workloadAsMinutes % 60;
        return minutes === 0 ? "" : minutes + "m";
    }

    function printHours() {
        if (workloadAsMinutes === 0) {
            return "0h";
        }
        var hours = hoursInMinutes(workloadAsMinutes) % 8;
        return hours === 0 ? "" : hours + "h";
    }

    function printDays() {
        var days = daysInHours(hoursInMinutes(workloadAsMinutes));
        return days === 0 ? "" : days + "d";
    }

    function hoursInMinutes(minutes) {
        return (minutes - minutes % 60) / 60;
    }

    function daysInHours(hours) {
        return (hours - hours % 8) / 8;
    }

};

Workload.isValid = function (workload) {
    if (workload.trim() === "") {
        return false;
    }
    return /^(\d+d)?\s*(\d+h)?\s*(\d+m)?$/.test(workload.trim());
};
