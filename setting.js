// const isDev = process.env.NODE_ENV === 'development';

const setting = {
    appname: 't-pay',
    port: 3000,
    mongo : {
        host:"localhost",
        port: 27017,
        dbname: "t_pay"
    }
};

module.exports = setting;