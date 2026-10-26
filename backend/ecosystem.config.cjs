module.exports = {
  apps: [
    {
      name: 'rohan-backend',
      script: 'src/server.js',
      cwd: __dirname,
      instances: 'max', // or 1 for single core instances (t2.micro/t3.micro)
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '800M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: './logs/pm2-err.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      kill_timeout: 5000,
      listen_timeout: 8000,
    },
  ],
}
