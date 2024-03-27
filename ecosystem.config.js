// ecosystem.config.js
module.exports = {
    apps : [{
      name: "next-app",
      script: "npm",
      args: "start",
      cwd: "/var/www/admin_kaltengventura",
      watch: true,
      env: {
        NODE_ENV: "production",
      }
    }]
  };