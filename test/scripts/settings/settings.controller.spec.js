describe("Settings", function () {

    beforeEach(module('openTrapp.settings'));

    var $controller, $rootScope, cookies;

    beforeEach(inject(function (_$controller_, _$rootScope_, $cookies) {
        $controller = _$controller_;
        $rootScope = _$rootScope_;
        cookies = $cookies;
        cookies.remove('apiServerUrl');
    }));

    it('loads serverUrl from cookies', function () {

        cookies.put('apiServerUrl', 'http://api.open-trapp.com');

        var settings = newSettingsController();

        expect(settings.apiServerUrl).toEqual('http://api.open-trapp.com');

    });

    it('loads default serverUrl', function () {

        var settings = newSettingsController();

        expect(settings.apiServerUrl).toEqual('https://open-trapp.herokuapp.com');
    });

    it('stores serverUrl to cookies on save', function () {

        var settings = newSettingsController();
        settings.apiServerUrl = 'http://test-api.open-trapp.com';

        settings.save();

        expect(cookies.get('apiServerUrl')).toEqual('http://test-api.open-trapp.com');
    });

    it('restores last serverUrl on cancel', function () {

        cookies.put('apiServerUrl', 'http://api.open-trapp.com');
        var settings = newSettingsController();

        settings.apiServerUrl = 'http://test-api.open-trapp.com';
        settings.cancel();

        expect(settings.apiServerUrl).toEqual('http://api.open-trapp.com');
    });

    function newSettingsController() {
        return $controller('SettingsController', {
            $scope: $rootScope.$new()
        });
    }

});
