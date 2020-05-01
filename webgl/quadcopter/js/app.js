/*
  @author mrdoob / http://mrdoob.com/ <-- from http://threejs.org/editor/

  
  - matlab, quadcopter dynamics - http://andrew.gibiansky.com/blog/physics/quadcopter-dynamics/

  X translateOnAxis - http://math.hws.edu/eck/cs424/notes2013/15_Threejs_Intro.html

  - infinite floor - http://stackoverflow.com/questions/16346063/never-ending-floor-in-three-js-scene

  X camera / light follows quad (look at)

  - better shadows

  - position / rotation stats


 */

window.addEventListener( 'resize', onWindowResize, false );

var resetQuad = function(copter){
	copter.position.y = 250;
	copter.position.x = copter.position.z = 0;
	copter.rotation.x = copter.rotation.y = copter.rotation.z = 0;
}

var updateQuad = function(copter){
	var FORCE = 10;
	// delay	
	//if (new Date().getMilliseconds() < 900){ return; }
	
	// rotation cause by motor noise
	var randomRadians = (Math.floor(Math.random() * 3) - 1) * Math.PI / 180;
	copter.rotation.x+=randomRadians/5;	

	randomRadians = (Math.floor(Math.random() * 5) - 2) * Math.PI / 180;
	copter.rotation.y+=randomRadians/10;	

	randomRadians = (Math.floor(Math.random() * 3) - 1) * Math.PI / 180;
	copter.rotation.z+=randomRadians/5;	

	// force of rotors summed
	copter.translateOnAxis( new THREE.Vector3(0,1,0).normalize(), FORCE );
	
	// Gravity
	copter.position.y-=FORCE;

	camera.lookAt(quadcopter.position);
	light.target.position.x = copter.position.x;
	light.target.position.z = copter.position.z;
	light.target.updateMatrixWorld();

	if(copter.position.y < 0){ 
		resetQuad(copter) 
	}
}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

	//render();

}



var APP = {

	Player: function () {

		var loader = new THREE.ObjectLoader();
		window.camera, window.scene, window.renderer;

		var scripts = {};

		this.dom = undefined;

		this.width = 500;
		this.height = 500;

		this.load = function ( json ) {
			renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
			renderer.setPixelRatio( window.devicePixelRatio );
			
			camera = loader.parse( json.camera );
			scene = loader.parse( json.scene );

			// to antialias the shadow
			renderer.shadowMapType = THREE.PCFSoftShadowMap;
			renderer.shadowMapEnabled = true;
			renderer.shadowMapSoft = true;
			renderer.shadowMapAutoUpdate = true;

			//
			//controls = new THREE.OrbitControls(camera, renderer.domElement);
			//controls.addEventListener( 'change', renderer.render );
			//controls.target = new THREE.Vector3(0, 0, 0);

			scene.children.forEach(function(a,b,c){ 
				if (a instanceof THREE.Mesh && a.name == "Ground"){ 
					a.receiveShadow = true; 
				} 
				if (a instanceof THREE.SpotLight){ 
					window.light = a;
					a.castShadow = true; 
					//debugger;
					a.shadowCameraFov=100;
					a.shadowMapWidth=1024;
					a.shadowMapHeight=1024;
					//a.shadowCameraVisible=true //use for troubleshooting shadow map camera
				}
				if (a instanceof THREE.Group){ 
					a.children.forEach(function(item,b,c){ 
						if (!(item instanceof THREE.SpotLight)) { 
							item.castShadow = true;
						} 
					});
					a.castShadow = true; 
				}
			});
			//debugger;

			scripts = {
				keydown: [],
				keyup: [],
				mousedown: [],
				mouseup: [],
				mousemove: [],
				update: []
			};

			for ( var uuid in json.scripts ) {

				var object = scene.getObjectByProperty( 'uuid', uuid, true );

				var sources = json.scripts[ uuid ];

				for ( var i = 0; i < sources.length; i ++ ) {

					var script = sources[ i ];

					var events = ( new Function( 'player', 'scene', 'keydown', 'keyup', 'mousedown', 'mouseup', 'mousemove', 'update', script.source + '\nreturn { keydown: keydown, keyup: keyup, mousedown: mousedown, mouseup: mouseup, mousemove: mousemove, update: update };' ).bind( object ) )( this, scene );

					for ( var name in events ) {

						if ( events[ name ] === undefined ) continue;

						if ( scripts[ name ] === undefined ) {

							console.warn( 'APP.Player: event type not supported (', name, ')' );
							continue;

						}

						scripts[ name ].push( events[ name ].bind( object ) );

					}

				}

			}

			this.dom = renderer.domElement;

		};

		this.setCamera = function ( value ) {

			camera = value;
			camera.aspect = this.width / this.height;
			camera.updateProjectionMatrix();

		};

		this.setSize = function ( width, height ) {

			this.width = width;
			this.height = height;

			camera.aspect = this.width / this.height;
			camera.updateProjectionMatrix();

			renderer.setSize( width, height );

		};

		var dispatch = function ( array, event ) {

			for ( var i = 0, l = array.length; i < l; i ++ ) {

				array[ i ]( event );

			}

		};

		var request;

		var animate = function ( time ) {

			updateQuad(quadcopter);

			request = requestAnimationFrame( animate );

			dispatch( scripts.update, { time: time } );

			renderer.render( scene, camera );

		};

		this.play = function () {

			document.addEventListener( 'keydown', onDocumentKeyDown );
			document.addEventListener( 'keyup', onDocumentKeyUp );
			document.addEventListener( 'mousedown', onDocumentMouseDown );
			document.addEventListener( 'mouseup', onDocumentMouseUp );
			document.addEventListener( 'mousemove', onDocumentMouseMove );

			request = requestAnimationFrame( animate );

		};

		this.stop = function () {

			document.removeEventListener( 'keydown', onDocumentKeyDown );
			document.removeEventListener( 'keyup', onDocumentKeyUp );
			document.removeEventListener( 'mousedown', onDocumentMouseDown );
			document.removeEventListener( 'mouseup', onDocumentMouseUp );
			document.removeEventListener( 'mousemove', onDocumentMouseMove );

			cancelAnimationFrame( request );

		};

		//

		var onDocumentKeyDown = function ( event ) {

			dispatch( scripts.keydown, event );

		};

		var onDocumentKeyUp = function ( event ) {

			dispatch( scripts.keyup, event );

		};

		var onDocumentMouseDown = function ( event ) {

			dispatch( scripts.mousedown, event );

		};

		var onDocumentMouseUp = function ( event ) {

			dispatch( scripts.mouseup, event );

		};

		var onDocumentMouseMove = function ( event ) {

			dispatch( scripts.mousemove, event );

		};

	}

};
