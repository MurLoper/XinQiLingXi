module.exports = {
  apps: [
    {
      name: "xinqilingxi-mock-server",
      script: "npx",
      // --host 0.0.0.0 允许局域网或Nginx反向代理访问
      args: "json-server --watch db.json --port 3001 --host 0.0.0.0",
      env: {
        NODE_ENV: "production",
      },
      // 错误重启策略
      exp_backoff_restart_delay: 100,
      max_memory_restart: '200M'
    },
  ],
};