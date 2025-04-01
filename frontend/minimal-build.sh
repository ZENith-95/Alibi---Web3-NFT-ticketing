#!/bin/bash

# Create minimal HTML file
mkdir -p build
cat > build/index.html << EOF
<!DOCTYPE html>
<html>
<head>
  <title>Alibi - Minimal Test</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <h1>Alibi - Minimal Test</h1>
  <p>This is a minimal test page for the Alibi application.</p>
  <p>If you can see this, the frontend canister is working!</p>
  <div>
    <h2>Canister IDs:</h2>
    <p>Events Canister: ${CANISTER_ID_EVENTS}</p>
    <p>Profile Canister: ${CANISTER_ID_PROFILE}</p>
  </div>
  <script>
    // Simple check to see if we can access the IC
    window.addEventListener('load', () => {
      document.body.innerHTML += '<p>Page loaded successfully!</p>';
    });
  </script>
</body>
</html>
EOF

echo "Minimal build created!" 