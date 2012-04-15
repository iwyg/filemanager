# Filemanager

![Filemanager](http://dev.thomas-appel.com/symphony/assets/sym_fm_filemanager.png)

## Selections

The Selection Field is the actual field (the one which will hold all data);
Selecting a file is easy: just click on a file title in the Filebrowser Panel
to select a file and klick on the remove button (or on a selected file title
once again) to remove it form the selection.

![Selection View](http://dev.thomas-appel.com/symphony/assets/sym_fm_selection.png)

## Uploads

You can add or remove a upload section for each directory within your selected
root directory (given you configuration allows file uploads).

![Upload View](http://dev.thomas-appel.com/symphony/assets/sym_fm_upload_b.png)

Uploaded files will show up in the filebrowser as soon as they are validated.

![Upload View](http://dev.thomas-appel.com/symphony/assets/sym_fm_upload_c.png)

## Filebrowser

![Filebrowser View](http://dev.thomas-appel.com/symphony/assets/sym_fm_filebrowser.png)

This is the heart of the Filemanager field. Depending on your configuration, you
can move and delete files and directories, create new directories or upload
files from your local harddrive. 

![Filebrowser View](http://dev.thomas-appel.com/symphony/assets/sym_fm_filebrowser_meta.png)

Each fileview also has a meta view panel. Click on a files' infobutton to
display additional file information such as file size, file type and a file
preview (if available).

## Dependencies

Filemanager has two hard Dependencies

 - [Require js for Symphony CMS][1]
 - [Backbone js for Symphony CMS][2]

so if you want to use filemanager, install these extensions first

[1]: https://github.com/iwyg/sym_requirejs
[2]: https://github.com/iwyg/sym_backbonejs

## Pitfalls 

As for this beta-release, filemanager won't work correctly on none \*nix
server-environments. Please dont't use it if your webserver runs on a windows
system.

## Roadmap

 - Fix fileupload issues for legacy Browsers 
 - Improve error handling on moving, creating and deleting files ans directories 
 - Fix path handling for none \*nix system
   


