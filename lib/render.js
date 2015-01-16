"use strict";
var Exception = require('./Exception');

function renderPromise (req, res, promise) {
    return promise.then(function(data) {
        if (data && data.type == 'file') {
            var onCompleted = function(error) {
                if (error) {
                    res.send(404);
                } else if (data.callback) {
                    data.callback();
                }
            };

            if (data.fileName) {
                return res.download(data.path, data.fileName, onCompleted);
            } else {
                return res.sendfile(data.path, undefined, onCompleted);
            }
        }

        data.status = 1;

        return res.json(data);
    }).catch(function(error) {

        if (error instanceof Exception) {
            res.send({
                status: 0,
                error: error.toHash()
            });
        } else {
            console.error('REQUEST URL ',     req.url);
            console.error('REQUEST PARAMS: ', req.params);
            console.error('REQUEST BODY: ',   req.body);
            console.error('ERROR: ',          error.stack);
            console.error('-------------------');

            res.send({
                status: 0,
                error: {
                    code:    'UNKNOWN_ERROR',
                    message: 'Please, contact your system administartor!'
                }
            });
        }
    })
    .done();
}

module.exports = renderPromise;