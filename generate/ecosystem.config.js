module.exports = {
  apps: [
    {
      name: "transcribe",
      script: "/usr/local/bin/gunicorn",
      args: "-w 1 -b 0.0.0.0:5000 --access-logfile - --error-logfile - transcribe:app --timeout 120",
      interpreter: "none",
      log_type: "json",
      out_file: "/dev/stdout", // Log to stdout
      error_file: "/dev/stderr", // Log to stderr
      watch: false, // Disable watching for changes
    },
    {
      name: "brainrot",
      script: "./index.mjs",
      log_type: "json",
      out_file: "/dev/stdout", // Log to stdout
      error_file: "/dev/stderr", // Log to stderr
      watch: false, // Disable watching for changes
    }
  ]
};
