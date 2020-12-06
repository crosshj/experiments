/*

location strategy is overriden because preview needs base href to be ../../
however, angular does not need to do this and does not allow code to use custome base href otherwise

*/

import { Injectable } from '@angular/core';
import { HashLocationStrategy } from "@angular/common";

@Injectable()
export class CustomLocationStrategy extends HashLocationStrategy {
	prepareExternalUrl(internal: string): string {
		const url = document.location.href.split('#')[0] + '#' + internal;
		return url;
	}
}