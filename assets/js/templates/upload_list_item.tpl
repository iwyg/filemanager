<li class="file-list list-row row bb" id="send-<%= id %>">
	<div class="list-column-4">
		<div class="inner">
			<span class="file-name">
				<% if (file === 'ok') { %>
				<a class="success" href="<%= src %>" ><%= name %></a>
				<% } %>
				<% if (file !== 'ok') { %>
				<%= name %>
				<% } %>
			</span>
		</div>
	</div>
	<div class="list-column-4">
		<div class="inner">
			<small class="file-size note"><%= size %></small>
		</div>
	</div>
	<div class="list-column-4">
		<div class="list-column-2">
			<div class="inner">
				<canvas width="36" height="36" class="progress last"></canvas>
			</div>
		</div>
		<div class="list-column-2">
			<div class="inner">
				<span class="progress-text note"></span>
			</div>
		</div>
	</div>
	<div class="list-column-4">
		<div class="inner">
			<span class="btn small remove last">remove</span>
			<span class="btn small cancel disabled last">cancel</span>
			<span class="btn small start last">start</span>
		</div>
	</div>
</li>

