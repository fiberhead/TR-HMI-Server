const rosControl = require('../roscontrol');
const {
    pubCmdVelMsg
} = require('../roscontrol/cmd_vel');

function onMapSetting(req, fn) {
    if (req && req.method) {
        if (req.method == 'set') {
            //TODO: 持久化 req.data.map
            fn({
                code: 200,
                message: 'success'
            });
        } else if (req.method == 'get') {
            fn({
                code: 200,
                message: 'success',
                data: {
                    map: '2105.yaml'
                }
            });
        } else {
            fn({
                code: 500,
                message: 'bad request method'
            });
        }
    } else {
        fn({
            code: 500,
            message: 'bad request'
        });
        console.error('/settings/map: invalid request data:', req);
    }
}

function onCmdVel(req, fn) {
    if (req.vx && req.vt) {
        pubCmdVelMsg(req.vx, req.vt);
    } else {
        console.error('/cmd_vel: invalid request data:', req);
    }
}

function onLaunchMode(req, fn) {
    if (req.mode) {
        rosControl.toggleRosLaunchMode(req.mode);
        fn({
            code: 200,
            message: 'success'
        });
    } else {
        fn({
            code: 500,
            message: 'bad request'
        });
        console.error('/launch_mode: invalid request data:', req);
    }
}

function onSpeedSetting(req, fn) {
    if (req && req.method) {
        if (req.method == 'set') {
            //TODO: 持久化 req.data.maxVx , req.data.maxVt
            fn({
                code: 200,
                message: 'success'
            });
        } else if (req.method == 'get') {
            fn({
                code: 200,
                message: 'success',
                data: {
                    maxVx: 2,
                    maxVt: 2
                }
            });
        } else {
            fn({
                code: 500,
                message: 'bad request method'
            });
        }
    } else {
        fn({
            code: 500,
            message: 'bad request'
        });
        console.error('/settings/speed: invalid request data:', req);
    }
}

module.exports.onMapSetting = onMapSetting;
module.exports.onSpeedSetting = onSpeedSetting;
module.exports.onLaunchMode = onLaunchMode;
module.exports.onCmdVel = onCmdVel;