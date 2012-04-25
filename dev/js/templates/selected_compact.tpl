<% var addClass = draggable ? ' draggable' : ''; %>
<li id="item-<%= id %>" class="floatbar<%= addClass %>" >
	<span class="floatbar-label">
		<span class="file-name" href="<%= src %>" target="_blanc"><%= file %></span>
		<input class="file-selected" id="selected-<%= id %>" type="hidden" name="fields[<%= fieldname %>][file][]" value="<%= path %>" readonly="readonly"/>
	</span>
	<span class="btn-round remove last" id="remove-<%= id %>">×</span>
</li>
