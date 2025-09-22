#!/bin/sh
set -e

# Replace environment variables in built files
if [ -f /usr/share/nginx/html/static/js/*.js ]; then
    # Replace API URL placeholder with actual environment variable
    find /usr/share/nginx/html/static/js -name "*.js" -exec sed -i "s|REACT_APP_API_URL_PLACEHOLDER|${REACT_APP_API_URL:-http://localhost:8000}|g" {} \;
fi

# Execute the main command
exec "$@"