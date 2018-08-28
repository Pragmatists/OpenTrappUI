describe('EditModalCtrl', function () {

    beforeEach(module('openTrapp.worklog'));

    var httpBackend, modal, $controller;

    beforeEach(inject(function ($httpBackend, _$controller_) {
        httpBackend = $httpBackend;
        modal = jasmine.createSpyObj("modal", ["close", 'dismiss']);
        $controller = _$controller_;
    }));

    it("initializes", function () {
        var item = {id: "someId"};

        var controller = $controller('EditModalCtrl', {
            $uibModalInstance: modal,
            item: item
        });

        expect(controller.item).toEqual(item);
        expect(controller.item).not.toBe(item);
    });

    it("cancels", function () {
        var controller = $controller('EditModalCtrl', {
            $uibModalInstance: modal,
            item: {}
        });

        controller.cancel();

        expect(modal.dismiss).toHaveBeenCalled();
    });

    it("posts", function () {

        var worklog = jasmine.createSpyObj("modal", ['refresh']);

        var controller = $controller('EditModalCtrl', {
            $uibModalInstance: modal,
            item: {id: "worklogId"},
            worklog: worklog
        });
        controller.item.workload = "some workload";
        controller.item.projectNames = "Project Manhattan";
        httpBackend.expectPOST("http://localhost:8080/endpoints/v1/work-log/entries/worklogId",
            {workload: "some workload", projectName: "Project Manhattan"}).respond(200);

        controller.ok();
        httpBackend.flush();

        expect(modal.close).toHaveBeenCalledWith({
            type: 'success',
            message: 'Worklog updated'
        });
        expect(worklog.refresh).toHaveBeenCalled();
    });

});
