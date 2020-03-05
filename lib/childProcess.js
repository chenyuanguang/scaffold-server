const spinner = require('./spinner');

const spawn = async (cmd, options = {}) => {
    const chunks = cmd.split(' ');
    await new Promise((resolve, reject) => {
        const child = require('child_process').spawn(chunks.shift(), chunks, {
            stdio: 'inherit',
            shell: true,
            ...options
        });
        child.on('close', () => {
            resolve();
        });
        child.on('error', (...args) => {
            reject(...args);
        });
    }).catch(e => {
        spinner(cmd).fail();
        console.error(e);
    });
};
const exec = async (cmd, options = {}) => {
    try {
        const {stdout,stderr}= await require("util").promisify(require("child_process").exec)(cmd,options)
        return {data:stdout,err:stderr}
    } catch (error) {
        console.error(error)
        return {data:null}
    }
};


module.exports = {
    exec,
    spawn
};
