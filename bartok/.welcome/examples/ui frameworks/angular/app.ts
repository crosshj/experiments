import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app.module.ts'

appendStyleSheet('./app.css')

appendStyleSheet('https://unpkg.com/material-design-icons@3.0.1/iconfont/material-icons.css');

enableProdMode();
document.body.append(htmlToElement(`<app-root />`));

//document.head.querySelector('base').href='./'
platformBrowserDynamic()
	.bootstrapModule(AppModule)
	.catch((err) => console.error(err));
