angular
    .module('openTrapp.settings')
    .controller('SettingsController', function ($cookies) {
            var self = this;

            self.init = init;
            self.cancel = init;
            self.save = save;
            self.apiServerUrl = undefined;
        self.alerts = [];

            init();

            function init() {
                self.apiServerUrl = 'https://open-trapp.herokuapp.com';
                var savedApiServerUrl = $cookies.get('apiServerUrl');
                if (savedApiServerUrl) {
                    self.apiServerUrl = savedApiServerUrl;
                }
            }

            function save() {
                $cookies.put('apiServerUrl', self.apiServerUrl);
                self.alerts = [{
                    message: 'Settings have been saved!',
                    type: 'success'
                }];
            }

        }
    );
