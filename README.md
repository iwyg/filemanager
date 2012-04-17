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

## Configuration 

### Preferences

![Filebrowser View](http://dev.thomas-appel.com/symphony/assets/sym_fm_preferences.png)

- `Defaul MIME types`: define the default Mimetypes that should be allowed for
  uploading. This will be overwritten if you set `default MIME tyes` on the
field Settings
- `ignore files`: define which files shoud be ignored in the directory listing by default.  
  Don't put in here different regulat expressions but Regexp fragments, e.g. if
you want to ignore all files with a `.jpg` and  `.gif` extension, write
`\\.jpe?g$ \\.gif$` which becomes a regular expression that looks like this `/(\\.jpe?g$|\\.gif$)/i`
  You can extend this per field in the fields' setting panel 

### Field Settings

![Filebrowser View](http://dev.thomas-appel.com/symphony/assets/sym_fm_settings_diroptions.png)

#### `Directory options`: 

Set the rootdirectory within `workspace` and select which directories should be excluded. You can also choose to allow
moving, removing and/or creating directories

![Filebrowser View](http://dev.thomas-appel.com/symphony/assets/sym_fm_settings_fileuoload_a.png)

#### `Allow fileupload`:

Check this, if you want to allow uploading files. After you save your current
Section, more options wil become available, as they are: 

![Filebrowser View](http://dev.thomas-appel.com/symphony/assets/sym_fm_settings_fileuoload_b.png)

- `Unique Filenames`: check this, if you want to have unique filesnames
- `Allowed MIME types`: define the Mimetypes that should be allowed for
  uploading. This will override the defaults set in preferences for this field.

![Filebrowser View](http://dev.thomas-appel.com/symphony/assets/sym_fm_settings_fileoptions.png)

#### `File options`:

Extend the default filesextensions that should be ignored (see Preferences) and
set if you want to allow moving files to another location and/or allow deleting
files.

![Filebrowser View](http://dev.thomas-appel.com/symphony/assets/sym_fm_settings_fselectoptions.png)

#### `Select options`:

Limit the amount of files that can be selected per entry. `0` means unlimited.



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

### beta 1.3, 2012-04-18

- fixed an error when a directory wasn't accessible (dev 1.4.3)
- improved error handling (dev 1.4.3)
- replaced some method calls for compatibility reasons (dev 1.4.3)
- File ignoring now works as expected (dev 1.4.2)
- added support for multiplatform installations (pathhandling etc.) (dev 1.4)
- False error handling for failed uploads (dev 1.4)
- There was an error while creating new directories. New directories were always created in the workspace root folder (dev 1.4)
- file upload for legacy browser (iframe-transport mode) (dev 1.3)
- Metaviews now retain their states when a directory node gets updated (dev 1.3)
- Fixed some possible pitfalls in case PECL extension `finfo_open` is not available (dev 1.3)
- Fixed some possible putfalls in case of a broken default file ignore regexp fragment (dev 1.3)

### beta 1.2, 2012-04-12

- fixed broken default file-ignore RegExp
- added update method that will handle broken default regexp form previous verions
- Filebrowser: Folders now auto open and close when dragging over them

### beta 1.1, 2012-04-11

- fixed directory update behaviour
- deprecated field setting that would cause an error 

### beta 1, 2012-04-11

- initial release


## Roadmap

- Fix fileupload issues for legacy Browsers 
   
[1]: https://github.com/iwyg/sym_requirejs
[2]: https://github.com/iwyg/sym_backbonejs
