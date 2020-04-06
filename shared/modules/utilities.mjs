function codemirrorModeFromFileType(fileType){
	const conversions = {
		typescript: { name: 'javascript', typescript: true },
		react: 'jsx',
		svg: 'xml',
		html: {
			name: 'htmlmixed',
			tags: {
				style: [["type", /^text\/(x-)?scss$/, "text/x-scss"],
								[null, null, "css"]],
				custom: [[null, null, "customMode"]]
			}
		},
		sass: { name: 'css', mimeType: 'text/x-scss' },
		less: { name: 'css', mimeType: 'text/x-less' },
		image: { name  : 'default' },
		bat: { name: 'default' },
		json: { name: 'javascript', json: true }
	};
	console.log({ fileType, conversions: conversions[fileType] });
	return conversions[fileType] || fileType;
}

export {
	codemirrorModeFromFileType
};