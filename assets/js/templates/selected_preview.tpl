<% var addClass = draggable ? ' draggable' : ''; %>
<li id="item-<%= id %>" class="row list-row select-item<%= addClass %>" >
	<div class="list-column-2">
		<div class="right-space">
		<div class="left-space">
			<% if(draggable) { %>
			<span class="ui-icon move"></span>
			<% } %>
			<img src="<%= thumb %>" height="40" width="40" alt="file-preview"/>
		</div>
			<span class="file-name" data-src="<%= src %>"><%= file %></span>
			<input  class="file-selected" id="selected-<%= id %>" type="hidden" name="fields[<%= fieldname %>][file][]" value="<%= path %>" readonly="readonly"/>
		</div>
	</div>
	<div class="list-column-2">
		<span class="btn small remove last" id="remove-<%= id %>">×</span>
	</div>
</li>
