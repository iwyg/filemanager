<% var draggable = (settings.allow_file_move && moveable) ? ' draggable' : '' %>
<li class="<%= cssclass %><%= draggable %>" id="file-<%= id %>">
	<% if (settings.allow_file_move && moveable) {%>
	<span class="ui-icon move" id="move-<%= id %>"></span>	
	<%}%>
	<% if (!moveable) {%>
	<span class="ui-icon readonly"></span>	
	<%}%>
	<span class="ui-icon file"></span>
	<span class="text"><%= file %></span>
	<% if (settings) { %>	
	<span class="toolbar">
		<span class="ui-icon preview" id="preview-<%= id %>"></span>	
		<% if (settings.allow_file_delete && moveable) {%>
		<span class="ui-icon delete file" id="del-<%= id %>" title="delete file"></span>	
		<%}%>
	</span>
	<%}%>
</li>
