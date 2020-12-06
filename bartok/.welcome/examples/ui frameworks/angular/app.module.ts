import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { LocationStrategy } from '@angular/common';

import { AppComponent } from './app.component.ts';
import { TopBarComponent } from './top-bar/top-bar.component.ts';
import { ProductListComponent } from './product-list/product-list.component.ts';
import { ProductAlertsComponent } from './product-alerts/product-alerts.component.ts';
import { ProductDetailsComponent } from './product-details/product-details.component.ts';
import { CartComponent } from './cart/cart.component.ts';

import { CustomLocationStrategy } from './CustomLocationStrategy.ts';

const routes = [
	{ path: '', component: ProductListComponent },
	{ path: 'products/:id', component: ProductDetailsComponent },
	{ path: 'cart', component: CartComponent }
];

@NgModule({
	imports: [
		BrowserModule,
		CommonModule,
		ReactiveFormsModule,
		RouterModule.forRoot(routes),
	],
	declarations: [
		AppComponent,
		CartComponent,
		TopBarComponent,
		ProductListComponent,
		ProductAlertsComponent,
		ProductDetailsComponent,
	],
	bootstrap: [AppComponent],
	providers: [
		{ provide: LocationStrategy, useClass: CustomLocationStrategy },
	]
})
export class AppModule {}
