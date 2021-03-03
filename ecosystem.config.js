module.exports = {
    apps: [
        {
            name: 'kisitlamavarmi-backend',
            exec_mode: 'cluster',
            instances: 4,
            script: '/usr/bin/npm',
            args: 'start'
        }
    ]
}