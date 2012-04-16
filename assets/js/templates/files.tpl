<% var draggable = settings.allow_file_move ? ' draggable' : '' %>
<li class="<%= cssclass %><%= draggable %>" id="file-<%= id %>">
	<% if (settings.allow_file_move) {%>
	<span class="ui-icon move" id="move-<%= id %>"></span>	
	<%}%>
	<span class="ui-icon"></span>
	<span class="text"><%= file %></span>
	<% if (settings) { %>	
	<span class="toolbar">
		<span class="ui-icon preview" id="preview-<%= id %>"></span>	
		<% if (settings.allow_file_delete) {%>
		<span class="ui-icon delete file" id="del-<%= id %>" title="delete file"></span>	
		<%}%>
	</span>
	<%}%>
</li>
