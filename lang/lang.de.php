<?php

	$about = array(
		'name' => 'Deutsch',
		'author' => array(
			'name' => 'Thomas Appel',
			'email' => 'mail@thomas-appel.com',
			'website' => 'http://thomas-appel.com'
		),
		'release-date' => '2012-05-15'
	);

	/**
	 * Filemanager
	 * @package lang
	 */
	$dictionary = array(
		'save section for further upload options' => 
		'bitte speichern Sie den Bereich für weitere Optionen',

		'Select options' => 
		'Auswahl-Optionen',

		'display mode' => 
		'Anzeige Moddus',

		'Limit file selection' => 
		'Dateiauswahl einschränken',

		'Allow re-ordering selected' => 
		'Neuanordnung ausgewählter Dateien erlauben',

		'Display selected files compact or as thumbnail list' => 
		'Ausgewählte Dateien kompakt oder als Vorschauliste anzeigen',

		'type any valid number (<code>0:</code> no limit, <code>-1:</code> selecting files is deaktivated)' =>
		'geben Sie eine beliebige gültige Nummer ein (<code>0:</code> ohne Beschränkung, <code>-1:</code> Dateiauswahl ist deaktiviert)',

		'{$count} files found' => 
		'{$count} Dateien gefunden',		

		'{$count} file found' => 
		'{$count} Datei gefunden',

		'can\'t delete or move {$dir}. {$dir2} is used by another field' =>
		'kann {$dir} nicht löschen oder verschieben, da {$dir2} von einem anderen Feld benutz wird',

		'no files Selected' =>
		'kene dateien ausgewählt',

		' files' =>' Dateien',
		' file' =>' Datei',

		'successfully deleted {$file}' =>
		'{$file} erfolgreich grlöscht',

		'file {$item} successfully moved to {$to}' =>
		'Date {$item} erfolgreich nach {$to} verschoben',

		'directory {$item} successfully moved {$to}' =>
		'Verzeichnis {$item} erfolgreich nach {$to} verschoben',

		'can\'t delete directory {$file}' =>
		'Kann Verzeichnis {$file} nicht löschen',

		'can\'t delete file {$file}' =>
		'Kann Datei {$file} nicht löschen',

		'can\'t move {$file} to {$location}' =>
		'kann {$file} nicht nach {$location} verschieben',
		
		'Failed creating Directory {$dir} in {$path}' =>
		'Kann Verzeichnis {$dir} nicht in {$path} erstellen',

		'Cannot access {$file}' =>
		'Kann nicht auf {$file} zugreifen',

		'Cannot upload {$file}' =>
		'Kann Datei {$file} nicht auf den Server laden',

		'{$file} successfully uploaded' => 
		'{$file} erfolgreich hochgeladen',

		'Filemanager requires requirejs. Please make sure the extension <a href="https://github.com/iwyg/sym_requirejs">sym_requirejs</a> is installed' =>
		'Filemanager benötigt requirejs. Bitte stellen Sie sicher das die Extension <a href="https://github.com/iwyg/sym_requirejs">sym_requirejs</a> installiert ist',

		'Filemanager requires backbonejs Please make sure extension <a href="https://github.com/iwyg/sym_backbonejs">sym_backbonejs</a> is installed' =>
		'Filemanager benötigt backbonejs. Bitte stellen Sie sicher das die Extension <a href="https://github.com/iwyg/sym_backbonejs">sym_backbonejs</a> installiert ist',

		'Cannot resolve directory structure for {$root}' =>
		'Kann die Verzeichnisstruckur für {$root} nicht auflösen',

		'file type {$mimetype} not allowed' =>
		'Dateityp {$mimetype} nicht erlaubt',

		'file size ({$f_size}) limit exceeds allowed size' =>
		'Dateigröße ({$f_size}) überschreitet erlaubte Dateigröße',

		'There are unsaved changes. Do you really want to continue?' =>
		'Es liegen Änderungen vor die noch nicht gespeichert wurden. Wollen Sie wirklich fortfahren?',

		'Can\'t select more than {$count} files' =>
		'Kann nicht mehr als {$count} Dateien auswählen',

		'invalid destination: {$dir}' =>
		'ungültiges Verzeichnis: {$dir}',

		'{$item} exceeds allowed size' =>
		'{$item} überschreitet zulässige Größe',

		'{$item}: filetype invalid' =>
		'{$item}: Dateityp nicht zulässig',

		'file {$file} already exists' =>
		'Datei {$file} existiert bereits',

		'directory {$file} already exists' =>
		'Verzeichnis {$file} existiert bereits',

		'Directory {$dir} successfully created in {$path}' =>
		'Verzeichnis {$dir} erfolgreich erstellt in {$path}',

		'Are you shure you want to delete {$file}? This step cannot be undone.' =>
		'Sind Sie sicher, dass die {$file} löschen wollen? Dieser Schritt kann nicht Rückgängig gemacht werden',

		'Are you shure you want to delete {$dir}? {$dir2} contains {$dircount} directories and {$filecount} files that will be deleted. This step cannot be undone.' =>
		'Sind Sie sicher, dass die {$dir} löschen wollen? {$dir2} enthält {$dircount} Verzeichnisse und {$filecount} Dateien die gelöscht werden. Dieser Schritt kann nicht Rückgängig gemacht werden',

		'File upload' =>
		'Datei-Upload',

		'Unique filenames' =>
		'Eindeutige Dateinamen',

		'Filebrowser' =>
		'Datebrowser',

		'Selected files' =>
		'Ausgewählte Dateien',

		'Default MIME types' =>
		'Standard MIME Typen',

		'Allowed MIME types' =>
		'Erlaubte MIME Typen',

		'Ignore files' =>
		'Dateien ignorieren',

		'Directory options' =>
		'Verzeichnisoptionen',

		'File options' =>
		'Dateioptionen',

		'Root Directory' =>
		'Wurzelverzeichnis',

		'Exclude Directories' =>
		'Verzeichnisse ausschließen',

		'Allow moving directories' =>
		'Verzeichnisse dürfen verschoben werden',

		'Allow deleting directories' =>
		'Verzeichnisse dürfen gelöscht werden',

		'Allow creating directories' =>
		'Neue Verzeichnisse anlegen',

		'Allow fileupload' =>
		'Dateien hochladen',

		'Allow moving files' =>
		'Dateien dürfen verschoben werden',

		'Allow deleting files' =>
		'Dateien dürfen gelöscht werden',

		'Add uploaded files to selection' =>
		'Dateien nach dem Hochladen zur Auswahl hinzufügen',

		'<code>RegExp:</code> Define which files should be ignored by the directory listing (default: ignores all dot-files <code>^\..*</code>. Separate expressions with a whitespace)' =>
		'<code>RegExp:</code> Legen Sie fest welche Dateien ignoriert werden sollen (Standard: ignoriert alle dot-files <code>^\..*</code>. Trennen Sie ausdrücke jeweils mit einem Leerzeichen)',

		'e.g. <code>text/plain text/html image/jpeg</code>, separated by a whitespace character.<br/> Wildcards: <code>text/*</code> or, to allow all possible types, pass a single <code>*</code> (highly unrecommended).' =>
		'z.B. <code>text/plain text/html image/jpeg</code>, getrennt durch ein Leerzeichen.<br/> Platzhalter:  <code>text/*</code> oder ein einfaches <code>*</code> (nicht empfohlen)',

		'Define the default mimetypes separated be a whitespace character that should be allowed for uploading. <br/> You can use wildcards as well, e.g. <code>text/*</code> will allow all text based mimetypes. Use a single <code>*</code> to allow all types of files (not recomended).' =>
		'Geben Sie hier die MIME Typen an, die standardmäßig für den Upload erlaubt werden sollen (getrennt durch ein Leerzeichen). </br>Sie können auch Platzhalter vergeben: <code>text/*</code> erlaubt z.B. alle textbasierten MIME Typen. Tragen sie nur ein einziges <code>*</code> ein, werden standardmäßig alle Dateitypen akzeptiert (nicht empfohlen)',

			'Define which files should be ignored by the directory listing. Separate them with a whitespace character.' =>
		'Legen Sie hier fest, welche Dateine in der Verzeichnisauflistung ignoriert werden sollen und trennen Sie diese durch eine Leerzeichen.'	
	);
