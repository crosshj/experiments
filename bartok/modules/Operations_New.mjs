import { attachListeners } from './events/operations.mjs';

import { managementOp } from './operationsManagement.mjs';
import { externalStateRequest } from './ExternalState.mjs';
import {
    setCurrentService,
    getCurrentFile, getCurrentService,
    getCurrentFolder, setCurrentFolder,
    resetState
} from './state.mjs';
import {
    getOperations, getReadAfter, getUpdateAfter,
    performOperation, operationsListener
} from './operationsService.mjs'

async function Operations() {
    attachListeners({
        managementOp, externalStateRequest,
        getCurrentFile, getCurrentService,
        getCurrentFolder, setCurrentFolder,
        resetState,
        getOperations, getReadAfter, getUpdateAfter,
        performOperation, operationsListener
    });

    // APPLICATION STATE BOOTSTRAP
    const operations = getOperations((...args) => {
        console.log('bootstrap update after');
        console.log(args);
        //debugger;
    }, (...args) => {

        console.log('bootstrap read after');
        //console.log(args);
        const { result = {} } = args[0] || {};
        const services = result.result;

        //TODO: should really be firing a service read done event (or similar)
        const { filename: name } = setCurrentService(services[0]);
        const event = new CustomEvent('fileSelect', {
            bubbles: true,
            detail: { name }
        });
        document.body.dispatchEvent(event);
    });

    // TODO: this should go away at some point!!!
    // request a list of services from server (and determine if server is accessible)
    const foundOp = operations.find(x => x.name === 'read');
    //console.log({ foundOp });
    //await performOperation(foundOp, { body: { id: '' } }, externalStateRequest);

    const lastService = localStorage.getItem('lastService');
    //console.log({ lastService });
    await performOperation(foundOp, { body: { id: lastService ? Number(lastService) : "0" } }, externalStateRequest);

}

export default Operations;