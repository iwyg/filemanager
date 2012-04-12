define(function () {

	return {
		dirs:	'<li class="dir level-<%= directory.level %>"><span class="dir-header"><span class="dir-toggle"></span><span class="ui-icon"></span><label class="dir-label text"><%= directory.name %></label></span><%=contents%></li>',
		files:	'<li class="<%= cssclass %>" data-path="<%= path%>" data-size="<%= size%>"><span class="ui-icon"></span><span class="text"><%= file %></span></li>'
	};
});

