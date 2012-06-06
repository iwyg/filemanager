$(document).ready(function () {
    var assert_resolved = function () {
        setTimeout(function () {
            ok(resolved);
            start();
        });
    }
    var assert_rejected = function () {
        setTimeout(function () {
            ok(rejected);
            ok(!resolved);
            start();
        });
    }
    var bind = function (queue) {
        return queue.then(function () {
            resolved = true;
        }, function () {
            rejected = true;
        });
    }

    var resolved, rejected;
    var queue;
    module("Basic usage", {
        setup: function () {
            resolved = false;
            rejected = false;
            queue = $.Deferred.queue();
        }
    });
    test("Queue creation", function () {
        ok(queue.push);
        ok(queue.then);
        ok(queue.done);
        ok(queue.fail);
    });
    asyncTest("Adding a deferred to the queue", 1, function () {
        var d = $.Deferred();
        bind(queue.push(d.promise()))
        d.resolve();
        assert_resolved();
    });
    asyncTest("Rejecting a deferred in the queue", 2, function () {
        var d = $.Deferred();
        bind(queue.push(d.promise()));
        d.reject();
        assert_rejected();
    });
    asyncTest("Adding more than one deferred", 1, function () {
        var d1 = $.Deferred(),
            d2 = $.Deferred(),
            d3 = $.Deferred();
        bind(queue.push(d1.promise())
                  .push(d2.promise())
                  .push(d3.promise()));
        d1.resolve();
        d2.resolve();
        d3.resolve();
        assert_resolved();
    });
    asyncTest("Push multiple deferreds a in a single call", 1, function () {
        var d1 = $.Deferred(),
            d2 = $.Deferred(),
            d3 = $.Deferred();
        bind(queue.push(d1.promise(),
                        d2.promise(),
                        d3.promise()));
        d1.resolve();
        d2.resolve();
        d3.resolve();
        assert_resolved();
    });
    asyncTest("Rejecting one of several deferreds", 2, function () {
        var d1 = $.Deferred(),
            d2 = $.Deferred(),
            d3 = $.Deferred();
        bind(queue.push(d1.promise())
             .push(d2.promise())
             .push(d3.promise()));
        d1.resolve();
        d2.reject();
        d3.resolve();
        assert_rejected();
    });
    asyncTest("Rejecting one of several deferreds - simult", 2, function () {
        var d1 = $.Deferred(),
            d2 = $.Deferred(),
            d3 = $.Deferred();
        bind(queue.push(d1.promise(),
                        d2.promise(),
                        d3.promise()));
        d1.resolve();
        d2.reject();
        d3.resolve();
        assert_rejected();
    });
    asyncTest("Accept non-promises as well", 1, function () {
        var d = $.Deferred(), v = 3;
        bind(queue.push(d)
             .push(3));
        d.resolve();
        assert_resolved();
    });
    asyncTest("Add stuff to the constructor itself", 1, function () {
        var d = $.Deferred(), v = 3, bob = $.Deferred();
        var queue = bind($.Deferred.queue(d, v, bob));
        d.resolve();
        bob.resolve();
        assert_resolved();
    });
    asyncTest("My constructor is full of eels", 2, function () {
        var d1 = $.Deferred(),
            d2 = $.Deferred(),
            d3 = $.Deferred();
        var queue = bind($.Deferred.queue(d1.promise(),
                                          d2.promise(),
                                          d3.promise()));
        d1.resolve();
        d2.reject();
        d3.resolve();
        assert_rejected();
    });
    asyncTest("Stack new deferred in the deferred", 1, function () {
        var d = [
            $.Deferred().then(function () { queue.push(d[1], d[2]); }),
            $.Deferred().then(function () { queue.push(d[3]); }),
            $.Deferred(),
            $.Deferred().then(function () { queue.push(d[4]); }),
            $.Deferred()
        ];
        bind(queue.push(d[0]));
        d[2].resolve();
        d[1].resolve();
        d[3].resolve();
        d[0].resolve();
        d[4].resolve();
        assert_resolved();
    });

    asyncTest("Adding objects to a resolved queue is an error", 2, function () {
        var d = $.Deferred();
        bind(queue.push(d.promise()));
        d.resolve();
        setTimeout(function () {
            ok(resolved);
            raises(function () {
                queue.push($.Deferred().promise())
            });
            start();
        });
    });
});
