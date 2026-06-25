// PM2 Ecosystem Config
// Gunakan dengan: pm2 start ecosystem.config.js
// Install PM2: npm install -g pm2

module.exports = {
  apps: [
    {
      name: 'pcnu-forms',
      script: './backend/dist/index.js',
      cwd: '/var/www/pcnu-forms',   // Ganti dengan path deployment Anda
      instances: 1,                  // Bisa diset ke 'max' untuk cluster mode
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // Auto restart jika crash
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      // Log files
      out_file: './logs/pm2-out.log',
      error_file: './logs/pm2-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 3000,
    },
  ],
};
