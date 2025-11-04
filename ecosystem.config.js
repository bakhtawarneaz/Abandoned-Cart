module.exports = {
  apps: [
    {
      name: "abandoned-cart",
      script: "src/server.js",  // or app.js if that’s your main file
      watch: false,
      env: {
        NODE_ENV: "development",
        PORT: 5000
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 5000
      }
    }
  ]
};
