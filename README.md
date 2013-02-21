# Filemanager

## Dependencies

If you are looking for a 2.2.x compatible version, please checkout the release.2.2.x branch.

Filemanager has two hard dependencies

- [Require js for Symphony CMS][1]
- [Backbone js for Symphony CMS][2]

so if you want to use filemanager, please install these extensions first.
(It is not necessary to install Backbone.js since it only provides the
javascript source for backbone.js and underscore.js. Placing sym_backbonejs extension in
your extensions directory without actually installing it shlould work fine). 

## Notes on Multiple field instances

As a major change, version 1.0.0 now allows you to have multiple filemager
instances per section. Filemanager keeps its files and folders in sync, though it's
beste practice not to share the same directories between different filemanager fields. 

## Pitfalls 

This mainly refers to developers who are testing on windows/mampp environments

In case you dont't have PECL extension `finfo_open` installed and the
deprecated `mime_content_type` is not available on your system, the file
mimetype checking will fallback to `application/octet-stream`. 
 
If you want to use the fileupload feature in this case, include `application/octet-stream` in your allowed mimetype settings. 
This results in all files getting validated on the serverside, though clientside validation will work as expected (depending on the browser. e.g. IE will not).

## Configuration 

### Preferences

![Filebrowser View](http://dev.thomas-appel.com/symphony/assets/sym_fm_preferences.png)

- `Default MIME types`: define the default MIME types which should be allowed for
  uploading. This will be overriddin if you set `default MIME types` on the
fields setting.
- `ignore files`: define which files shoud be ignored in the directory listing by default.  
  Don't put in here different regular expressions but regexp fragments, e.g. if
you want to ignore all files with  `.jpg` and  `.gif` extensions, write
`\.jpe?g$ \.gif$` which becomes a regular expression that looks like `/(\.jpe?g$|\.gif$)/i`.
  You can extend this per field in the fields' setting panel. 

### Field Settings

![Filebrowser View](http://dev.thomas-appel.com/symphony/assets/sym_fm_1_settings_diroptions.png)

#### `Directory options`: 

Set the rootdirectory within `workspace` and select which directories should be excluded. You can also choose to allow
moving, removing and/or creating directories. Uncheck `Show filesearch` if you don't need fielsearch on this field (since 1.0.5).

![Filebrowser View](http://dev.thomas-appel.com/symphony/assets/sym_fm_1_settings_fileuoload_a.png)

#### `Allow fileupload`:

Check this, if you want to allow uploading files. After you save your current
section, more options will become available, as they are: 

![Filebrowser View](http://dev.thomas-appel.com/symphony/assets/sym_fm_1_settings_fileuoload_b.png)

- `Unique Filenames`: check this, if you want to have unique filenames
- `Allowed MIME types`: define the MIME types that should be allowed for
  uploading. This will override the defaults set in preferences for this field.

![Filebrowser View](http://dev.thomas-appel.com/symphony/assets/sym_fm_1_settings_fileoptions.png)

#### `File options`:

Extend the default fileextensions that should be ignored (see Preferences) and
set if you want to allow moving files to another location and/or allow deleting
files.

![Filebrowser View](http://dev.thomas-appel.com/symphony/assets/sym_fm_1_settings_fselectoptions.png)

#### `Select options`:

Limit the amount of files that can be selected per entry. `0` equals unlimited,
`-1` prevents selecting files.

You may allow re-ordering selected files and choose a displaymode (`compact`
and `preview`).

## The Field

![Filemanager](http://dev.thomas-appel.com/symphony/assets/sym_fm_1_filemanager.png)

### Selections

The Selection field is the actual field (the one which will hold all data).
Selecting a file is easy: just click on a file title in the Filebrowser panel
to select a file and click the remove button (or a selected file title
once again) to remove it form the selection. 

Since version 1.0.4 holding down shift allows you to select multiple files at
once.

#### display mode compact

![Selection View](http://dev.thomas-appel.com/symphony/assets/sym_fm_1_selection_compact.png)

#### display mode preview

![Selection View](http://dev.thomas-appel.com/symphony/assets/sym_fm_1_selection_preview.png)

### Uploads

You can add or remove a upload section for each directory within your selected
rootdirectory (given your configuration allows fileuploads).


Uploaded files will show up in the filebrowser as soon as they are validated.

![Upload View](http://dev.thomas-appel.com/symphony/assets/sym_fm_1_upload.png)

### Filebrowser

![Filebrowser View](http://dev.thomas-appel.com/symphony/assets/sym_fm_1_filebrowser.png)

This is the heart of the Filemanager field. Depending on your configuration, you
can move and delete files and directories, create new directories or upload
files from your local harddrive. 

### Search for files

![Filebrowser View](http://dev.thomas-appel.com/symphony/assets/sym_fm_1_filesearch.png)

Results are shown while you are typing. You can add searchresults directly to your selection by
clicking on the a result node.

### Meta View

![Filebrowser View](http://dev.thomas-appel.com/symphony/assets/sym_fm_1_filebrowser_meta.png)

Each fileview also has a meta view panel. Click on a files' infobutton to
display additional file information such as file size, file type and a file
preview (if available).

## Changelog

### 1.0.8, 2013-02-21

- bugfix: legacy method call
- validate uploaded file against all error codes

### 1.0.7, 2012-08-08

- bugfix: opera fileupload
- bugfix: retain selection order

### 1.0.6, 2012-06-20

- bugfixes

### 1.0.5, 2012-06-04

- better handling when file selection is deactivated.
- searchview is now optional (but activated by default).

### 1.0.4, 2012-05-25

- Fixed a bug with uploads on multiple instances.
- you may now select and unselect multiple files at once

### 1.0.3, 2012-05-15

- Fixed a bug with file selection limit.
- Selecting files can now be deactivated (e.g. to use it as a standanlone filemanager)
- updated lang.de

### 1.0.2, 2012-05-10

- Symphony 2.3

### 1.0.1, 2012-05-09

- minor css fix

### 1.0.0, 2012-04-25

- filemanager field can now hav multiple instances 
- added filesearch view 
- selections can now be reordered
- selection view can now be displayed in two different modes (`preview` and `compact`)  
- design changes

### beta 1.3.2, 2012-04-19

- fixed a bug, were files selection would save if there a whitespace character in the files' name

### beta 1.3.1, 2012-04-18

- success message in file deletion now works as expected
- fixed an error where the upload progress indicator wouldn't complete animation

### beta 1.3, 2012-04-17

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
   

[1]: https://github.com/iwyg/sym_requirejs
[2]: https://github.com/iwyg/sym_backbonejs
