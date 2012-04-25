<% var classSelected = selected ? ' selected' : '' %>
<li id="result-<%= id %>" class="row list-row result-item file<%=classSelected%>" >
	<div class="list-column-2">
		<div class="right-space">
		<div class="left-space">
			<img src="<%= thumb %>" height="40" width="40" alt="file-preview"/>
		</div>
			<span class="file-name" data-src="<%= src %>"><%= file %></span>
			<span class="root-name"><%= dir.attributes.path %></span>
		</div>
	</div>
</li>
