<!--dir level <%= level %>">-->
<% var droppable = ((settings.allow_dir_move || settings.allow_file_move) && writable) ? ' droppable' : '', draggable = (settings.allow_dir_move && writable && _parent) ? ' draggable' : '';%>
	<span class="dir-header<%=draggable%><%=droppable%>">
		<% if (settings.allow_dir_move && _parent && writable) {%>
		<span class="ui-icon move" id=" del-<%= id %>"></span>	
		<%}%>
		<% if (!writable) {%>
		<span class="ui-icon readonly"></span>	
		<%}%>
		<span class="dir-toggle"></span>
		<span class="ui-icon"></span>
		<label class="dir-label text">
			<%= name %>
		</label>
		<% if (settings && writable && (settings.allow_dir_upload_files || settings.allow_dir_create || settings.allow_dir_delete)) { %>	
		<span class="toolbar">
			<% if (settings.allow_dir_upload_files) {%>
			<span class="ui-icon upload"></span>	
			<%}%>
			<% if (settings.allow_dir_create) {%>
			<span class="ui-icon create"></span>	
			<%}%>
			<% if (settings.allow_dir_delete) {%>
			<span class="ui-icon delete" id="del-<%= id %>"></span>	
			<%}%>
		</span>
		<%}%>

	</span>
	<ul id="sub-<%= id %>" class="dir sub-dir <% if (!!_parent) {%> sub-dir <%} %>">
	</ul>
<!-- dir end -->
