module.exports = {
  apps: [
    {
      name: "tag-backend",
      cwd: "./backend",
      script: "dist/src/main.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 5000
      }
    }
  ]
};
