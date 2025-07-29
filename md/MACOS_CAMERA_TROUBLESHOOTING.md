# macOS Camera Troubleshooting Guide

This guide helps resolve camera issues on macOS, specifically for the PayBridge chat application.

## 🔍 **Common macOS Camera Issues**

### **1. Black Screen After Permission Grant**
**Problem**: Camera shows black screen even after granting permissions.

**Solutions**:
1. **Check System Preferences**:
   - Go to `System Preferences` → `Security & Privacy` → `Privacy` → `Camera`
   - Ensure your browser (Chrome/Safari) is checked
   - If not, check it and restart your browser

2. **Browser-Specific Settings**:
   - **Chrome**: `chrome://settings/content/camera`
   - **Safari**: `Safari` → `Preferences` → `Websites` → `Camera`
   - **Firefox**: `about:preferences#privacy` → `Permissions` → `Camera`

3. **Reset Camera Permissions**:
   ```bash
   # Terminal command to reset camera permissions
   sudo killall VDCAssistant
   sudo killall AppleCameraAssistant
   ```

### **2. Camera Already in Use**
**Problem**: "Camera is already in use by another application"

**Solutions**:
1. **Close Other Applications**:
   - FaceTime
   - Photo Booth
   - Zoom
   - Teams
   - Any video conferencing apps

2. **Force Quit Camera Processes**:
   ```bash
   # Check what's using the camera
   lsof | grep -i camera
   
   # Kill camera processes
   sudo killall VDCAssistant
   sudo killall AppleCameraAssistant
   ```

3. **Restart Camera Services**:
   ```bash
   sudo launchctl unload /System/Library/LaunchDaemons/com.apple.cmio.VDCAssistant.plist
   sudo launchctl load /System/Library/LaunchDaemons/com.apple.cmio.VDCAssistant.plist
   ```

### **3. Permission Denied**
**Problem**: Browser shows "Camera permission denied"

**Solutions**:
1. **System Level**:
   - `System Preferences` → `Security & Privacy` → `Privacy` → `Camera`
   - Add your browser to the list
   - Restart browser

2. **Browser Level**:
   - Clear browser cache and cookies
   - Reset site permissions
   - Try incognito/private mode

3. **Website Level**:
   - Click the camera icon in the address bar
   - Select "Allow" for camera access
   - Refresh the page

## 🛠️ **Step-by-Step Fix Process**

### **Step 1: Check System Camera Settings**
1. Open `System Preferences`
2. Go to `Security & Privacy` → `Privacy`
3. Select `Camera` from the left sidebar
4. Ensure your browser is checked
5. If not, check it and restart your browser

### **Step 2: Browser Camera Settings**
1. **Chrome**:
   - Go to `chrome://settings/content/camera`
   - Add `http://localhost:3001` to allowed sites
   - Or set to "Ask before accessing"

2. **Safari**:
   - `Safari` → `Preferences` → `Websites` → `Camera`
   - Set localhost to "Allow"

3. **Firefox**:
   - `about:preferences#privacy`
   - Scroll to `Permissions` → `Camera`
   - Set to "Ask before accessing"

### **Step 3: Test Camera Access**
1. Go to `http://localhost:3001/camera-test`
2. Check the debug information
3. Try starting the camera
4. Look for specific error messages

### **Step 4: Reset Camera Services**
If still having issues, run these commands in Terminal:

```bash
# Stop camera services
sudo killall VDCAssistant
sudo killall AppleCameraAssistant

# Wait a few seconds
sleep 3

# Restart camera services
sudo launchctl unload /System/Library/LaunchDaemons/com.apple.cmio.VDCAssistant.plist
sudo launchctl load /System/Library/LaunchDaemons/com.apple.cmio.VDCAssistant.plist
```

### **Step 5: Browser Reset**
1. Clear browser cache and cookies
2. Reset site permissions
3. Restart browser completely
4. Try in incognito/private mode

## 🔧 **Advanced Troubleshooting**

### **Check Camera Hardware**
```bash
# Check if camera is detected
system_profiler SPCameraDataType

# Check camera processes
ps aux | grep -i camera
```

### **Reset All Camera Permissions**
```bash
# Reset camera permissions for all apps
sudo tccutil reset Camera

# Restart computer after this
```

### **Check Browser Console**
1. Open browser developer tools (F12)
2. Go to Console tab
3. Look for camera-related errors
4. Common errors:
   - `NotAllowedError`: Permission denied
   - `NotFoundError`: No camera found
   - `NotReadableError`: Camera in use
   - `OverconstrainedError`: Settings not supported

## 🌐 **Browser-Specific Solutions**

### **Chrome**
1. **Settings**: `chrome://settings/content/camera`
2. **Flags**: `chrome://flags/#enable-experimental-web-platform-features`
3. **Clear Data**: `chrome://settings/clearBrowserData`
4. **Reset**: `chrome://settings/reset`

### **Safari**
1. **Preferences**: `Safari` → `Preferences` → `Websites` → `Camera`
2. **Develop Menu**: Enable in `Safari` → `Preferences` → `Advanced`
3. **Reset**: `Safari` → `Develop` → `Empty Caches`

### **Firefox**
1. **Settings**: `about:preferences#privacy`
2. **Permissions**: `about:permissions`
3. **Reset**: `about:preferences#privacy` → `Clear Data`

## 📱 **macOS Version Specific Issues**

### **macOS Big Sur (11.0+)**
- Camera permissions are more strict
- Requires explicit permission in System Preferences
- May need to restart after permission changes

### **macOS Monterey (12.0+)**
- Enhanced privacy features
- Camera indicator in menu bar
- More granular permission controls

### **macOS Ventura (13.0+)**
- New privacy features
- Camera access indicators
- Enhanced security prompts

## 🚨 **Emergency Solutions**

### **If Nothing Works**
1. **Restart Computer**: Simple but effective
2. **Safe Mode**: Boot in safe mode and restart
3. **Reset SMC**: For hardware issues
4. **Reset NVRAM**: For system-level issues

### **Hardware Issues**
1. **External Camera**: Try USB camera
2. **Built-in Camera**: Check if it works in Photo Booth
3. **Hardware Test**: Run Apple Hardware Test

## 📞 **Getting Help**

### **Debug Information to Collect**
1. **macOS Version**: `About This Mac`
2. **Browser Version**: Browser settings
3. **Error Messages**: From browser console
4. **Camera Test Results**: From `/camera-test` page
5. **System Logs**: Console app → camera-related entries

### **Contact Information**
- **Browser Issues**: Browser support
- **macOS Issues**: Apple Support
- **App Issues**: PayBridge support

## ✅ **Verification Steps**

After applying fixes, verify:

1. **System Level**:
   - Camera works in Photo Booth
   - Camera works in FaceTime
   - Camera permissions are set correctly

2. **Browser Level**:
   - Camera test page shows devices
   - No console errors
   - Camera starts successfully

3. **Application Level**:
   - File upload modal opens
   - Camera button works
   - Photos can be captured

## 🔄 **Prevention Tips**

1. **Keep macOS Updated**: Latest security patches
2. **Regular Browser Updates**: Latest browser versions
3. **Monitor Permissions**: Check camera permissions regularly
4. **Close Unused Apps**: Don't leave camera apps running
5. **Restart Regularly**: Helps clear camera processes

This comprehensive guide should resolve most macOS camera issues. If problems persist, the debug information from `/camera-test` will help identify the specific cause. 