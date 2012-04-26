# Filemanager

## Installation notes

This development branche is not compatible to Symphony CMS lower than 2.3.
Go to `extensions/filemanager/dev` and run `build.sh`.
If this throws an error saying something like `Error: ENOENT, no such file or directory 'extensions/filemanager/build/js/plugins/jquery-iframe-transport/jquery-iframe-transport.js'`
type `git submodule update --init` from within `extensions/filemanager`

## Notes on Multiple field instances

As a major change, version 1.0.0 now allows you to have multiple filemager
instances per section. Though keeps its files and folders in sync when, it's
beste practice not to share the same directories between filemanager fields. 

## Dependencies

Filemanager has two hard Dependencies
- [Require js for Symphony CMS][1]
- [Backbone js for Symphony CMS][2]

so if you want to use filemanager, install these extensions first

## Pitfalls 

This mainly refers to developers who are testing on windows/mampp environments

In case you dont't have PECL extension `finfo_open` installed and the
deprecated `mime_content_type` is not available on you system, the file
mimetype checking will fallback to `application/octet-stream`. 
This means if you want to use the fileupload feature, you may have one choice: 
include `application/octet-stream` in your allowed mimetype settings. The
result will be that all files get validated serverside as the right mimetype, thought clientside validation will work as expected (depending on the browser. e.g. IE will not).

## Configuration 

### Preferences

![Filebrowser View](http://dev.thomas-appel.com/symphony/assets/sym_fm_preferences.png)

- `Defaul MIME types`: define the default Mimetypes that should be allowed for
  uploading. This will be overwritten if you set `default MIME tyes` on the
field Settings
- `ignore files`: define which files shoud be ignored in the directory listing by default.  
  Don't put in here different regulat expressions but Regexp fragments, e.g. if
you want to ignore all files with a `.jpg` and  `.gif` extension, write
`\.jpe?g$ \.gif$` which becomes a regular expression that looks like this `/(\.jpe?g$|\.gif$)/i`
  You can extend this per field in the fields' setting panel 

### Field Settings

![Filebrowser View](http://dev.thomas-appel.com/symphony/assets/sym_fm_1_settings_diroptions.png)

#### `Directory options`: 

Set the rootdirectory within `workspace` and select which directories should be excluded. You can also choose to allow
moving, removing and/or creating directories

![Filebrowser View](http://dev.thomas-appel.com/symphony/assets/sym_fm_1_settings_fileuoload_a.png)

#### `Allow fileupload`:

Check this, if you want to allow uploading files. After you save your current
Section, more options wil become available, as they are: 

![Filebrowser View](http://dev.thomas-appel.com/symphony/assets/sym_fm_1_settings_fileuoload_b.png)

- `Unique Filenames`: check this, if you want to have unique filesnames
- `Allowed MIME types`: define the Mimetypes that should be allowed for
  uploading. This will override the defaults set in preferences for this field.

![Filebrowser View](http://dev.thomas-appel.com/symphony/assets/sym_fm_1_settings_fileoptions.png)

#### `File options`:

Extend the default filesextensions that should be ignored (see Preferences) and
set if you want to allow moving files to another location and/or allow deleting
files.

![Filebrowser View](http://dev.thomas-appel.com/symphony/assets/sym_fm_1_settings_fselectoptions.png)

#### `Select options`:

Limit the amount of files that can be selected per entry. `0` means unlimited.

## The Field

![Filemanager](http://dev.thomas-appel.com/symphony/assets/sym_fm_1_filemanager.png)

### Selections

The Selection Field is the actual field (the one which will hold all data);
Selecting a file is easy: just click on a file title in the Filebrowser Panel
to select a file and klick on the remove button (or on a selected file title
once again) to remove it form the selection.

#### compact

![Selection View](http://dev.thomas-appel.com/symphony/assets/sym_fm_1_selection_compact.png)

#### preview

![Selection View](http://dev.thomas-appel.com/symphony/assets/sym_fm_1_selection_preview.png)

### Uploads

You can add or remove a upload section for each directory within your selected
root directory (given you configuration allows file uploads).


Uploaded files will show up in the filebrowser as soon as they are validated.

![Upload View](http://dev.thomas-appel.com/symphony/assets/sym_fm_1_upload.png)

### Filebrowser

![Filebrowser View](http://dev.thomas-appel.com/symphony/assets/sym_fm_1_filebrowser.png)

This is the heart of the Filemanager field. Depending on your configuration, you
can move and delete files and directories, create new directories or upload
files from your local harddrive. 

### Search for files

![Filebrowser View](http://dev.thomas-appel.com/symphony/assets/sym_fm_1_filesearch.png)

### Meta View

![Filebrowser View](http://dev.thomas-appel.com/symphony/assets/sym_fm_1_filebrowser_meta.png)

Each fileview also has a meta view panel. Click on a files' infobutton to
display additional file information such as file size, file type and a file
preview (if available).

## Changelog

### 1.5 dev, 2012-04-25

- filemanager field can now hav multiple instances 
- No longer compatible with Symphony CMS < 2.3
- added filesearch view 
- selections can now be reordered
- selection view can now be displayed in two different modes (`preview` and `compact`)  
- design changes

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
