var jsonServer = require('json-server')
var server = jsonServer.create();
var router = jsonServer.router('api/db.json');
var middlewares = jsonServer.defaults();

server.use(middlewares);

function year() {
    return new Date().getFullYear();
}

function month() {
    return ("0" + (new Date().getMonth() + 1)).slice(-2);
}

function day() {
    return ("0" + new Date().getDate()).slice(-2);
}

server.get('/endpoints/v1/authentication/status', function (req, res) {
    res.jsonp({
        "username": "john.doe",
        "displayName": "John Doe",
        "authenticated": true,
        "loginUrl": "http://localhost:3000/endpoints/v1/authentication/login",
        "logoutUrl": "http://localhost:3000/endpoints/v1/authentication/logout"
    })
});

server.get('/endpoints/v1/calendar/' + year() + '/' + month() + '/work-log/entries', function (req, res) {
    res.jsonp({
        items: [
            {
                link: "/endpoints/v1/work-log/entries/1",
                id: "1",
                workload: "1d",
                employee: "john.doe",
                day: year() + "/" + month() + "/" + day(),
                projectNames: ["vacation"]
            },
            {
                link: "/endpoints/v1/work-log/entries/3",
                id: "3",
                workload: "2h",
                employee: "john.doe",
                day: year() + "/" + month() + "/" + day(),
                projectNames: ["internal", "conference"]
            },
            {
                link: "/endpoints/v1/work-log/entries/4",
                id: "4",
                workload: "2h",
                employee: "bart.simson",
                day: year() + "/" + month() + "/" + day(),
                projectNames: ["internal", "conference"]
            },
            {
                link: "/endpoints/v1/work-log/entries/5",
                id: "5",
                workload: "4h",
                employee: "bart.simson",
                day: year() + "/" + month() + "/" + day(),
                projectNames: ["internal", "brown-bag"]
            }
        ]
    })
});

server.get('/endpoints/v1/projects', function (req, res) {
    res.jsonp(["OpenTrapp","Other","brown-bag","coaching","coding-dojo","conference","vacation","internal"])
});

server.get('/endpoints/v1/calendar/' + year() + '/' + month(), function (req, res) {
    res.jsonp(
        {
            "id": ""+year()+"/"+month(),
            "link": "/endpoints/v1/calendar/"+year()+"/"+month()+"",
            "next": {"link": "/endpoints/v1/calendar/"+year()+"/"+month()+1}, "prev": {"link": "/endpoints/v1/calendar/"+year()+"/"+month(-1)},
            "days": [
                {"link": "/endpoints/v1/calendar/"+year()+"/"+month()+"/01", "id": ""+year()+"/"+month()+"/01", "holiday": false},
                {"link": "/endpoints/v1/calendar/"+year()+"/"+month()+"/02", "id": ""+year()+"/"+month()+"/02", "holiday": false},
                {"link": "/endpoints/v1/calendar/"+year()+"/"+month()+"/03", "id": ""+year()+"/"+month()+"/03", "holiday": false},
                {"link": "/endpoints/v1/calendar/"+year()+"/"+month()+"/04", "id": ""+year()+"/"+month()+"/04", "holiday": true},
                {"link": "/endpoints/v1/calendar/"+year()+"/"+month()+"/05", "id": ""+year()+"/"+month()+"/05", "holiday": true},
                {"link": "/endpoints/v1/calendar/"+year()+"/"+month()+"/06", "id": ""+year()+"/"+month()+"/06", "holiday": false},
                {"link": "/endpoints/v1/calendar/"+year()+"/"+month()+"/07", "id": ""+year()+"/"+month()+"/07", "holiday": false},
                {"link": "/endpoints/v1/calendar/"+year()+"/"+month()+"/08", "id": ""+year()+"/"+month()+"/08", "holiday": false},
                {"link": "/endpoints/v1/calendar/"+year()+"/"+month()+"/09", "id": ""+year()+"/"+month()+"/09", "holiday": false},
                {"link": "/endpoints/v1/calendar/"+year()+"/"+month()+"/10", "id": ""+year()+"/"+month()+"/10", "holiday": false},
                {"link": "/endpoints/v1/calendar/"+year()+"/"+month()+"/11", "id": ""+year()+"/"+month()+"/11", "holiday": true},
                {"link": "/endpoints/v1/calendar/"+year()+"/"+month()+"/12", "id": ""+year()+"/"+month()+"/12", "holiday": true},
                {"link": "/endpoints/v1/calendar/"+year()+"/"+month()+"/13", "id": ""+year()+"/"+month()+"/13", "holiday": false},
                {"link": "/endpoints/v1/calendar/"+year()+"/"+month()+"/14", "id": ""+year()+"/"+month()+"/14", "holiday": false},
                {"link": "/endpoints/v1/calendar/"+year()+"/"+month()+"/15", "id": ""+year()+"/"+month()+"/15", "holiday": false},
                {"link": "/endpoints/v1/calendar/"+year()+"/"+month()+"/16", "id": ""+year()+"/"+month()+"/16", "holiday": false},
                {"link": "/endpoints/v1/calendar/"+year()+"/"+month()+"/17", "id": ""+year()+"/"+month()+"/17", "holiday": false},
                {"link": "/endpoints/v1/calendar/"+year()+"/"+month()+"/18", "id": ""+year()+"/"+month()+"/18", "holiday": true},
                {"link": "/endpoints/v1/calendar/"+year()+"/"+month()+"/19", "id": ""+year()+"/"+month()+"/19", "holiday": true},
                {"link": "/endpoints/v1/calendar/"+year()+"/"+month()+"/20", "id": ""+year()+"/"+month()+"/20", "holiday": false},
                {"link": "/endpoints/v1/calendar/"+year()+"/"+month()+"/21", "id": ""+year()+"/"+month()+"/21", "holiday": false},
                {"link": "/endpoints/v1/calendar/"+year()+"/"+month()+"/22", "id": ""+year()+"/"+month()+"/22", "holiday": false},
                {"link": "/endpoints/v1/calendar/"+year()+"/"+month()+"/23", "id": ""+year()+"/"+month()+"/23", "holiday": false},
                {"link": "/endpoints/v1/calendar/"+year()+"/"+month()+"/24", "id": ""+year()+"/"+month()+"/24", "holiday": false},
                {"link": "/endpoints/v1/calendar/"+year()+"/"+month()+"/25", "id": ""+year()+"/"+month()+"/25", "holiday": true},
                {"link": "/endpoints/v1/calendar/"+year()+"/"+month()+"/26", "id": ""+year()+"/"+month()+"/26", "holiday": true},
                {"link": "/endpoints/v1/calendar/"+year()+"/"+month()+"/27", "id": ""+year()+"/"+month()+"/27", "holiday": false},
                {"link": "/endpoints/v1/calendar/"+year()+"/"+month()+"/28", "id": ""+year()+"/"+month()+"/28", "holiday": false},
                {"link": "/endpoints/v1/calendar/"+year()+"/"+month()+"/29", "id": ""+year()+"/"+month()+"/29", "holiday": false},
                {"link": "/endpoints/v1/calendar/"+year()+"/"+month()+"/30", "id": ""+year()+"/"+month()+"/30", "holiday": false},
                {"link": "/endpoints/v1/calendar/"+year()+"/"+month()+"/31", "id": ""+year()+"/"+month()+"/31", "holiday": false}]
        })
});


server.use(router);
server.listen(3000, function () {
    console.log('JSON Server is running')
});
