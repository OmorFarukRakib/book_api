module.exports = {
  apps: [
    {
      name: "book-api",
      script: "./app.js",
      exec_mode: "cluster",
      instances: "max",
      watch: true,
    },
  ],
};
