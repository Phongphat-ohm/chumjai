module.exports = {
  apps: [
    {
      name: "chumjai-clinic",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      instances: 1, // หรือใส่ "max" เพื่อเปิดแบบ Cluster Mode ตามจำนวน CPU Core
      exec_mode: "fork", // หรือ "cluster"
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "logs/err.log",
      out_file: "logs/out.log",
      log_file: "logs/combined.log",
      time: true,
    },
  ],
};
