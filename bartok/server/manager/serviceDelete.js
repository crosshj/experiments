// TODO: use instanceKill

const deleteService = async ({ manager, arguments }) => {
	const { id, code, name } = arguments[1];
	const service = manager.services.find(x => Number(x.id) === Number(id));
	service.instance && service.instance.kill(); // maybe better to send a kill message and confirm death
	manager.services = manager.services.filter(x => x.id !== Number(id));
	return manager.services;
};
exports.deleteService = deleteService;
