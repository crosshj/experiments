export const Body = ({ todos=[], addTodo, check, reorder }) => {
	const add = (event) => {
		const inputText = document.getElementById('inputBox').value;
		addTodo(inputText);
		event.preventDefault();
	};

	const drop = (e) => {
		const item = e.dataTransfer.getData('text');
		e.dataTransfer.clearData();
		e.target.classList.remove('dragOver');
		const to = event.target.dataset.order;
		reorder({ item, order: Number(to) - 0.1});
	};

	const seperatorRowClass = ({ value }) => {
		if(!value) return '';
		const seperators = [
			'-----', '=====', '*****', '~~~~~', '#####'
		];
		const isSeperator = seperators.find(x => value.includes(x));
		return isSeperator
			? ' seperator'
			: '';
	};

	const spacer = {
		hidden: true,
		order: todos.length
	}

	return (
		<div class="todo-body">
			<div class="input-container">
					<form onSubmit={add}>
						<input id="inputBox" type="text" value="" autocomplete="off"/>
						<button onClick={add}>ADD</button>
					</form>
			</div>
			<ul>
				{[...(todos||[]), spacer].map((todo, i) => (
					<li
						data-order={todo.order}
						class={todo.status + seperatorRowClass(todo) + (todo.hidden ? ' invisible' : '')}
						draggable="true"
						onDragStart={ (e) => {
							e.dataTransfer
							 .setData('text/plain', todo.value);
						}}
						onDragOver={ (e) => {
							e.preventDefault();
							e.target.classList.add('dragOver');
						}}
						onDragLeave={ e => e.target.classList.remove('dragOver') }
						onDrop={drop}
						key={todo.value}
					>
						{ !todo.hidden && <input
							type="checkbox"
							droppable="false"
							defaultChecked={todo.status==="completed"}
							onChange={() => check(todo.value)}
						/> }
						<span
							droppable="false"
						>{todo.value}</span>
					</li>
				))}
			</ul>
		</div>
	);
};
