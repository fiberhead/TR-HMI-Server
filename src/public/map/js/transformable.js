/**
 * easeljs helper function for multitouch pitch and scale.
 * 基于 Easeljs 的画布变换帮助类.
 * 
 * @author Dominic
 */
var Transformable = (function () {

    var Transformable = function (stage) {
        var TOUCHSLOP = 1;
        var lastPressUpTime = 0;
        var MULTITOUCH_UP_DELAY = 1000;

        // reference to instance
        var self = this;

        self._activeFingers = 0;
        self._fingers = [];

        var _changed = false;

        var _didTransformed = false;

        var Init = function () {
            self._initialized = true;

            stage.addEventListener('stagemousedown', _mousedown);
            stage.addEventListener('stagemousemove', _pressmove);
            stage.addEventListener('stagemouseup', _pressup);
            stage.addEventListener('tick', _enterFrame);
        };

        // store initial touchpoint-position
        var _mousedown = function (event) {
            if (!event.pointerID) event.pointerID = -1;

            self._fingers[event.pointerID] = {
                start: {
                    x: event.stageX,
                    y: event.stageY
                },
                current: {
                    x: event.stageX,
                    y: event.stageY
                },
                old: {
                    x: event.stageX,
                    y: event.stageY
                }
            };

            _calculateActiveFingers();

            self.dispatchEvent('start', {
                active: self._activeFingers
            });

            _didTransformed = false;
        };

        // update touchpoint-positions
        var _pressmove = function (event) {

            if (!event.pointerID) event.pointerID = -1;

            if (self._fingers[event.pointerID]) {
                self._fingers[event.pointerID].current.x = event.stageX;
                self._fingers[event.pointerID].current.y = event.stageY;
            }

            _calculateActiveFingers();

            _changed = true;
        };

        // if positions changed (through pressmove): dispatch update-event for later usage and keep track of old point-position
        // dispatch updates only on tick to save some performance
        var _enterFrame = function () {
            if (_changed) {
                _changed = false;
                self.dispatchEvent('update', {
                    active: self._activeFingers
                });

                _handleMove();
                _handleScale();

                for (var pointerID in self._fingers) {
                    if (self._fingers[pointerID].start) {
                        self._fingers[pointerID].old.x = self._fingers[pointerID].current.x;
                        self._fingers[pointerID].old.y = self._fingers[pointerID].current.y;
                    }
                }
            }
        };

        // delete old and unused finger-positions
        var _pressup = function (event) {
            if (!event.pointerID) event.pointerID = -1;

            if (self._fingers[event.pointerID]) {
                delete(self._fingers[event.pointerID]);
            }

            _calculateActiveFingers();

            event.active = self._activeFingers;

            var now = new Date().getTime();

            if (self._activeFingers == 0 && !_didTransformed && now - lastPressUpTime > MULTITOUCH_UP_DELAY) {
                self.dispatchEvent('click', event);
            }
            _didTransformed = false;
            lastPressUpTime = new Date().getTime();

            self.dispatchEvent('complete', event);
        };

        // calculates currently active fingers, can be used later in subclasses
        var _calculateActiveFingers = function () {
            self._activeFingers = 0;

            for (var pointerID in self._fingers) {
                if (self._fingers[pointerID].start) {
                    self._activeFingers++;
                }
            }
        };

        var _handleScale = function () {
            if (self._activeFingers > 1) {

                var points = [];

                for (var k in self._fingers) {
                    if (self._fingers[k].current) {
                        points.push(self._fingers[k]);
                        if (points.length >= 2) break;
                    }
                }

                var scale = _getDistance(points[0].current, points[1].current) / _getDistance(points[0].old, points[1].old);

                self.dispatchEvent('scale', {
                    start: points[0].current,
                    scale: scale
                });

                _didTransformed = true;
            }
        }

        var _getDistance = function (p1, p2) {
            var x = p2.x - p1.x;
            var y = p2.y - p1.y;

            return Math.sqrt(x * x + y * y);
        };

        var _handleMove = function () {
            if (self._activeFingers == 1) {

                var point;

                for (var k in self._fingers) {
                    if (self._fingers[k].current) {
                        point = self._fingers[k];
                        break;
                    }
                }

                self.dispatchEvent('move', {
                    x: point.current.x - point.old.x,
                    y: point.current.y - point.old.y
                });

                if (Math.abs(point.current.x - point.old.x) > TOUCHSLOP &&
                    Math.abs(point.current.y - point.old.y) > TOUCHSLOP) {
                    _didTransformed = true;
                    console.log('slop!!')
                }
            }
        }

        Init();
    };

    Transformable.prototype.dispatchEvent = function (eventType, data) {
        if (this.handlers && this.handlers[eventType]) {
            this.handlers[eventType](data);
        }
    }

    Transformable.prototype.on = function (eventType, handler) {
        if (!this.handlers) {
            this.handlers = [];
        }
        this.handlers[eventType] = handler;
    }

    return Transformable;
})();