const { withAndroidManifest, AndroidConfig, withMainActivity } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Config plugin to add foreground service for shake detection
 */
const withShakeDetectionService = (config) => {
  // Add required permissions (no deprecated FOREGROUND_SERVICE_SENSORS here)
  config = AndroidConfig.Permissions.withPermissions(config, [
    'android.permission.FOREGROUND_SERVICE',
    'android.permission.WAKE_LOCK',
    'android.permission.RECEIVE_BOOT_COMPLETED',
  ]);

  // Modify AndroidManifest.xml
  config = withAndroidManifest(config, (config) => {
    const { manifest } = config.modResults;
    
    if (!manifest.application) {
      manifest.application = [{}];
    }
    
    const application = manifest.application[0];

    // Ensure application-level cleartext traffic is enabled
    application.$ = application.$ || {};
    application.$['android:usesCleartextTraffic'] = 'true';
    
    // Ensure service declaration exists and uses foregroundServiceType="dataSync"
    if (!application.service) {
      application.service = [];
    }

    let shakeService = application.service.find(
      (s) => s.$ && s.$['android:name'] === '.ShakeDetectionService'
    );

    if (!shakeService) {
      shakeService = {
        $: {
          'android:name': '.ShakeDetectionService',
          'android:enabled': 'true',
          'android:exported': 'false',
        },
      };
      application.service.push(shakeService);
    }

    // Force foregroundServiceType to "dataSync" (replace any previous value like "sensors")
    shakeService.$['android:foregroundServiceType'] = 'dataSync';
    
    // Add receiver for boot completed
    if (!application.receiver) {
      application.receiver = [];
    }
    
    const receiverExists = application.receiver.some(
      (r) => r.$ && r.$['android:name'] === '.ShakeDetectionBootReceiver'
    );
    
    if (!receiverExists) {
      application.receiver.push({
        $: {
          'android:name': '.ShakeDetectionBootReceiver',
          'android:enabled': 'true',
          'android:exported': 'true',
        },
        'intent-filter': [
          {
            action: [
              {
                $: {
                  'android:name': 'android.intent.action.BOOT_COMPLETED',
                },
              },
            ],
          },
        ],
      });
    }
    
    return config;
  });

  // Register native module in MainActivity
  config = withMainActivity(config, (config) => {
    const mainActivityPath = path.join(
      config.modRequest.platformProjectRoot,
      'app/src/main/java',
      config.android.package.replace(/\./g, '/'),
      'MainActivity.java'
    );

    if (fs.existsSync(mainActivityPath)) {
      let mainActivityContent = fs.readFileSync(mainActivityPath, 'utf8');
      
      // Check if package is already imported
      if (!mainActivityContent.includes('import com.pulkit_singhal.sos.ShakeDetectionPackage;')) {
        // Add import after other imports
        const importRegex = /(import com\.facebook\.react\.ReactPackage;)/;
        if (importRegex.test(mainActivityContent)) {
          mainActivityContent = mainActivityContent.replace(
            importRegex,
            '$1\nimport com.pulkit_singhal.sos.ShakeDetectionPackage;'
          );
        }
        
        // Add package to getPackages() method
        const packagesRegex = /(protected List<ReactPackage> getPackages\(\)\s*\{[^}]*return Arrays\.asList\([^)]*)/;
        if (packagesRegex.test(mainActivityContent)) {
          mainActivityContent = mainActivityContent.replace(
            packagesRegex,
            '$1\n                new ShakeDetectionPackage(),'
          );
        }
        
        fs.writeFileSync(mainActivityPath, mainActivityContent);
      }
    }

    return config;
  });

  return config;
};

module.exports = withShakeDetectionService;
