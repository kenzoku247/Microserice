const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
    app.use(
      "/api_user",
      createProxyMiddleware({
        target: `http://${process.env.REACT_APP_USER_HOST}:${process.env.REACT_APP_USER_PORT}`,
        changeOrigin: true,
      })
    );
    app.use(
      "/api_order",
      createProxyMiddleware({
        target: `http://${process.env.REACT_APP_ORDER_HOST}:${process.env.REACT_APP_ORDER_PORT}`,
        changeOrigin: true,
      })
    );
};
