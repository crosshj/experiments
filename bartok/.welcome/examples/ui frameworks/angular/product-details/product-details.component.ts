import { Component, OnInit, forwardRef, Inject } from '@angular/core';
import { RouterModule, ActivatedRoute } from '@angular/router';

import { products } from './products.ts';
import { CartService } from './cart/cart.service.ts';

@Component({
	templateUrl: './product-details/product-details.component.html',
	styleUrls: ['./product-details/product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
	product;

	constructor(
		@Inject(forwardRef(() => ActivatedRoute)) private route: ActivatedRoute,
		@Inject(forwardRef(() => CartService)) private cartService: CartService
	) { }
	
	ngOnInit() {
		this.route.paramMap.subscribe(params => {
			this.product = products[+params.get('id')];
		});
	}

	addToCart(product) {
		this.cartService.addToCart(product);
		window.alert('Your product has been added to the cart!');
	}

}
