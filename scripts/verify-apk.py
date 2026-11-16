from pathlib import Path
from zipfile import ZipFile
import hashlib
apk=Path('android/app/build/outputs/apk/debug/app-debug.apk')
with ZipFile(apk) as archive:
    count=0
    for file in Path('dist-android').rglob('*'):
        if file.is_file():
            entry='assets/public/'+file.relative_to('dist-android').as_posix()
            assert archive.read(entry)==file.read_bytes(), entry
            count+=1
print(f'PASS: {count} web files match the APK byte for byte')
print('SHA256:',hashlib.sha256(apk.read_bytes()).hexdigest())
