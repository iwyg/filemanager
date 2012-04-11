<li id="item-<%= id %>" class="row bb" >
	<div class="list-column-2">
		<label for="selected-<%= id %>">
			<a class="file-name" href="<%= src %>" target="_blanc"><%= file %></a>
		</label> 
		<input id="selected-<%= id %>" type="hidden" name="fields[<%= fieldname %>][file][]" value="<%= path %>" readonly="readonly"/>
	</div>
	<div class="list-column-2">
		<span class="btn remove last" id="remove-<%= id %>">×</span>
	</div>
</li>
