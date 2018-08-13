angular
    .module('openTrapp.settings')
    .controller('SettingsController', function ($cookies) {
            var self = this;

            self.init = init;
            self.cancel = init;
            self.save = save;
            self.apiServerUrl = undefined;
            self.useLastExpression = undefined;
            self.alerts = [];

            init();

            function init() {
                self.apiServerUrl = 'https://open-trapp.herokuapp.com';
                var savedApiServerUrl = $cookies.get('apiServerUrl');
                if (savedApiServerUrl) {
                    self.apiServerUrl = savedApiServerUrl;
                }
                var useLastExpression = $cookies.get('useLastExpression');
                if (useLastExpression) {
                    self.useLastExpression = useLastExpression;
                }
            }

            function save() {
                $cookies.put('apiServerUrl', self.apiServerUrl);
                $cookies.put('useLastExpression', self.useLastExpression);

                self.alerts = [{
                    message: 'Settings have been saved!',
                    type: 'success'
                }];
            }

        }
    );
