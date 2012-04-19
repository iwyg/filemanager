<% var breadcrump = path.split('/'); breadcrump.shift(); breadcrump = breadcrump.join(' > '); %>
<li id="upload-<%= id %>">
<div class="breadcrump list-row note bb"><%= breadcrump %></div>
<div class="list-header bb bt">
	<div class="list-column-2">
		<div class="list-column-2">
			<div class="inner">
				<span class="btn add">
					<input type="file" name="file[]" value="" multiple="multiple"/>
				</span>	
				<span class="btn remove disabled">
				</span>	
			</div>
		</div>
		<div class="list-column-2">
			<div class="inner">
				<span class="btn start disabled">
				</span>	
				<span class="btn cancel disabled">
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
