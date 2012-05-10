<li class="dir new-dir level-<%= level %>">
	<span class="dir-header">
		<span class="dir-toggle"></span>
		<span class="ui-icon folder"></span>
		<div class="input">
			<input type="text" class="cr-new-dir" name="mkdir" placeholder="enter new directory name"/>
			<input type="hidden" name="in" value="<%= parent %>"/>
			<input type="hidden" name="type" value="create"/>
		</div>
		<div class="btns">
			<span class="btn small add last">ok</span>
			<span class="btn small cancel last">cancel</span>
		</div>
	</span>
</li>
