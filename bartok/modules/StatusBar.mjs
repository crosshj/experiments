
let bar;
function StatusBar(){
	if (bar) {
		return bar;
	}
	const statusBar = document.createElement('div');
	statusBar.id = "status-bar";
	statusBar.innerHTML = `
	<style>
		#status-bar {
			position: absolute;
			bottom: 0;
			left: 0;
			right: 0;
			height: 22px;
			font-size: 12px;
			padding: 2px 10px;
			background: #1f476b;
		}
		#status-bar a {
			color: white;
			opacity: 0.65;
		}
		.statusbar-item.right a {
			margin-left: 10px;
		}
	</style>

	<div class="statusbar-item statusbar-entry left" statusbar-entry-priority="10000" statusbar-entry-alignment="0">
		<a title="">bartok v0.3</a>
	</div>

	<div class="statusbar-item right">
	 <div class="editor-statusbar-item">
		 <a class="editor-status-selection" title="Go to Line" style="">Ln XX, Col XX</a>
		 <a class="editor-status-indentation" title="Select Indentation" style="">Tab Size: 2</a>
		 <a class="editor-status-encoding hidden" title="Select Encoding" style="">UTF-8</a>
		 <a class="editor-status-eol hidden" title="Select End of Line Sequence" style="">LF</a>
		 <a class="editor-status-mode" title="Select Language Mode" style="">JavaScript</a>
		</div>
	</div>
	`;

	document.body.appendChild(statusBar);
}
export default StatusBar;