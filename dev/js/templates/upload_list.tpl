<% var breadcrump = path.split('/'); breadcrump.shift(); breadcrump = breadcrump.join(' > '); %>
<li id="upload-<%= id %>">
<div class="breadcrump list-row note"><%= breadcrump %></div>
<div class="list-header bb bt">
	<div class="list-column-2">
		<div class="list-column-2">
			<div class="inner">
				<span class="button add">
					<input type="file" name="file[]" value="" multiple="multiple"/>
				</span>	
				<span class="button remove disabled">
				</span>	
			</div>
		</div>
		<div class="list-column-2">
			<div class="inner">
				<span class="button start disabled">
				</span>	
				<span class="button cancel disabled">
				</span>	
			</div>
		</div>
	</div>
	<div class="list-column-2">
		<div class="inner">
			<div class="list-column-1">
				<span class="btn close last"></span>
			</div>	
		</div>
	</div>
</div>
<ul class="list-container" id="upload-container-<%= id %>">
	<li class="hidden">
		<input type="hidden" name="destination" value="<%= destination %>"/>
	</li>
</ul>
</li>
