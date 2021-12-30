import * as THREE from 'three';
import * as utils from './utils';
// import { Container } from "@material-ui/core";
import { useState, useEffect, useRef, useContext } from 'react';
import { GLTFLoader, GLTF} from 'three/examples/jsm/loaders/GLTFLoader';

export interface SceneObject {
  update(delta: Number):void;
  remove():void;
  isActive: boolean;
}

export class Main {
  container: HTMLDivElement

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 100 );
  renderer = new THREE.WebGLRenderer({alpha: true});
  clock = new THREE.Clock();
  age = 0

  mixer: THREE.AnimationMixer | null = null;

  isActive = true;
  sceneObjects: SceneObject[] = [];

  static shared: Main = null!

  constructor(container: HTMLDivElement) {
    Main.shared = this;
    this.container = container;
    this.initThree();
    this.initObjects();

    this.update();
  }

  deinit() {
    this.renderer.domElement.remove();
    this.isActive = false;
  }

  initThree() {
    const {
      scene, camera, 
      renderer,
    } = this;

    camera.position.set(0, 2, 5);
    camera.lookAt(new THREE.Vector3(0, 2, 0));

    scene.add( camera );

    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.75);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.4);
    directionalLight.castShadow = true;
    directionalLight.position.set(0, 10, 10);
    directionalLight.target.position.set(0, 0, 0);

    scene.add(directionalLight);

    renderer.setClearColor("black", 0);
    const rect = this.container.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;

    this.container.appendChild( renderer.domElement );
  }

  initObjects() {
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );

    const mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);
  }

  update() {
    if (!this.isActive) {
      return;
    }

    requestAnimationFrame( this.update.bind(this) );

    const {
      renderer, scene, camera, clock
    } = this;

    const delta = clock.getDelta();
    this.age += delta;

    const cameraX = Math.sin(this.age * Math.PI * 2 / 6) * 0.7;
    camera.position.x = cameraX;
    camera.lookAt(new THREE.Vector3(0, 2, 0));

    for (let object of this.sceneObjects) {
      object.update(delta);
    }

    this.sceneObjects = this.sceneObjects.filter(obj => obj.isActive);
    
    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    this.renderer.setSize( window.innerWidth, window.innerHeight );
  }
}

export default function ThreeScene() {
  const containerRef = useRef<HTMLDivElement>(null!);
  const size = utils.useWindowSize();

  function init() {
    let main = new Main(containerRef.current);

    function onResize() {
      main.onResize();
    }

    window.addEventListener("resize", onResize);
    function deinit() {
      main.deinit();
      window.removeEventListener("resize", onResize);
    }
    return deinit;
  }

  useEffect(init, [])

  return (
    <div
      style={{
        ...size,
        position: "relative",
        zIndex: 0,
      } }
      ref={containerRef}
    ></div>
  );
}
