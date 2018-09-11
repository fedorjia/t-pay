// const isDev = process.env.NODE_ENV === 'development';

const setting = {
    appname: 't-pay',
    port: 3004,
    mongo : {
        host:"localhost",
        port: 27017,
        dbname: "t_pay"
    },

	notifyURL: 'https://api.housebringer.com/tpay/notify'
};

module.exports = setting;