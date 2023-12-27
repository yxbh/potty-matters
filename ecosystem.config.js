// This is needed for Azure Web App Service to run Next.js

module.exports = {
  apps: [
    {
      name: "potty-matters",
      script: "./node_modules/next/dist/bin/next",
      args: "start -p " + (process.env.PORT || 3000),
      watch: false,
      autorestart: true,
    },
  ],
};
