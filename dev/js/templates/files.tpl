<% var draggable = (settings.allow_file_move && moveable) ? ' draggable' : '' %>
<li class="file<%= draggable %>" id="file-<%= id %>">
	<% if (settings.allow_file_move && moveable) {%>
	<span class="ui-icon move" id="move-<%= id %>"></span>	
	<%}%>
	<% if (!moveable) {%>
	<span class="ui-icon readonly"></span>	
	<%}%>
	<span class="ui-icon file file-<%= extension %>"></span>
	<span class="text" id="select-file-<%=id%>"><%= file %></span>
	<% if (settings) { %>	
	<span class="toolbar">
		<% if (settings.allow_file_delete && moveable) {%>
		<span class="ui-icon delete-file delete" id="del-<%= id %>" title="delete file"></span>	
		<%}%>
		<span class="ui-icon preview" id="preview-<%= id %>"></span>	
	</span>
	<%}%>
</li>
