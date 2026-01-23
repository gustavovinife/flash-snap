#!/bin/bash

# Flash Snap - Manual Sign and Notarize Script
# Usage: ./sign-and-notarize.sh [x64|arm64]

set -e

ARCH=${1:-arm64}
IDENTITY="Developer ID Application: Lucas Castelani (7F7UX5FJX2)"
ENTITLEMENTS="build/entitlements.mac.plist"

# Apple API Key credentials
API_KEY_ID="GXZMAMSKR4"
API_ISSUER="0e7f24ca-5a5b-4653-b1bd-d7374cebf80b"
API_KEY_PATH="./AuthKey.p8"

if [ "$ARCH" = "arm64" ]; then
    APP_PATH="dist/mac-arm64/flash-snap.app"
else
    APP_PATH="dist/mac/flash-snap.app"
fi

ZIP_PATH="dist/flash-snap-notarize.zip"

echo "=========================================="
echo "Flash Snap - Sign & Notarize"
echo "=========================================="
echo "Architecture: $ARCH"
echo "App Path: $APP_PATH"
echo ""

# Check if app exists
if [ ! -d "$APP_PATH" ]; then
    echo "❌ Error: $APP_PATH not found"
    echo "Run 'yarn electron-builder --mac --$ARCH --publish never' first"
    exit 1
fi

# Step 1: Sign all nested components first (inside-out)
echo "🔐 Step 1: Signing all components..."

# Sign all dylibs and frameworks
find "$APP_PATH/Contents/Frameworks" -type f \( -name "*.dylib" -o -perm +111 \) | while read -r file; do
    echo "   Signing: $file"
    codesign --force --sign "$IDENTITY" --timestamp --options runtime "$file" 2>/dev/null || true
done

# Sign all .app bundles inside Frameworks
find "$APP_PATH/Contents/Frameworks" -name "*.app" -type d | while read -r app; do
    echo "   Signing app: $app"
    codesign --force --sign "$IDENTITY" --timestamp --options runtime --entitlements "$ENTITLEMENTS" "$app"
done

# Sign all frameworks
find "$APP_PATH/Contents/Frameworks" -name "*.framework" -type d | while read -r framework; do
    echo "   Signing framework: $framework"
    codesign --force --sign "$IDENTITY" --timestamp --options runtime "$framework"
done

# Sign the main executable
echo "   Signing main executable..."
codesign --force --sign "$IDENTITY" --timestamp --options runtime --entitlements "$ENTITLEMENTS" "$APP_PATH/Contents/MacOS/flash-snap"

# Sign the main app bundle
echo "   Signing main app bundle..."
codesign --force --sign "$IDENTITY" --timestamp --options runtime --entitlements "$ENTITLEMENTS" "$APP_PATH"

echo "✅ All components signed"
echo ""

# Step 2: Verify signature
echo "� Step 2: Verifying signature..."
codesign --verify --deep --strict --verbose=2 "$APP_PATH"
echo "✅ Signature verified"
echo ""

# Step 3: Create zip for notarization
echo "📦 Step 3: Creating zip for notarization..."
rm -f "$ZIP_PATH"
ditto -c -k --keepParent "$APP_PATH" "$ZIP_PATH"
echo "✅ Zip created: $ZIP_PATH"
echo ""

# Step 4: Submit for notarization
echo "🚀 Step 4: Submitting for notarization..."
echo "   (This may take a few minutes...)"
xcrun notarytool submit "$ZIP_PATH" \
    --key "$API_KEY_PATH" \
    --key-id "$API_KEY_ID" \
    --issuer "$API_ISSUER" \
    --wait

echo ""

# Step 5: Staple the notarization ticket
echo "📎 Step 5: Stapling notarization ticket..."
xcrun stapler staple "$APP_PATH"
echo "✅ Notarization ticket stapled"
echo ""

# Step 6: Create final DMG
echo "💿 Step 6: Creating DMG..."
VERSION=$(node -p "require('./package.json').version")
DMG_PATH="dist/flash-snap-${VERSION}-${ARCH}-signed.dmg"
rm -f "$DMG_PATH"
hdiutil create -volname "Flash Snap" -srcfolder "$APP_PATH" -ov -format UDZO "$DMG_PATH"
echo "✅ DMG created: $DMG_PATH"
echo ""

# Step 7: Staple DMG too
echo "📎 Step 7: Stapling DMG..."
xcrun stapler staple "$DMG_PATH"
echo ""

echo "=========================================="
echo "✅ DONE! Your signed & notarized DMG is at:"
echo "   $DMG_PATH"
echo "=========================================="
