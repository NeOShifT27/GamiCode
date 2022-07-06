from time import sleep
from pydrive.auth import GoogleAuth
from pydrive.drive import GoogleDrive
import sys


def upload_file_to_googledrive(myfile):
    print('start upload')
    gauth = GoogleAuth()
    gauth.LocalWebserverAuth()
    drive = GoogleDrive(gauth)
    f = drive.CreateFile()
    f.SetContentFile(myfile)
    f.Upload()

    print("uploaded file", 'title: %s, mimeType: %s' %
          (f['title'], f['mimeType']))
    sleep(100)
    f.Trash()  # Move file to trash.
    f.UnTrash()  # Move file out of trash.
    f.Delete()
    print("file deleted")


upload_file_to_googledrive(sys.argv[1])
