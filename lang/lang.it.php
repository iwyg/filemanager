<?php

  $about = array(
		'name' => 'Italian',
		'author' => array(
			'name' => 'Davide Grobberio',
			'email' => 'davide@zaniniadv.it',
			'website' => 'http://www.zaniniadv.it'
		),
		'release-date' => '2013-03-30'
	);

	/**
	 * Filemanager
	 * @package lang
	 */
    $dictionary = array(
		'Show filesearch' =>
		'Mostra ricerca',

        'Filemanager Pagination' =>
        'Paginazione filemanager',

        'Filemanager' =>
        ' Gestione files',

		'save section for further upload options' =>
		'salvare la sezione per ulteriori opzioni di caricamento',

		'Select options' =>
		'Seleziona opzioni',

		'display mode' =>
		'Visualizzazione',

		'Limit file selection' =>
		'Limite selezione file',

		'Allow re-ordering selected' =>
		'Ordinamento abilitato',

		'Display selected files compact or as thumbnail list' =>
		'Visualizza i files selezionati compatti o come elenco miniature',

		'type any valid number (<code>0:</code> no limit, <code>-1:</code> selecting files is deaktivated)' =>
		'digita un numero valido (<code>0:</code> nessun limite, <code>-1:</code> La selezione dei files è disattivata)',

		'{$count} files found' =>
		'{$count} files trovati',

		'{$count} file found' =>
		'{$count} file trovato',

		'can\'t delete or move {$dir}. {$dir2} is used by another field' =>
		'non è possibile cancellare o spostare {$dir}. {$dir2} è utilizzato in altri campi',

		'no files Selected' =>
		'nessun file selezionato',

		' files' =>' files',
		' file' =>' file',

		'successfully deleted {$file}' =>
		'{$file} cancellato con successo',

		'file {$item} successfully moved to {$to}' =>
		'file {$item} spostato in {$to}',

		'directory {$item} successfully moved {$to}' =>
		'cartella {$item} spostata in {$to}',

		'can\'t delete directory {$file}' =>
		'non è possibile eliminare la cartella {$file}',

		'can\'t delete file {$file}' =>
		'non è possibile eliminare il file {$file}',

		'can\'t move {$file} to {$location}' =>
		'non è possibile spostare {$file} in {$location}',

		'Failed creating Directory {$dir} in {$path}' =>
		'Non è possibile creare la cartella {$dir} in {$path}',

		'Cannot access {$file}' =>
		'Impossibile accedere a {$file}',

		'Cannot upload {$file}' =>
		'Impossibile caricare {$file}',

		'{$file} successfully uploaded' =>
		'{$file} caricato con successo',

		'Filemanager requires requirejs. Please make sure the extension <a href="https://github.com/iwyg/sym_requirejs">sym_requirejs</a> is installed' =>
		'Filemanager richiede "requirejs". Assicurati di aver installato l\'estensione <a href="https://github.com/iwyg/sym_requirejs">sym_requirejs</a>',

		'Filemanager requires backbonejs Please make sure extension <a href="https://github.com/iwyg/sym_backbonejs">sym_backbonejs</a> is installed' =>
		'Filemanager richiede "backbonejs". Assicurati di aver installato l\'estensione <a href="https://github.com/iwyg/sym_backbonejs">sym_backbonejs</a>',

		'Cannot resolve directory structure for {$root}' =>
		'Impossibile risolvere struttura di directory per {$root}',

		'file type {$mimetype} not allowed' =>
		'tipologia file {$mimetype} non concesso',

		'file size ({$f_size}) limit exceeds allowed size' =>
		'la dimensione del file ({$f_size}) supera i limiti concessi',

		'There are unsaved changes. Do you really want to continue?' =>
		'Ci sono modifiche non salvate. Sei sicuro di voler continuare?',

		'Can\'t select more than {$count} files' =>
		'Non è possibile selezionare più di {$count} files',

		'invalid destination: {$dir}' =>
		'destinazione non valida: {$dir}',

		'{$item} exceeds allowed size' =>
		'{$item} supera le dimensioni concesse',

		'{$item}: filetype invalid' =>
		'{$item}: tipo di file non valido',

		'file {$file} already exists' =>
		'file {$file} già esistente ',

		'directory {$file} already exists' =>
		'cartella {$file} già esistente',

		'Directory {$dir} successfully created in {$path}' =>
		'La cartella {$dir} è stata creata con successo in {$path}',

		'Are you shure you want to delete {$file}? This step cannot be undone.' =>
		'Sicuro di voler cancellare il file {$file}? Una volta cencellato non è possibile recuperarlo.',

		'Are you shure you want to delete {$dir}? {$dir2} contains {$dircount} directories and {$filecount} files that will be deleted. This step cannot be undone.' =>
		'Sicuro di voler cancellare la cartella {$dir}? {$dir2} contiene {$dircount} cartelle e {$filecount} files che saranno cancellati. Non è possibile annullare \'operazione.',

		'File upload' =>
		'File caricato',

		'Unique filenames' =>
		'Filename unico',

		'Filebrowser' =>
		'File browser',

		'Selected files' =>
		'Files selezionati',

		'Default MIME types' =>
		'Standard MIME Type',

		'Allowed MIME types' =>
		'MIME Types concessi',

		'Ignore files' =>
		'Ignora files',

		'Directory options' =>
		'Opzioni cartella',

		'File options' =>
		'Opzioni files',

		'Root Directory' =>
		'Cartella di root',

		'Exclude Directories' =>
		'Escludi cartelle',

		'Allow moving directories' =>
		'Permetti spostamento cartelle',

		'Allow deleting directories' =>
		'Permetti eliminazione cartelle',

		'Allow creating directories' =>
		'Permetti creazione cartelle',

		'Allow fileupload' =>
		'Permetti caricamento file',

		'Allow moving files' =>
		'Permetti spostamento files',

		'Allow deleting files' =>
		'Permetti eliminazione files',

		'Add uploaded files to selection' =>
		'Aggiungi file caricati alla selezione',

		'<code>RegExp:</code> Define which files should be ignored by the directory listing (default: ignores all dot-files <code>^\..*</code>. Separate expressions with a whitespace)' =>
		'<code>RegExp:</code>Definire quali file devono essere ignorate dal elenco di directory (default: ignora tutti i file con il punto <code>^\..*</code>.  espressioni separate con uno spazio.)',

		'e.g. <code>text/plain text/html image/jpeg</code>, separated by a whitespace character.<br/> Wildcards: <code>text/*</code> or, to allow all possible types, pass a single <code>*</code> (highly unrecommended).' =>
		'es. <code>text/plain text/html image/jpeg</code>, separati da uno spazio bianco..<br/> Caratteri jolly: <code>text/*</code>o, per consentire a tutti i possibili tipi, passare un singolo <code>*</code> (fortemente sconsigliato)',

		'Define the default mimetypes separated be a whitespace character that should be allowed for uploading. <br/> You can use wildcards as well, e.g. <code>text/*</code> will allow all text based mimetypes. Use a single <code>*</code> to allow all types of files (not recomended).' =>
		false,

		'Define which files should be ignored by the directory listing. Separate them with a whitespace character.' =>
		'Definire quali files devono essere ignorati dall\' elenco di directory. Separarli con un carattere di spazio.'
	);
