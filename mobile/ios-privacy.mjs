import { readFile, writeFile } from 'node:fs/promises';
const project = new URL('ios/App/App.xcodeproj/project.pbxproj', import.meta.url);
let text = await readFile(project, 'utf8');
const fileId = 'FE1AA0010000000000000001', buildId = 'FE1AA0010000000000000002';
if (!text.includes(fileId)) {
  text = text.replace('/* End PBXBuildFile section */', `${buildId} /* PrivacyInfo.xcprivacy in Resources */ = {isa = PBXBuildFile; fileRef = ${fileId}; };\n/* End PBXBuildFile section */`);
  text = text.replace('/* End PBXFileReference section */', `${fileId} /* PrivacyInfo.xcprivacy */ = {isa = PBXFileReference; lastKnownFileType = text.xml; path = App/PrivacyInfo.xcprivacy; sourceTree = SOURCE_ROOT; };\n/* End PBXFileReference section */`);
  const resources = /(isa = PBXResourcesBuildPhase;[\s\S]*?files = \()/;
  if (!resources.test(text)) throw new Error('Missing iOS resources phase');
  text = text.replace(resources, `$1\n${buildId} /* PrivacyInfo.xcprivacy in Resources */,`);
  await writeFile(project, text);
}
await writeFile(new URL('ios/App/App/PrivacyInfo.xcprivacy', import.meta.url), `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>NSPrivacyTracking</key><false/>
<key>NSPrivacyCollectedDataTypes</key><array/>
<key>NSPrivacyAccessedAPITypes</key><array><dict>
<key>NSPrivacyAccessedAPIType</key><string>NSPrivacyAccessedAPICategoryFileTimestamp</string>
<key>NSPrivacyAccessedAPITypeReasons</key><array><string>C617.1</string></array>
</dict></array></dict></plist>`);
