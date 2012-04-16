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

## Pitfalls 

<del>As for this developmentrelease, filemanager won't work correctly on none \*nix
selver-environments. Please dont't use it if your webserver runs on a windows
system.</del>

In case you dont't hav PECL extension `finfo_open` installed and the
deprecated `mime_content_type` is not available on you system, the file
mimetype checking will fallback to `application/octet-stream`. This means if you want to use the fileupload feature, you may have one choice: 
include `application/octet-stream` in your allowed mimetype settings. The
result will be that all files get validated serverside as the right mimetype, thought clientside validation will work as expected (depends on the browser. e.g. IE will not).

## Changelog

### dev 1.4.2, 2012-04-17

- File ignoring now works as expected

### dev 1.4, 2012-04-17

- added support for multiplatform installations (pathhandling etc.)
- False error handling for failed uploads
- There was an error while creating new directories. New directories were always created in the workspace root folder

### dev 1.3, 2012-04-14

- file upload for legacy browser (iframe-transport mode)
- Metaviews now retain their states when a directory node gets updated
- Fixed some possible pitfalls in case PECL extension `finfo_open` is not available
- Fixed some possible putfalls in case of a broken default file igniore regexp fragment			
   

[1]: https://github.com/iwyg/sym_requirejs
[2]: https://github.com/iwyg/sym_backbonejs
