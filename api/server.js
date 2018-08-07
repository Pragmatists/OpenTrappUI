var jsonServer = require('json-server')
var moment = require('moment')
var _ = require('lodash')
var server = jsonServer.create();
var router = jsonServer.router('api/db.json');
var middlewares = jsonServer.defaults();

server.use(middlewares);

server.get('/endpoints/v1/authentication/status', function (req, res) {
    res.jsonp({
        "username": "john.doe",
        "displayName": "John Doe",
        "authenticated": true,
        "loginUrl": "http://localhost:3000/endpoints/v1/authentication/login",
        "logoutUrl": "http://localhost:3000/endpoints/v1/authentication/logout"
    })
});



server.get('/endpoints/v1/calendar/' + moment().format('YYYY') + '/' + moment().format('MM') + '/work-log/entries', function (req, res) {
    res.jsonp({
        items: [
            {
                link: "/endpoints/v1/work-log/entries/1",
                id: "1",
                workload: "1d",
                employee: "john.doe",
                day: moment().format('YYYY') + "/" + moment().format('MM') + "/" + moment().format('DD'),
                projectNames: ["vacation"]
            },
            {
                link: "/endpoints/v1/work-log/entries/3",
                id: "3",
                workload: "2h",
                employee: "john.doe",
                day: moment().format('YYYY') + "/" + moment().format('MM') + "/" + moment().format('DD'),
                projectNames: ["internal", "conference"]
            },
            {
                link: "/endpoints/v1/work-log/entries/4",
                id: "4",
                workload: "2h",
                employee: "bart.simson",
                day: moment().format('YYYY') + "/" + moment().format('MM') + "/" + moment().format('DD'),
                projectNames: ["internal", "conference"]
            },
            {
                link: "/endpoints/v1/work-log/entries/5",
                id: "5",
                workload: "4h",
                employee: "bart.simson",
                day: moment().format('YYYY') + "/" + moment().format('MM') + "/" + moment().format('DD'),
                projectNames: ["internal", "brown-bag"]
            }
        ]
    })
});

server.get('/endpoints/v1/calendar/' + moment().add(1,'month').format('YYYY') + '/' + moment().add(1,'month').format('MM') + '/work-log/entries', function (req, res) {
    res.jsonp({
        items: [
            {
                link: "/endpoints/v1/work-log/entries/1",
                id: "1",
                workload: "1d",
                employee: "john.doe",
                day: moment().add(1,'month').format('YYYY') + "/" + moment().add(1,'month').format('MM') + "/" + moment().add(1,'month').format('DD'),
                projectNames: ["vacation"]
            }
        ]
    })
});

server.get('/endpoints/v1/projects', function (req, res) {
    res.jsonp(["OpenTrapp","Other","brown-bag","coaching","coding-dojo","conference","vacation","internal"])
});

server.get('/endpoints/v1/calendar/' + moment().format('YYYY') + '/' + moment().format('MM'), function (req, res) {
    month = {
        "id": ""+moment().format('YYYY')+"/"+moment().format('MM'),
        "link": "/endpoints/v1/calendar/"+moment().format('YYYY')+"/"+moment().format('MM')+"",
        "next": {"link": "/endpoints/v1/calendar/"+moment().add(1,'month').format('YY')+"/"+moment().add(1,'month').format('MM')}, "prev": {"link": "/endpoints/v1/calendar/"+moment().subtract(1,'month').format('YY')+"/"+moment().subtract(1,'month').format('MM')},
        "days": []
    }

    var monthDate = moment().startOf('month');

    _.times(monthDate.daysInMonth('MM'), function(n) {
        month.days.push({"link": "/endpoints/v1/calendar/"+moment().format('YYYY')+"/"+moment().format('MM')+"/"+monthDate.format('DD'), "id": ""+moment().format('YYYY')+"/"+moment().format('MM')+"/"+monthDate.format('DD'), "holiday": monthDate.weekday() == 0 || monthDate.weekday() == 6})
        monthDate.add(1, 'day');
    })

    res.jsonp(month);
});

server.get('/endpoints/v1/calendar/' + moment().add(1, 'month').format('YYYY') + '/' + moment().add(1, 'month').format('MM'), function (req, res) {
    month = {
        "id": ""+moment().add(1, 'month').format('YYYY')+"/"+moment().add(1, 'month').format('MM'),
        "link": "/endpoints/v1/calendar/"+moment().add(1, 'month').format('YYYY')+"/"+moment().add(1, 'month').format('MM')+"",
        "next": {"link": "/endpoints/v1/calendar/"+moment().add(2,'month').format('YY')+"/"+moment().add(2,'month').format('MM')}, "prev": {"link": "/endpoints/v1/calendar/"+moment().format('YY')+"/"+moment().format('MM')},
        "days": []
    }

    var monthDate = moment().add(1, 'month').startOf('month');

    _.times(monthDate.daysInMonth('MM'), function(n) {
        month.days.push({"link": "/endpoints/v1/calendar/"+moment().add(1, 'month').format('YYYY')+"/"+moment().add(1, 'month').format('MM')+"/"+monthDate.format('DD'), "id": ""+moment().add(1, 'month').format('YYYY')+"/"+moment().add(1, 'month').format('MM')+"/"+monthDate.format('DD'), "holiday": monthDate.weekday() == 0 || monthDate.weekday() == 6})
        monthDate.add(1, 'day');
    })

    res.jsonp(month);
});

server.get('/endpoints/v1/calendar/' + moment().subtract(1, 'month').format('YYYY') + '/' + moment().subtract(1, 'month').format('MM'), function (req, res) {
    month = {
        "id": ""+moment().subtract(1, 'month').format('YYYY')+"/"+moment().subtract(1, 'month').format('MM'),
        "link": "/endpoints/v1/calendar/"+moment().subtract(1, 'month').format('YYYY')+"/"+moment().subtract(1, 'month').format('MM')+"",
        "next": {"link": "/endpoints/v1/calendar/"+moment().format('YY')+"/"+moment().format('MM')}, "prev": {"link": "/endpoints/v1/calendar/"+moment().subtract(2,'month').format('YY')+"/"+moment().subtract(2,'month').format('MM')},
        "days": []
    }

    var monthDate = moment().subtract(1, 'month').startOf('month');

    _.times(monthDate.daysInMonth('MM'), function(n) {
        month.days.push({"link": "/endpoints/v1/calendar/"+moment().subtract(1, 'month').format('YYYY')+"/"+moment().subtract(1, 'month').format('MM')+"/"+monthDate.format('DD'), "id": ""+moment().subtract(1, 'month').format('YYYY')+"/"+moment().subtract(1, 'month').format('MM')+"/"+monthDate.format('DD'), "holiday": monthDate.weekday() == 0 || monthDate.weekday() == 6})
        monthDate.add(1, 'day');
    })

    res.jsonp(month);
});


server.use(router);
server.listen(3000, function () {
    console.log('JSON Server is running')
});
