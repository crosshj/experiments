import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component.ts';
import { TopBarComponent } from './top-bar/top-bar.component.ts';
import { ProductListComponent } from './product-list/product-list.component.ts';

@NgModule({
	imports: [
		BrowserModule,
		CommonModule,
		ReactiveFormsModule,
		RouterModule.forRoot([
			{ path: '', component: ProductListComponent },
		])
	],
	declarations: [
		AppComponent,
		TopBarComponent,
		ProductListComponent
	],
	bootstrap: [AppComponent],
	providers: []
})
export class AppModule {}
