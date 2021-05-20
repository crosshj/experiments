export const html = (tag, content) => {
	const el = document.createElement(tag);
	el.innerHTML = content;
	document.body.append(el);
	return el;
};

export const [STYLE, DIV, PRE] = ['style', 'div', 'pre'].map(tag =>
	(content) => html(tag, content)
);

export const tabTrim = (x) => x.replace(/^[ \t]+/gm, '').trim()