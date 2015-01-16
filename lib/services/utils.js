'use strict';

function dumpUser(user) {
    return {
        id: user.id,
        name: user.name
    };
}

function dumpProject(project) {
    return {
        id: project.id,
        name: project.name
    };
}

module.exports = {
    dumpUser: dumpUser,
    dumpProject: dumpProject
};